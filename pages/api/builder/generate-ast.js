import fs from "fs";
import path from "path";
import { getFilesForModules } from "../../../lib/config/modules-config";

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

	// Exclude lib/utils/polar unless payments module is selected
	const normalizedPath = relativePath.replace(/\\/g, "/");
	const isPolarUtils = normalizedPath.startsWith("lib/utils/polar");
	if (isPolarUtils && !selectedModules.includes("payments")) {
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
		"lib/utils", // Entire utils directory (excludes polar subdirectory unless payments selected)
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
		// e.g., moduleFile: "lib/utils/polar" should match "lib/utils/polar/constants.js"
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
 * Generate AST (Abstract Syntax Tree) representation of the codebase
 * @param {string} dirPath - Directory path to scan
 * @param {Array<string>} excludeFiles - Files/folders to exclude
 * @param {string} basePath - Base path for relative paths
 * @param {Array<string>} moduleFilesToInclude - Files to include based on modules
 * @returns {Object} AST tree structure
 */
function generateAST(
	dirPath,
	excludeFiles = [],
	basePath = null,
	moduleFilesToInclude = [],
	selectedModules = []
) {
	if (!basePath) {
		basePath = dirPath;
	}

	const stats = fs.statSync(dirPath);
	const relativePath = path.relative(basePath, dirPath);
	const name = path.basename(dirPath);

	// Check if this file/folder should be excluded
	const shouldExclude = excludeFiles.some((exclude) => {
		// Check exact match
		if (relativePath === exclude || name === exclude) {
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
			return regex.test(relativePath) || regex.test(name);
		}
		return false;
	});

	if (shouldExclude) {
		return null;
	}

	// If it's a file, return file info
	if (stats.isFile()) {
		// If modules are selected, check if this file should be included
		if (
			moduleFilesToInclude.length > 0 &&
			!shouldIncludeFile(
				relativePath,
				moduleFilesToInclude,
				false,
				selectedModules
			)
		) {
			return null;
		}
		try {
			const content = fs.readFileSync(dirPath, "utf-8");
			const size = stats.size;
			const extension = path.extname(name);
			const lines = content.split("\n").length;

			return {
				type: "file",
				name: name,
				path: relativePath,
				size: size,
				extension: extension,
				lines: lines,
				// Don't include full content in AST to keep it lightweight
				// Content can be fetched separately if needed
			};
		} catch (error) {
			// If file can't be read (binary, etc.), return basic info
			return {
				type: "file",
				name: name,
				path: relativePath,
				size: stats.size,
				extension: path.extname(name),
				lines: 0,
				error: "Cannot read file",
			};
		}
	}

	// If it's a directory, recursively scan children
	if (stats.isDirectory()) {
		// If modules are selected, check if this directory should be included
		// (directories are included if they contain module files)
		if (
			moduleFilesToInclude.length > 0 &&
			!shouldIncludeFile(
				relativePath,
				moduleFilesToInclude,
				true,
				selectedModules
			)
		) {
			return null;
		}

		const children = [];

		try {
			const entries = fs.readdirSync(dirPath);

			for (const entry of entries) {
				const entryPath = path.join(dirPath, entry);
				const childAST = generateAST(
					entryPath,
					excludeFiles,
					basePath,
					moduleFilesToInclude,
					selectedModules
				);

				if (childAST !== null) {
					children.push(childAST);
				}
			}

			// If directory has no children after filtering, exclude it
			if (children.length === 0 && moduleFilesToInclude.length > 0) {
				return null;
			}

			// Sort: directories first, then files, both alphabetically
			children.sort((a, b) => {
				if (a.type !== b.type) {
					return a.type === "directory" ? -1 : 1;
				}
				return a.name.localeCompare(b.name);
			});
		} catch (error) {
			console.error(`Error reading directory ${dirPath}:`, error);
		}

		return {
			type: "directory",
			name: name,
			path: relativePath,
			children: children,
			fileCount: countFiles(children),
			lineCount: countLines(children),
		};
	}

	return null;
}

/**
 * Count total files in AST tree
 */
function countFiles(node) {
	if (node.type === "file") {
		return 1;
	}
	if (node.type === "directory" && node.children) {
		return node.children.reduce((sum, child) => sum + countFiles(child), 0);
	}
	return 0;
}

/**
 * Count total lines in AST tree
 */
function countLines(node) {
	if (node.type === "file") {
		return node.lines || 0;
	}
	if (node.type === "directory" && node.children) {
		return node.children.reduce((sum, child) => sum + countLines(child), 0);
	}
	return 0;
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { excludeFiles = [], selectedModules = [] } = req.body;

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
			try {
				const moduleFiles = getFilesForModules(selectedModules);
				// Flatten all module files into a single array
				moduleFilesToInclude = [
					...moduleFiles.admin,
					...moduleFiles.pages,
					...moduleFiles.api,
					...moduleFiles.utils,
				];
				console.log(`Selected modules: ${selectedModules.join(", ")}`);
				console.log(
					`Module files to include: ${moduleFilesToInclude.length} files`
				);
			} catch (error) {
				console.error("Error getting module files:", error);
				// Continue with empty array - will include all files
			}
		}

		// Merge default excludes with user-provided excludes
		const allExcludes = [...defaultExcludes, ...excludeFiles];

		// Get the project root directory (one level up from pages/api)
		const projectRoot = path.join(process.cwd());

		// Generate AST starting from project root
		const ast = generateAST(
			projectRoot,
			allExcludes,
			null,
			moduleFilesToInclude,
			selectedModules || []
		);

		if (!ast) {
			return res.status(500).json({ error: "Failed to generate AST" });
		}

		// Set root name to project name or "root"
		if (ast.path === "") {
			ast.name = path.basename(projectRoot) || "root";
		}

		// Add summary statistics
		const summary = {
			totalFiles: countFiles(ast),
			totalLines: countLines(ast),
			totalDirectories: countDirectories(ast),
			generatedAt: new Date().toISOString(),
		};

		return res.status(200).json({
			success: true,
			ast: ast,
			summary: summary,
			excluded: allExcludes,
		});
	} catch (error) {
		console.error("Error generating AST:", error);
		console.error("Error stack:", error.stack);
		return res.status(500).json({
			error: "Failed to generate AST",
			message: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
}

/**
 * Count total directories in AST tree
 */
function countDirectories(node) {
	if (node.type === "directory") {
		let count = 1; // Count this directory
		if (node.children) {
			count += node.children.reduce(
				(sum, child) => sum + countDirectories(child),
				0
			);
		}
		return count;
	}
	return 0;
}
