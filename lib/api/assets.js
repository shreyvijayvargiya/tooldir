import { supabase } from "../config/supabase";

// Keep consistent with existing upload helper bucket
const ASSETS_BUCKET = "saas-starter-storage";
const ASSETS_TABLE = "assets";
const ASSETS_PREFIX = "assets";

// Simple UUID generator (prefers crypto.randomUUID when available)
const generateUUID = () => {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

/**
 * Compress image file in browser
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1920)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (
	file,
	maxWidth = 1920,
	maxHeight = 1920,
	quality = 0.8
) => {
	return new Promise((resolve) => {
		// Only compress images
		if (!file?.type?.startsWith("image/")) {
			resolve(file);
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				let width = img.width;
				let height = img.height;

				// Calculate new dimensions
				if (width > height) {
					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width = (width * maxHeight) / height;
						height = maxHeight;
					}
				}

				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					resolve(file);
					return;
				}
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const compressedFile = new File([blob], file.name, {
								type: file.type,
								lastModified: Date.now(),
							});
							resolve(compressedFile);
						} else {
							resolve(file);
						}
					},
					file.type,
					quality
				);
			};
			img.onerror = () => resolve(file);
			img.src = e.target?.result;
		};
		reader.onerror = () => resolve(file);
		reader.readAsDataURL(file);
	});
};

const toAssetModel = (row) => {
	if (!row) return row;
	return {
		...row,
		fileName: row.file_name,
		fileId: row.file_id,
		originalSize: row.original_size,
		storagePath: row.storage_path,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

/**
 * Upload a file to Supabase Storage and store metadata in Postgres
 *
 * Note: Supabase Storage upload does not expose upload progress via supabase-js in browsers.
 * We'll call onProgress(0,total) and onProgress(total,total) for basic UX.
 *
 * @param {File} file - File to upload
 * @param {Function|null} onProgress - Progress callback (bytesTransferred, totalBytes)
 * @returns {Promise<Object>} Created asset row (camelCase)
 */
export const uploadAssetFile = async (file, onProgress = null) => {
	try {
		if (!file) throw new Error("No file provided");

		// Compress if image
		let fileToUpload = file;
		if (file.type?.startsWith("image/")) {
			fileToUpload = await compressImage(file);
		}

		const fileId = generateUUID();
		const extension = file.name?.split(".").pop() || "bin";
		const fileName = `${fileId}.${extension}`;
		const storagePath = `${ASSETS_PREFIX}/${fileName}`;

		if (onProgress) {
			onProgress(0, fileToUpload.size || 0);
		}

		const { data: uploadData, error: uploadError } = await supabase.storage
			.from(ASSETS_BUCKET)
			.upload(storagePath, fileToUpload, {
				cacheControl: "3600",
				upsert: false,
				contentType: fileToUpload.type || undefined,
			});

		if (uploadError) throw uploadError;

		const { data: urlData } = supabase.storage
			.from(ASSETS_BUCKET)
			.getPublicUrl(uploadData.path);

		if (onProgress) {
			onProgress(fileToUpload.size || 0, fileToUpload.size || 0);
		}

		const now = new Date().toISOString();
		const insertRow = {
			name: file.name,
			file_name: fileName,
			file_id: fileId,
			type: file.type || null,
			size: fileToUpload.size || null,
			original_size: file.size || null,
			url: urlData?.publicUrl || null,
			bucket: ASSETS_BUCKET,
			storage_path: uploadData.path,
			created_at: now,
			updated_at: now,
		};

		const { data: assetRow, error: insertError } = await supabase
			.from(ASSETS_TABLE)
			.insert(insertRow)
			.select("*")
			.single();

		if (insertError) throw insertError;

		return toAssetModel(assetRow);
	} catch (error) {
		console.error("Error uploading asset:", error);
		throw error;
	}
};

/**
 * Get all assets
 * @returns {Promise<Array>} Array of assets (camelCase)
 */
export const getAllAssets = async () => {
	try {
		const { data, error } = await supabase
			.from(ASSETS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return (data || []).map(toAssetModel);
	} catch (error) {
		console.error("Error getting assets:", error);
		throw error;
	}
};

/**
 * Get a single asset by ID
 * @param {string} id - Asset ID (uuid)
 * @returns {Promise<Object>} Asset row (camelCase)
 */
export const getAssetById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(ASSETS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") throw new Error("Asset not found");
			throw error;
		}

		return toAssetModel(data);
	} catch (error) {
		console.error("Error getting asset:", error);
		throw error;
	}
};

/**
 * Get asset by fileId (for public URL access)
 * @param {string} fileId - File ID (uuid)
 * @returns {Promise<Object>} Asset row (camelCase)
 */
export const getAssetByFileId = async (fileId) => {
	try {
		const { data, error } = await supabase
			.from(ASSETS_TABLE)
			.select("*")
			.eq("file_id", fileId)
			.single();

		if (error) {
			if (error.code === "PGRST116") throw new Error("Asset not found");
			throw error;
		}

		return toAssetModel(data);
	} catch (error) {
		console.error("Error getting asset by fileId:", error);
		throw error;
	}
};

/**
 * Delete an asset (Storage object + metadata row)
 * @param {string} id - Asset ID (uuid)
 * @returns {Promise<void>}
 */
export const deleteAsset = async (id) => {
	try {
		const asset = await getAssetById(id);

		const bucket = asset.bucket || ASSETS_BUCKET;
		const storagePath =
			asset.storagePath || (asset.fileName ? `${ASSETS_PREFIX}/${asset.fileName}` : null);

		if (storagePath) {
			try {
				const { error: storageError } = await supabase.storage
					.from(bucket)
					.remove([storagePath]);
				if (storageError) {
					console.error("Error deleting file from Supabase Storage:", storageError);
					// Continue with DB deletion even if storage deletion fails
				}
			} catch (storageError) {
				console.error("Error deleting file from Supabase Storage:", storageError);
			}
		}

		const { error } = await supabase.from(ASSETS_TABLE).delete().eq("id", id);
		if (error) throw error;
	} catch (error) {
		console.error("Error deleting asset:", error);
		throw error;
	}
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
	if (!bytes || bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Get file type category
 * @param {string} mimeType - MIME type
 * @returns {string} File type category (image, video, pdf, document, other)
 */
export const getFileTypeCategory = (mimeType = "") => {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType === "application/pdf") return "pdf";
	if (
		mimeType.includes("document") ||
		mimeType.includes("text") ||
		mimeType.includes("word") ||
		mimeType.includes("excel") ||
		mimeType.includes("powerpoint")
	) {
		return "document";
	}
	return "other";
};

