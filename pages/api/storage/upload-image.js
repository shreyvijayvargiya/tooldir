import {
	uploadImageFromDataUrl,
	uploadBlogContentImage,
	STORAGE_BUCKET,
} from "../../../lib/api/storage";
import { isSupabaseConfigured } from "../../../lib/config/supabase";

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "8mb",
		},
	},
};

/**
 * Upload blog / TipTap images to Supabase Storage.
 * Bucket: `saas-starter-storage`
 *
 * Body (JSON):
 * { fileBase64, fileName?, mimeType?, blogId?, type?: "content" | "banner" }
 */
export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	if (!isSupabaseConfigured()) {
		return res.status(500).json({
			error: "Supabase is not configured",
			bucket: STORAGE_BUCKET,
		});
	}

	try {
		const {
			fileBase64,
			fileName,
			mimeType,
			blogId = null,
			type = "content",
		} = req.body || {};

		if (!fileBase64) {
			return res.status(400).json({
				error: "fileBase64 is required",
				bucket: STORAGE_BUCKET,
			});
		}

		const dataUrl = fileBase64.startsWith("data:")
			? fileBase64
			: `data:${mimeType || "image/png"};base64,${fileBase64}`;

		let publicUrl;

		if (type === "banner") {
			const folder = blogId ? `blogs/${blogId}` : "blogs/banners";
			const result = await uploadImageFromDataUrl(dataUrl, folder, {
				fileName,
			});
			publicUrl = result.publicUrl;
		} else {
			const response = await fetch(dataUrl);
			const blob = await response.blob();
			publicUrl = await uploadBlogContentImage(blob, blogId);
		}

		return res.status(200).json({
			success: true,
			publicUrl,
			bucket: STORAGE_BUCKET,
		});
	} catch (error) {
		console.error("Storage upload error:", error);
		return res.status(500).json({
			error: error.message || "Failed to upload image",
			bucket: STORAGE_BUCKET,
		});
	}
}
