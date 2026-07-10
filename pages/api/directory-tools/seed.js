import { seedDirectoryTools } from "../../../lib/api/directoryTools";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const result = await seedDirectoryTools();
		return res.status(200).json(result);
	} catch (error) {
		console.error("Error seeding directory tools:", error);
		return res.status(500).json({
			error: error.message || "Failed to seed tools",
		});
	}
}
