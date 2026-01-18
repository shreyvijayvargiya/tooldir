import { supabase } from "../config/supabase";

const IDEA_DATABASE_TABLE = "idea_database";

const toIdeaModel = (row) => {
	if (!row) return row;
	return {
		...row,
		markAsTask: row.mark_as_task,
		taskId: row.task_id,
		taskStatus: row.task_status,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

/**
 * Get all ideas from Supabase
 * @returns {Promise<Array>} Array of idea rows (camelCase keys for UI usage)
 */
export const getAllIdeas = async () => {
	try {
		const { data, error } = await supabase
			.from(IDEA_DATABASE_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;

		return (data || []).map(toIdeaModel);
	} catch (error) {
		console.error("Error getting ideas:", error);
		throw error;
	}
};

/**
 * Create a new idea
 * @param {Object} ideaData
 * @param {string} ideaData.title
 * @param {string} [ideaData.content]
 * @param {boolean} [ideaData.markAsTask]
 * @param {string|null} [ideaData.taskId]
 * @param {string|null} [ideaData.taskStatus] - todo | in-progress | completed
 * @returns {Promise<Object>} Created idea (camelCase keys)
 */
export const createIdea = async (ideaData) => {
	try {
		const markAsTask = !!ideaData.markAsTask;
		const insertRow = {
			title: ideaData.title,
			content: ideaData.content || "",
			mark_as_task: markAsTask,
			task_id: markAsTask ? ideaData.taskId || null : null,
			task_status: markAsTask ? ideaData.taskStatus || "todo" : null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from(IDEA_DATABASE_TABLE)
			.insert(insertRow)
			.select()
			.single();

		if (error) throw error;

		return toIdeaModel(data);
	} catch (error) {
		console.error("Error creating idea:", error);
		throw error;
	}
};

/**
 * Update an existing idea
 * @param {string} id - Idea ID (uuid)
 * @param {Object} ideaData - Updated idea data (camelCase keys)
 * @returns {Promise<Object>} Updated idea (camelCase keys)
 */
export const updateIdea = async (id, ideaData) => {
	try {
		const markAsTask =
			ideaData.markAsTask === undefined ? undefined : !!ideaData.markAsTask;

		const updateRow = {
			title: ideaData.title,
			content: ideaData.content,
			mark_as_task: markAsTask,
			task_id:
				markAsTask === false
					? null
					: ideaData.taskId === undefined
					? undefined
					: ideaData.taskId,
			task_status:
				markAsTask === false
					? null
					: ideaData.taskStatus === undefined
					? undefined
					: ideaData.taskStatus,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values (but keep nulls)
		Object.keys(updateRow).forEach(
			(key) => updateRow[key] === undefined && delete updateRow[key]
		);

		const { data, error } = await supabase
			.from(IDEA_DATABASE_TABLE)
			.update(updateRow)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;

		return toIdeaModel(data);
	} catch (error) {
		console.error("Error updating idea:", error);
		throw error;
	}
};

/**
 * Delete an idea
 * @param {string} id - Idea ID (uuid)
 * @returns {Promise<void>}
 */
export const deleteIdea = async (id) => {
	try {
		const { error } = await supabase.from(IDEA_DATABASE_TABLE).delete().eq("id", id);
		if (error) throw error;
	} catch (error) {
		console.error("Error deleting idea:", error);
		throw error;
	}
};
