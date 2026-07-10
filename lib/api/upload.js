import {
	uploadImage,
	uploadImageFromDataUrl,
	uploadBlogBannerImage,
	uploadBlogContentImage,
	STORAGE_BUCKET,
	getStoragePublicUrl,
	deleteStorageFile,
} from "./storage";

export {
	uploadImage,
	uploadImageFromDataUrl,
	uploadBlogBannerImage,
	uploadBlogContentImage,
	STORAGE_BUCKET,
	getStoragePublicUrl,
	deleteStorageFile,
};

/**
 * @deprecated Use uploadImage from lib/api/storage.js
 */
export const uploadFile = async (file, path) => {
	const folder = path.includes("/") ? path.split("/").slice(0, -1).join("/") : "uploads";
	const result = await uploadImage(file, folder, { path });
	return result.publicUrl;
};

/**
 * Upload a banner image for a blog.
 */
export const uploadBannerImage = async (file, blogId = null) => {
	return uploadBlogBannerImage(file, blogId);
};

const isRemoteUrl = (src) =>
	src && (src.startsWith("http://") || src.startsWith("https://"));

/**
 * Replace base64 images in HTML content with Supabase Storage URLs.
 */
const uploadHtmlContentImages = async (htmlContent, blogId = null) => {
	if (!htmlContent || typeof document === "undefined") return htmlContent;

	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlContent, "text/html");
	const images = doc.querySelectorAll("img");
	let updatedContent = htmlContent;

	for (const img of images) {
		const src = img.getAttribute("src");
		if (!src || !src.startsWith("data:")) continue;

		try {
			const folder = blogId ? `blogs/${blogId}/content` : "blogs/content";
			const { publicUrl } = await uploadImageFromDataUrl(src, folder);
			updatedContent = updatedContent.split(src).join(publicUrl);
		} catch (error) {
			console.error("Error uploading HTML content image:", error);
		}
	}

	return updatedContent;
};

/**
 * Replace base64 images in markdown content with Supabase Storage URLs.
 */
const uploadMarkdownContentImages = async (markdownContent, blogId = null) => {
	if (!markdownContent) return markdownContent;

	const imageRegex = /!\[([^\]]*)\]\((data:image\/[^)]+)\)/g;
	let updatedContent = markdownContent;
	const matches = [...markdownContent.matchAll(imageRegex)];

	for (const match of matches) {
		const dataUrl = match[2];
		if (!dataUrl.startsWith("data:")) continue;

		try {
			const folder = blogId ? `blogs/${blogId}/content` : "blogs/content";
			const { publicUrl } = await uploadImageFromDataUrl(dataUrl, folder);
			updatedContent = updatedContent.split(dataUrl).join(publicUrl);
		} catch (error) {
			console.error("Error uploading markdown content image:", error);
		}
	}

	return updatedContent;
};

/**
 * Upload inline content images from HTML or markdown.
 */
export const uploadContentImages = async (content, blogId = null) => {
	if (!content) return content;

	const isHtml =
		content.includes("<") &&
		content.includes(">") &&
		content.match(/<\/?[a-z][\s\S]*>/i);

	if (isHtml) {
		return uploadHtmlContentImages(content, blogId);
	}

	return uploadMarkdownContentImages(content, blogId);
};

/**
 * Upload all images for a blog (banner + inline content images).
 */
export const uploadBlogImages = async (blogData, bannerFile = null, blogId = null) => {
	const updatedData = { ...blogData };

	if (bannerFile) {
		updatedData.bannerImage = await uploadBlogBannerImage(bannerFile, blogId);
	} else if (updatedData.bannerImage?.startsWith?.("data:")) {
		const folder = blogId ? `blogs/${blogId}` : "blogs/banners";
		const { publicUrl } = await uploadImageFromDataUrl(updatedData.bannerImage, folder);
		updatedData.bannerImage = publicUrl;
	}

	if (updatedData.content) {
		updatedData.content = await uploadContentImages(updatedData.content, blogId);
	}

	return updatedData;
};
