import {
	uploadImageFromDataUrl,
	uploadBlogContentImage,
} from "../../../lib/api/storage";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { fileBase64, fileName, mimeType, blogId, type = "content" } = req.body;

		if (!fileBase64) {
			return res.status(400).json({ error: "fileBase64 is required" });
		}

		const dataUrl = fileBase64.startsWith("data:")
			? fileBase64
			: `data:${mimeType || "image/png"};base64,${fileBase64}`;

		let publicUrl;

		if (type === "banner") {
			const folder = blogId ? `blogs/${blogId}` : "blogs/banners";
			const result = await uploadImageFromDataUrl(dataUrl, folder, { fileName });
			publicUrl = result.publicUrl;
		} else if (blogId) {
			publicUrl = await uploadBlogContentImage(
				await (await fetch(dataUrl)).blob(),
				blogId
			);
		} else {
			const result = await uploadImageFromDataUrl(dataUrl, "blogs/content", { fileName });
			publicUrl = result.publicUrl;
		}

		return res.status(200).json({ success: true, publicUrl });
	} catch (error) {
		console.error("Storage upload error:", error);
		return res.status(500).json({
			error: error.message || "Failed to upload image",
		});
	}
}
