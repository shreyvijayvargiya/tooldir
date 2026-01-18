import { supabase } from "../config/supabase";

const CHANGELOG_TABLE = "changelog";

const toChangelogModel = (row) => {
	if (!row) return row;
	return {
		...row,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

const normalizeDateToISOString = (date) => {
	if (!date) return new Date().toISOString();
	if (date instanceof Date) return date.toISOString();
	if (typeof date === "string") {
		const parsed = new Date(date);
		if (!isNaN(parsed.getTime())) return parsed.toISOString();
	}
	// If unknown type or invalid string, fallback to now
	return new Date().toISOString();
};

/**
 * Get all changelog entries
 * @returns {Promise<Array>} Array of changelog documents
 */
export const getAllChangelogs = async () => {
	try {
		const { data, error } = await supabase
			.from(CHANGELOG_TABLE)
			.select("*")
			.order("date", { ascending: false });

		if (error) throw error;

		return (data || []).map(toChangelogModel);
	} catch (error) {
		console.error("Error getting changelogs:", error);
		throw error;
	}
};

/**
 * Get a single changelog by ID
 * @param {string} id - Changelog document ID
 * @returns {Promise<Object>} Changelog document
 */
export const getChangelogById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(CHANGELOG_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Changelog not found");
			}
			throw error;
		}

		return toChangelogModel(data);
	} catch (error) {
		console.error("Error getting changelog:", error);
		throw error;
	}
};

/**
 * Create a new changelog entry
 * @param {Object} changelogData - Changelog data object
 * @param {string} changelogData.title - Changelog title
 * @param {string} changelogData.description - Changelog description
 * @param {string} changelogData.content - Changelog content (HTML/markdown)
 * @param {Date|string} changelogData.date - Changelog date
 * @param {Array<string>} changelogData.categories - Array of categories (e.g., ["New releases", "Improvements"])
 * @returns {Promise<string>} Document ID of created changelog
 */
export const createChangelog = async (changelogData) => {
	try {
		const now = new Date().toISOString();
		const insertRow = {
			title: changelogData.title || "Untitled Changelog",
			description: changelogData.description || "",
			content: changelogData.content || "",
			date: normalizeDateToISOString(changelogData.date),
			categories: Array.isArray(changelogData.categories)
				? changelogData.categories
				: [],
			created_at: now,
			updated_at: now,
		};

		const { data, error } = await supabase
			.from(CHANGELOG_TABLE)
			.insert(insertRow)
			.select()
			.single();

		if (error) throw error;

		return data.id;
	} catch (error) {
		console.error("Error creating changelog:", error);
		throw error;
	}
};

/**
 * Update an existing changelog
 * @param {string} id - Changelog document ID
 * @param {Object} changelogData - Updated changelog data
 * @returns {Promise<void>}
 */
export const updateChangelog = async (id, changelogData) => {
	try {
		const updateRow = {
			title: changelogData.title,
			description: changelogData.description,
			content: changelogData.content,
			date:
				changelogData.date === undefined
					? undefined
					: normalizeDateToISOString(changelogData.date),
			categories: Array.isArray(changelogData.categories)
				? changelogData.categories
				: undefined,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateRow).forEach(
			(key) => updateRow[key] === undefined && delete updateRow[key]
		);

		const { error } = await supabase
			.from(CHANGELOG_TABLE)
			.update(updateRow)
			.eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error updating changelog:", error);
		throw error;
	}
};

/**
 * Delete a changelog
 * @param {string} id - Changelog document ID
 * @returns {Promise<void>}
 */
export const deleteChangelog = async (id) => {
	try {
		const { error } = await supabase.from(CHANGELOG_TABLE).delete().eq("id", id);
		if (error) throw error;
	} catch (error) {
		console.error("Error deleting changelog:", error);
		throw error;
	}
};