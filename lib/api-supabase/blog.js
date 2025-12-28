import { supabase } from './supabase';

const BLOGS_TABLE = 'blogs';

/**
 * Get all blogs
 * @param {string} status - Optional: 'draft' or 'published' to filter by status
 * @returns {Promise<Array>} Array of blog documents
 */
export const getAllBlogs = async (status = null) => {
	try {
		let query = supabase
			.from(BLOGS_TABLE)
			.select('*')
			.order('created_at', { ascending: false });

		if (status) {
			query = query.eq('status', status);
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error getting blogs:', error);
		throw error;
	}
};

/**
 * Get a single blog by ID
 * @param {string} id - Blog document ID
 * @returns {Promise<Object>} Blog document
 */
export const getBlogById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(BLOGS_TABLE)
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				throw new Error('Blog not found');
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error getting blog:', error);
		throw error;
	}
};

/**
 * Create a new blog
 * @param {Object} blogData - Blog data object
 * @param {string} blogData.title - Blog title
 * @param {string} blogData.slug - Blog slug
 * @param {string} blogData.content - Blog content (HTML)
 * @param {string} blogData.author - Author name
 * @param {string} blogData.status - Status: 'draft' or 'published'
 * @returns {Promise<string>} Document ID of created blog
 */
export const createBlog = async (blogData) => {
	try {
		const { data, error } = await supabase
			.from(BLOGS_TABLE)
			.insert({
				...blogData,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			throw error;
		}

		return data.id;
	} catch (error) {
		console.error('Error creating blog:', error);
		throw error;
	}
};

/**
 * Update an existing blog
 * @param {string} id - Blog document ID
 * @param {Object} blogData - Updated blog data
 * @returns {Promise<void>}
 */
export const updateBlog = async (id, blogData) => {
	try {
		const { error } = await supabase
			.from(BLOGS_TABLE)
			.update({
				...blogData,
				updated_at: new Date().toISOString(),
			})
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error updating blog:', error);
		throw error;
	}
};

/**
 * Delete a blog
 * @param {string} id - Blog document ID
 * @returns {Promise<void>}
 */
export const deleteBlog = async (id) => {
	try {
		const { error } = await supabase
			.from(BLOGS_TABLE)
			.delete()
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error deleting blog:', error);
		throw error;
	}
};

/**
 * Publish a draft blog
 * @param {string} id - Blog document ID
 * @returns {Promise<void>}
 */
export const publishBlog = async (id) => {
	try {
		const { error } = await supabase
			.from(BLOGS_TABLE)
			.update({
				status: 'published',
				published_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error publishing blog:', error);
		throw error;
	}
};

/**
 * Get blogs by status
 * @param {string} status - 'draft' or 'published'
 * @returns {Promise<Array>} Array of blog documents
 */
export const getBlogsByStatus = async (status) => {
	return getAllBlogs(status);
};

