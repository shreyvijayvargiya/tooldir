import fs from "fs";
import path from "path";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { filePath } = req.body;

		if (!filePath) {
			return res.status(400).json({ error: "File path is required" });
		}

		// Get the project root directory
		const projectRoot = path.join(process.cwd());
		const fullPath = path.join(projectRoot, filePath);

		// Security: Ensure the file is within the project root
		const resolvedPath = path.resolve(fullPath);
		const resolvedRoot = path.resolve(projectRoot);
		
		if (!resolvedPath.startsWith(resolvedRoot)) {
			return res.status(403).json({ error: "Access denied" });
		}

		// Check if file exists
		if (!fs.existsSync(resolvedPath)) {
			return res.status(404).json({ error: "File not found" });
		}

		// Check if it's actually a file (not a directory)
		const stats = fs.statSync(resolvedPath);
		if (!stats.isFile()) {
			return res.status(400).json({ error: "Path is not a file" });
		}

		// Check file size (limit to 1MB to avoid memory issues)
		if (stats.size > 1024 * 1024) {
			return res.status(413).json({ error: "File too large (max 1MB)" });
		}

		// Read file content
		const content = fs.readFileSync(resolvedPath, "utf-8");
		const extension = path.extname(filePath);
		
		// Determine language from extension
		const languageMap = {
			".js": "javascript",
			".jsx": "jsx",
			".ts": "typescript",
			".tsx": "tsx",
			".json": "json",
			".css": "css",
			".html": "html",
			".md": "markdown",
			".py": "python",
			".java": "java",
			".go": "go",
			".rs": "rust",
			".php": "php",
			".rb": "ruby",
			".sql": "sql",
			".sh": "bash",
			".yaml": "yaml",
			".yml": "yaml",
			".xml": "xml",
		};

		const language = languageMap[extension] || "text";

		return res.status(200).json({
			success: true,
			content,
			language,
			path: filePath,
			size: stats.size,
			lines: content.split("\n").length,
		});
	} catch (error) {
		console.error("Error reading file:", error);
		return res.status(500).json({
			error: "Failed to read file",
			message: error.message,
		});
	}
}

