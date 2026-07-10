import { requireSupabase, isSupabaseConfigured } from "../config/supabase";

export const STORAGE_BUCKET = "saas-starter-storage";

const getClient = () => requireSupabase();

const getExtension = (fileName, mimeType) => {
	if (fileName?.includes(".")) {
		return fileName.split(".").pop().toLowerCase();
	}
	const fromMime = mimeType?.split("/")?.[1];
	return fromMime || "png";
};

const buildPath = (folder, fileName, mimeType) => {
	const ext = getExtension(fileName, mimeType);
	const timestamp = Date.now();
	const randomId = Math.random().toString(36).slice(2, 9);
	return `${folder}/${timestamp}-${randomId}.${ext}`;
};

/**
 * Get the public URL for a storage object path.
 */
export const getStoragePublicUrl = (path) => {
	if (!isSupabaseConfigured()) return null;
	const client = getClient();
	const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
	return data.publicUrl;
};

/**
 * Upload a file to Supabase Storage.
 * @param {File|Blob} file
 * @param {string} folder - e.g. "blogs/abc123/content"
 * @param {Object} options
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
export const uploadImage = async (file, folder = "uploads", options = {}) => {
	if (!isSupabaseConfigured()) {
		throw new Error("Supabase is not configured");
	}

	const client = getClient();
	const fileName = options.fileName || file.name || "image";
	const mimeType = file.type || options.mimeType || "image/png";
	const path = options.path || buildPath(folder, fileName, mimeType);

	const { data, error } = await client.storage
		.from(STORAGE_BUCKET)
		.upload(path, file, {
			cacheControl: "3600",
			upsert: options.upsert ?? false,
			contentType: mimeType,
		});

	if (error) throw error;

	return {
		path: data.path,
		publicUrl: getStoragePublicUrl(data.path),
	};
};

/**
 * Upload an image from a base64 data URL.
 */
export const uploadImageFromDataUrl = async (dataUrl, folder = "uploads", options = {}) => {
	if (!dataUrl?.startsWith("data:")) {
		throw new Error("Invalid data URL");
	}

	const response = await fetch(dataUrl);
	const blob = await response.blob();
	const mimeMatch = dataUrl.match(/data:(image\/[^;]+);/);
	const mimeType = mimeMatch?.[1] || blob.type || "image/png";
	const extension = mimeType.split("/")[1] || "png";

	return uploadImage(blob, folder, {
		...options,
		mimeType,
		fileName: options.fileName || `image.${extension}`,
	});
};

/**
 * Upload a blog banner image.
 */
export const uploadBlogBannerImage = async (file, blogId = null) => {
	const folder = blogId ? `blogs/${blogId}` : "blogs/banners";
	const result = await uploadImage(file, folder, {
		fileName: `banner-${Date.now()}.${getExtension(file.name, file.type)}`,
		path: blogId
			? `blogs/${blogId}/banner-${Date.now()}.${getExtension(file.name, file.type)}`
			: undefined,
	});
	return result.publicUrl;
};

/**
 * Upload an inline blog content image (from file picker in TipTap).
 */
export const uploadBlogContentImage = async (file, blogId = null) => {
	const folder = blogId ? `blogs/${blogId}/content` : "blogs/content";
	const result = await uploadImage(file, folder);
	return result.publicUrl;
};

/**
 * Delete a file from storage by path.
 */
export const deleteStorageFile = async (path) => {
	if (!isSupabaseConfigured() || !path) return;
	const client = getClient();
	const { error } = await client.storage.from(STORAGE_BUCKET).remove([path]);
	if (error) throw error;
};
