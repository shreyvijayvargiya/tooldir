import { publishSubmissionAsTool } from "../../../lib/api/directoryTools";
import {
	getAllToolSubmissions,
	updateToolSubmission,
} from "../../../lib/api/toolSubmissions";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { submissionId } = req.body;

		if (!submissionId) {
			return res.status(400).json({ error: "submissionId is required" });
		}

		const submissions = await getAllToolSubmissions();
		const submission = submissions.find((s) => s.id === submissionId);

		if (!submission) {
			return res.status(404).json({ error: "Submission not found" });
		}

		if (submission.status === "listed") {
			return res.status(400).json({ error: "Already listed on website" });
		}

		const tool = await publishSubmissionAsTool(submission);

		await updateToolSubmission(submissionId, {
			status: "listed",
			directoryToolId: tool.id,
		});

		return res.status(200).json({ success: true, tool });
	} catch (error) {
		console.error("Error publishing tool:", error);
		return res.status(500).json({
			error: error.message || "Failed to publish tool",
		});
	}
}
