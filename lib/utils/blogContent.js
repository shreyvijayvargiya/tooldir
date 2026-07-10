import { htmlToMarkdown } from "./htmlToMarkdown";

/**
 * Normalize blog body to markdown for rendering.
 */
export const toBlogMarkdown = (content) => {
	if (!content) return "";

	const isHTML =
		content.includes("<") &&
		content.includes(">") &&
		content.match(/<\/?[a-z][\s\S]*>/i);

	return isHTML ? htmlToMarkdown(content) : content;
};

/**
 * Plain-text excerpt for meta descriptions.
 */
export const getBlogExcerpt = (content, maxLength = 160) => {
	if (!content) return "";

	const markdown = toBlogMarkdown(content);
	const plain = markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/#{1,6}\s/g, "")
		.replace(/[*_~`>]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (plain.length <= maxLength) return plain;
	return `${plain.slice(0, maxLength).trim()}...`;
};

export const getBlogPostPath = (blog) => {
	if (!blog) return "/blog";
	if (blog.slug) return `/blog/${blog.slug}`;
	if (blog.id) return `/blog/id/${blog.id}`;
	return "/blog";
};

export const getBlogPublishedIso = (blog) => {
	const date = blog?.publishedAt || blog?.createdAt;
	if (!date) return null;
	if (date?.toDate) return date.toDate().toISOString();
	return new Date(date).toISOString();
};
