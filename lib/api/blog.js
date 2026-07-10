import { requireSupabase, isSupabaseConfigured } from "../config/supabase";

const BLOGS_TABLE = "blogs";

const toBlogModel = (row) => {
	if (!row) return row;
	return {
		...row,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		publishedAt: row.published_at,
		bannerImage: row.banner_image,
	};
};

const prepareBlogPayload = (blogData) => {
	const payload = {
		title: blogData.title,
		slug: blogData.slug,
		content: blogData.content,
		author: blogData.author,
		status: blogData.status || "draft",
		banner_image: blogData.bannerImage || blogData.banner_image,
		published_at: blogData.publishedAt || blogData.published_at,
	};

	if (payload.status === "published" && !payload.published_at) {
		payload.published_at = new Date().toISOString();
	}

	Object.keys(payload).forEach((key) => {
		if (payload[key] === undefined) delete payload[key];
	});

	return payload;
};

/**
 * Get all blogs
 */
export const getAllBlogs = async (status = null) => {
	if (!isSupabaseConfigured()) return [];

	const client = requireSupabase();
	let query = client
		.from(BLOGS_TABLE)
		.select("*")
		.order("created_at", { ascending: false });

	if (status) {
		query = query.eq("status", status);
	}

	const { data, error } = await query;
	if (error) throw error;
	return (data || []).map(toBlogModel);
};

/**
 * Get a single blog by ID
 */
export const getBlogById = async (id) => {
	if (!isSupabaseConfigured()) {
		throw new Error("Supabase is not configured");
	}

	const client = requireSupabase();
	const { data, error } = await client
		.from(BLOGS_TABLE)
		.select("*")
		.eq("id", id)
		.single();

	if (error) {
		if (error.code === "PGRST116") throw new Error("Blog not found");
		throw error;
	}

	return toBlogModel(data);
};

/**
 * Get a published blog by slug
 */
export const getBlogBySlug = async (slug, { includeDrafts = false } = {}) => {
	if (!isSupabaseConfigured()) return null;

	const client = requireSupabase();
	let query = client.from(BLOGS_TABLE).select("*").eq("slug", slug);

	if (!includeDrafts) {
		query = query.eq("status", "published");
	}

	const { data, error } = await query.maybeSingle();
	if (error) throw error;
	return data ? toBlogModel(data) : null;
};

/**
 * Create a new blog
 */
export const createBlog = async (blogData) => {
	const client = requireSupabase();
	const payload = prepareBlogPayload(blogData);

	const { data, error } = await client
		.from(BLOGS_TABLE)
		.insert({
			...payload,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (error) throw error;
	return data.id;
};

/**
 * Update an existing blog
 */
export const updateBlog = async (id, blogData) => {
	const client = requireSupabase();
	const payload = {
		...prepareBlogPayload(blogData),
		updated_at: new Date().toISOString(),
	};

	const { error } = await client.from(BLOGS_TABLE).update(payload).eq("id", id);
	if (error) throw error;
};

/**
 * Delete a blog
 */
export const deleteBlog = async (id) => {
	const client = requireSupabase();
	const { error } = await client.from(BLOGS_TABLE).delete().eq("id", id);
	if (error) throw error;
};

/**
 * Publish a draft blog
 */
export const publishBlog = async (id) => {
	const client = requireSupabase();
	const { error } = await client
		.from(BLOGS_TABLE)
		.update({
			status: "published",
			published_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) throw error;
};

/**
 * Get latest published blogs for sitemap/feeds.
 */
export const getLatestPublishedBlogs = async (limit = 5) => {
	const blogs = await getAllBlogs("published");
	return blogs.slice(0, limit);
};

/**
 * Get blogs by status
 */
export const getBlogsByStatus = async (status) => getAllBlogs(status);
