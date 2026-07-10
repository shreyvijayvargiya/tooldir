import { createToolSubmission } from "../../../lib/api/toolSubmissions";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const {
			name,
			website,
			description,
			tags,
			logoUrl,
			screenshotUrl,
			badgeVerified,
			launchDate,
			slotLabel,
			slotPrice,
			slotIsPaid,
			submitterEmail,
		} = req.body;

		if (!name || !website || !description) {
			return res.status(400).json({ error: "Name, website, and description are required" });
		}

		const submission = await createToolSubmission({
			name,
			website,
			description,
			tags: tags || [],
			logoUrl,
			screenshotUrl,
			badgeVerified,
			launchDate,
			slotLabel,
			slotPrice,
			slotIsPaid,
			submitterEmail,
		});

		return res.status(201).json({ success: true, submission });
	} catch (error) {
		console.error("Error creating tool submission:", error);
		return res.status(500).json({
			error: error.message || "Failed to create submission",
		});
	}
}
