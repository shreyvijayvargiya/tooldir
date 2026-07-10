import { getCanonicalUrl } from "../config/seo";
import { getBlogExcerpt, getBlogPublishedIso, getBlogPostPath } from "./blogContent";

export const getSiteOrigin = () =>
	process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";

export const getBlogSeo = (blog) => {
	if (!blog) return null;

	const path = getBlogPostPath(blog);
	const canonicalUrl = getCanonicalUrl(path, getSiteOrigin());
	const description = getBlogExcerpt(blog.content) || blog.title;
	const publishedTime = getBlogPublishedIso(blog);
	const image = blog.bannerImage || `${getSiteOrigin()}/og-blog.png`;

	return {
		title: `${blog.title} | ToolDir Blog`,
		description,
		canonicalUrl,
		ogType: "article",
		ogImage: image,
		twitterCard: blog.bannerImage ? "summary_large_image" : "summary",
		publishedTime,
		author: blog.author || "ToolDir",
	};
};
