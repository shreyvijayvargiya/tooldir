import { supabase } from '../../../../lib/config/supabase';

/**
 * Upload a file to Supabase Storage and return the public URL
 * Stripe products require image URLs, not file uploads
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type (e.g., 'image/png')
 * @returns {Promise<string>} Public URL from Supabase Storage
 */
export async function uploadFileToStorage(
	fileBuffer,
	fileName,
	mimeType
) {
	try {
		// Validate inputs
		if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
			throw new Error("fileBuffer must be a valid Buffer");
		}
		if (fileBuffer.length === 0) {
			throw new Error("fileBuffer cannot be empty");
		}
		if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
			throw new Error("fileName must be a non-empty string");
		}
		if (!mimeType || typeof mimeType !== "string" || mimeType.trim() === "") {
			throw new Error("mimeType must be a non-empty string");
		}

		// Create a unique path for the file
		const timestamp = Date.now();
		const randomId = Math.random().toString(36).substring(2, 9);
		const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
		// Use the correct path structure as seen in upload.js examples if relevant
		// 'products' folder seems appropriate for this feature
		const filePath = `products/${timestamp}-${randomId}-${sanitizedFileName}`;

		// Upload to Supabase Storage using 'saas-starter-storage' bucket
		const { data, error } = await supabase.storage
			.from('saas-starter-storage')
			.upload(filePath, fileBuffer, {
				contentType: mimeType,
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			throw error;
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('saas-starter-storage')
			.getPublicUrl(data.path);

		return urlData.publicUrl;
	} catch (error) {
		console.error("Error uploading file to Supabase Storage:", error);
		throw error;
	}
}

/**
 * Convert base64 string to Buffer
 * @param {string} base64String - Base64 string (may include data URL prefix)
 * @returns {Buffer} File buffer
 */
export function base64ToBuffer(base64String) {
	// Remove data URL prefix if present (e.g., "data:image/png;base64,...")
	const base64Data = base64String.includes(",")
		? base64String.split(",")[1]
		: base64String;
	return Buffer.from(base64Data, "base64");
}

/**
 * Get MIME type from base64 data URL or file extension
 * @param {string} base64String - Base64 string (may include data URL prefix)
 * @param {string} fileName - Optional file name for extension-based detection
 * @returns {string} MIME type
 */
export function getMimeType(base64String, fileName = null) {
	// Try to extract from data URL
	if (base64String.includes("data:")) {
		const mimeMatch = base64String.match(/data:([^;]+)/);
		if (mimeMatch) {
			return mimeMatch[1];
		}
	}

	// Fallback to extension-based detection
	if (fileName) {
		const ext = fileName.split(".").pop()?.toLowerCase();
		const mimeTypes = {
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			gif: "image/gif",
			webp: "image/webp",
			svg: "image/svg+xml",
		};
		return mimeTypes[ext] || "image/png";
	}

	return "image/png";
}
