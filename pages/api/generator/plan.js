import { planSiteSpec } from "../../../lib/generator/openrouter";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { prompt, mode, style } = req.body || {};
		if (!prompt || !String(prompt).trim()) {
			return res.status(400).json({ error: "prompt is required" });
		}

		const result = await planSiteSpec({
			prompt: String(prompt).trim().slice(0, 1200),
			mode: mode === "frontend" ? "frontend" : "fullstack",
			style: String(style || "").trim().slice(0, 240),
		});

		return res.status(200).json({
			spec: result.spec,
			source: result.source,
			model: result.model || null,
			reason: result.reason || null,
		});
	} catch (error) {
		console.error("generator/plan:", error);
		return res.status(500).json({
			error: error.message || "Failed to plan site",
		});
	}
}
