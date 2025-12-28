import fs from "fs";
import path from "path";

/**
 * Generate AST (Abstract Syntax Tree) representation of the codebase
 * @param {string} dirPath - Directory path to scan
 * @param {Array<string>} excludeFiles - Files/folders to exclude
 * @param {string} basePath - Base path for relative paths
 * @returns {Object} AST tree structure
 */
function generateAST(dirPath, excludeFiles = [], basePath = null) {
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
		if (relativePath.startsWith(exclude + path.sep) || relativePath.startsWith(exclude + "/")) {
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
		const children = [];
		
		try {
			const entries = fs.readdirSync(dirPath);
			
			for (const entry of entries) {
				const entryPath = path.join(dirPath, entry);
				const childAST = generateAST(entryPath, excludeFiles, basePath);
				
				if (childAST !== null) {
					children.push(childAST);
				}
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
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { excludeFiles = [] } = req.body;

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

		// Merge default excludes with user-provided excludes
		const allExcludes = [...defaultExcludes, ...excludeFiles];

		// Get the project root directory (one level up from pages/api)
		const projectRoot = path.join(process.cwd());

		// Generate AST starting from project root
		const ast = generateAST(projectRoot, allExcludes);

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
		return res.status(500).json({
			error: "Failed to generate AST",
			message: error.message,
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

