import { resolveProAccess } from "../../../lib/generator/proAccess";

/** Lightweight PRO status for the generate UI */
export default async function handler(req, res) {
	if (req.method !== "GET" && req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const email =
		req.method === "GET" ? req.query.email : req.body?.email;
	const proKey =
		req.method === "GET" ? req.query.proKey : req.body?.proKey;

	const access = await resolveProAccess({ email, proKey });
	return res.status(200).json({
		allowed: access.allowed,
		reason: access.reason,
		buyUrl:
			"https://shreyvijayvargiya.gumroad.com/l/nextjs-supabase-directory-boilerplate?layout=profile",
	});
}
