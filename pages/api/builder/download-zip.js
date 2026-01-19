import fs from "fs";
import path from "path";
import archiver from "archiver";
import { getFilesForModules } from "../../../lib/config/modules-config";
import {
	generateFooter,
	generateBlogPage,
	generateSearchModal,
} from "../../../lib/config/generate-core-components";

/**
 * Check if a file/folder should be excluded
 */
function shouldExclude(filePath, relativePath, excludeFiles) {
	return excludeFiles.some((exclude) => {
		// Check exact match
		if (relativePath === exclude || path.basename(filePath) === exclude) {
			return true;
		}
		// Check if path starts with exclude pattern
		if (
			relativePath.startsWith(exclude + path.sep) ||
			relativePath.startsWith(exclude + "/")
		) {
			return true;
		}
		// Check if it's a glob pattern (simple wildcard)
		if (exclude.includes("*")) {
			const pattern = exclude.replace(/\*/g, ".*");
			const regex = new RegExp(`^${pattern}$`);
			return regex.test(relativePath) || regex.test(path.basename(filePath));
		}
		return false;
	});
}

/**
 * Check if a file should be included based on module selection
 * @param {string} relativePath - Relative path of the file/directory
 * @param {Array<string>} moduleFilesToInclude - List of module files to include
 * @param {boolean} isDirectory - Whether this is a directory
 * @returns {boolean} - Whether the file/directory should be included
 */
function shouldIncludeFile(
	relativePath,
	moduleFilesToInclude,
	isDirectory = false,
	selectedModules = []
) {
	// If no modules selected, include all files
	if (!moduleFilesToInclude || moduleFilesToInclude.length === 0) {
		return true;
	}

	// Exclude lib/utils/Stripe unless payments module is selected
	const normalizedPath = relativePath.replace(/\\/g, "/");
	const isStripeUtils = normalizedPath.startsWith("lib/utils/getStripe");
	if (isStripeUtils && !selectedModules.includes("payments")) {
		return false;
	}

	// Always include core files and directories (not module-specific)
	const coreFiles = [
		"package.json",
		"next.config.js",
		"tailwind.config.js",
		"postcss.config.js",
		"pages/_app.js",
		"pages/_document.js",
		"pages/404.js",
		"pages/index.js",
		"pages/features.js",
		"pages/docs.js",
		"pages/admin/index.js", // Admin route entry point
		"app/components", // Entire components directory (Navbar, Footer)
		"app/admin/index.jsx", // Admin panel entry point (will be generated)
		"app/admin/components/SearchModal.jsx", // Shared admin component
		"lib/api/supabase.js",
		"lib/api/auth.js", // Core auth API (used by Navbar, LoginModal, admin)
		"lib/api/users.js", // Core users API (used by hooks and core components)
		"lib/api/customers.js", // Core customers API (used by hooks)
		"lib/api/upload.js", // Core upload API (used by blog module for image uploads)
		"lib/config", // Entire config directory (seo.js, roles-config.js, modules-config.js)
		"lib/modules", // Entire modules directory (SEO.jsx)
		"lib/store",
		"lib/ui",
		"lib/utils", // Entire utils directory (excludes Stripe subdirectory unless payments selected)
		"lib/hooks", // Entire hooks directory (useSubscription.js)
		"styles",
		"public",
		"supabase-migrations.sql",
		"scripts", // Seed scripts
	];

	// Check if it's a core file
	const isCoreFile = coreFiles.some((core) => {
		return (
			relativePath === core ||
			relativePath.startsWith(core + path.sep) ||
			relativePath.startsWith(core + "/")
		);
	});

	if (isCoreFile) {
		return true;
	}

	// For directories, check if any child files match module files
	if (isDirectory) {
		const pathSep = path.sep;

		// Root directory - always include (we'll filter children)
		if (relativePath === "") {
			return true;
		}

		// Normalize paths for comparison
		const normalizedDirPath = relativePath.replace(/\\/g, "/");
		const normalizedDirPathWithSep = normalizedDirPath + "/";

		// Check if any module file is inside this directory
		return moduleFilesToInclude.some((moduleFile) => {
			const normalizedModuleFile = moduleFile.replace(/\\/g, "/");

			// Check if module file is inside this directory
			return (
				normalizedModuleFile.startsWith(normalizedDirPathWithSep) ||
				normalizedModuleFile.startsWith(normalizedDirPath + pathSep) ||
				normalizedModuleFile === normalizedDirPath ||
				normalizedModuleFile.startsWith(normalizedDirPath + "/")
			);
		});
	}

	// For files, check if it's in module files list
	const pathSep = path.sep;
	return moduleFilesToInclude.some((moduleFile) => {
		// Normalize paths for comparison
		const normalizedModuleFile = moduleFile.replace(/\\/g, "/");
		const normalizedRelativePath = relativePath.replace(/\\/g, "/");

		// Exact match
		if (normalizedRelativePath === normalizedModuleFile) {
			return true;
		}

		// Check if path starts with module file path (for nested files)
		if (
			normalizedRelativePath.startsWith(normalizedModuleFile + "/") ||
			normalizedRelativePath.startsWith(normalizedModuleFile + pathSep)
		) {
			return true;
		}

		// Check if module file is a directory and this file is inside it
		if (
			normalizedModuleFile.endsWith("/") &&
			normalizedRelativePath.startsWith(normalizedModuleFile)
		) {
			return true;
		}

		// Check if module file path is a parent directory of this file
		// e.g., moduleFile: "lib/utils/Stripe" should match "lib/utils/Stripe/constants.js"
		const moduleDir = normalizedModuleFile.endsWith("/")
			? normalizedModuleFile.slice(0, -1)
			: normalizedModuleFile;
		if (normalizedRelativePath.startsWith(moduleDir + "/")) {
			return true;
		}

		return false;
	});
}

