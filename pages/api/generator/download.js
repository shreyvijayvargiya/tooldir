import { createGeneratorZip } from "../../../lib/generator/createZip";
import { isValidSiteSpec, normalizeSiteSpec } from "../../../lib/generator/schema";
import { resolveProAccess } from "../../../lib/generator/proAccess";

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "2mb",
		},
	},
};

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { spec: rawSpec, email, proKey, mode } = req.body || {};
		const access = await resolveProAccess({ email, proKey });
		if (!access.allowed) {
			return res.status(403).json({
				error: "PRO required to download generated repositories",
				reason: access.reason,
				buyUrl:
					"https://shreyvijayvargiya.gumroad.com/l/nextjs-supabase-directory-boilerplate?layout=profile",
			});
		}

		const spec = normalizeSiteSpec(rawSpec || {}, {
			mode: mode || rawSpec?.mode || "fullstack",
		});
		if (!isValidSiteSpec(spec)) {
			return res.status(400).json({ error: "Invalid SiteSpec" });
		}

		const { buffer, filename } = await createGeneratorZip(spec);

		res.setHeader("Content-Type", "application/zip");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${filename}"`
		);
		res.setHeader("Cache-Control", "no-store");
		return res.status(200).send(buffer);
	} catch (error) {
		console.error("generator/download:", error);
		return res.status(500).json({
			error: error.message || "Failed to create download",
		});
	}
}