/**
 * Recursively add files to zip archive
 */
function addToZip(
	archive,
	dirPath,
	basePath,
	excludeFiles,
	moduleFilesToInclude = [],
	selectedModules = [],
	generatedFiles = {}
) {
	try {
		const entries = fs.readdirSync(dirPath);

		for (const entry of entries) {
			const entryPath = path.join(dirPath, entry);
			const relativePath = path.relative(basePath, entryPath);
			const stats = fs.statSync(entryPath);

			// Skip if should be excluded
			if (shouldExclude(entryPath, relativePath, excludeFiles)) {
				continue;
			}

			if (stats.isDirectory()) {
				// Check if directory should be included (if it contains module files)
				if (
					moduleFilesToInclude.length > 0 &&
					!shouldIncludeFile(
						relativePath,
						moduleFilesToInclude,
						true,
						selectedModules
					)
				) {
					continue;
				}

				// Recursively add directory contents
				addToZip(
					archive,
					entryPath,
					basePath,
					excludeFiles,
					moduleFilesToInclude,
					selectedModules,
					generatedFiles
				);
			} else if (stats.isFile()) {
				// Skip files that we're generating dynamically
				if (generatedFiles[relativePath]) {
					// Skip - we'll add the generated one instead
					continue;
				}

				// Check if file should be included
				if (
					moduleFilesToInclude.length > 0 &&
					!shouldIncludeFile(
						relativePath,
						moduleFilesToInclude,
						false,
						selectedModules
					)
				) {
					continue;
				}

				// Add file to archive
				archive.file(entryPath, { name: relativePath });
			}
		}
	} catch (error) {
		console.error(`Error processing ${dirPath}:`, error);
	}
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const {
			excludeFiles = [],
			projectName = "saas-starter",
			selectedModules = [],
		} = req.body;

		// Default exclusions (always applied)
		const defaultExcludes = [
			"node_modules",
			".next",
			".git",
			".vscode",
			".idea",
			"dist",
			"build",
			"coverage",
			".env",
			".env.local",
			".env.*.local",
			"*.log",
			".DS_Store",
			"Thumbs.db",
			"package-lock.json",
			"yarn.lock",
			".yarn",
			".pnp",
			".pnp.js",
		];

		// Get files to include based on selected modules
		let moduleFilesToInclude = [];
		if (selectedModules && selectedModules.length > 0) {
			const moduleFiles = getFilesForModules(selectedModules);
			// Flatten all module files into a single array
			moduleFilesToInclude = [
				...moduleFiles.admin,
				...moduleFiles.pages,
				...moduleFiles.api,
				...moduleFiles.utils,
			];
		}

		// Merge default excludes with user-provided excludes
		const allExcludes = [...defaultExcludes, ...excludeFiles];

		// Get the project root directory
		const projectRoot = path.join(process.cwd());

		// Set headers for file download
		const zipFileName = `${projectName}-${Date.now()}.zip`;
		res.setHeader("Content-Type", "application/zip");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${zipFileName}"`
		);

		// Create archive
		const archive = archiver("zip", {
			zlib: { level: 9 }, // Maximum compression
		});

		// Handle archive errors
		archive.on("error", (err) => {
			console.error("Archive error:", err);
			if (!res.headersSent) {
				res.status(500).json({ error: "Failed to create zip file" });
			}
		});

		// Pipe archive data to response
		archive.pipe(res);

		// Generate core components dynamically based on selected modules
		// Always generate Footer and SearchModal to remove unused imports
		let generatedFiles = {};
		try {
			// Always generate Footer (removes newsletter section if subscribers not selected)
			generatedFiles["app/components/Footer.jsx"] = generateFooter(
				selectedModules || []
			);

			// Always generate SearchModal (filters based on selected modules)
			generatedFiles["app/admin/components/SearchModal.jsx"] =
				generateSearchModal(selectedModules || []);

			// Generate admin/index.jsx if any modules selected
			if (selectedModules && selectedModules.length > 0) {
				const {
					generateAdminIndex,
				} = require("../../../lib/config/generate-admin-index");
				generatedFiles["app/admin/index.jsx"] =
					generateAdminIndex(selectedModules);
			}

			// Generate blog.js if blog module is selected (removes subscribers import)
			if (selectedModules && selectedModules.includes("blog")) {
				generatedFiles["pages/blog.js"] = generateBlogPage(selectedModules);
			}
		} catch (error) {
			console.error("Error generating components:", error);
			// Continue with original files if generation fails
		}

		// Add files to archive
		addToZip(
			archive,
			projectRoot,
			projectRoot,
			allExcludes,
			moduleFilesToInclude,
			selectedModules,
			generatedFiles
		);

		// Add all generated files to archive
		Object.entries(generatedFiles).forEach(([filePath, content]) => {
			archive.append(content, { name: filePath });
		});

		// Finalize the archive
		await archive.finalize();
	} catch (error) {
		console.error("Error creating zip file:", error);
		if (!res.headersSent) {
			return res.status(500).json({
				error: "Failed to create zip file",
				message: error.message,
			});
		}
	}
}
