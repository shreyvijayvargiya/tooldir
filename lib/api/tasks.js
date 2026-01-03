import { supabase } from "./supabase";

const TASKS_TABLE = "tasks";

/**
 * Get all tasks from Supabase
 * @returns {Promise<Array>} Array of task documents
 */
export const getAllTasks = async () => {
	try {
		const { data, error } = await supabase
			.from(TASKS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return (data || []).map((task) => ({
			...task,
			createdAt: task.created_at,
			updatedAt: task.updated_at,
		}));
	} catch (error) {
		console.error("Error getting tasks:", error);
		throw error;
	}
};

/**
 * Get tasks by status
 * @param {string} status - Task status (backlog, in-progress, done)
 * @returns {Promise<Array>} Array of task documents
 */
export const getTasksByStatus = async (status) => {
	try {
		const { data, error } = await supabase
			.from(TASKS_TABLE)
			.select("*")
			.eq("status", status)
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return (data || []).map((task) => ({
			...task,
			createdAt: task.created_at,
			updatedAt: task.updated_at,
		}));
	} catch (error) {
		console.error("Error getting tasks by status:", error);
		throw error;
	}
};

/**
 * Get a single task by ID
 * @param {string} id - Task document ID
 * @returns {Promise<Object>} Task document
 */
export const getTaskById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(TASKS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Task not found");
			}
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return {
			...data,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	} catch (error) {
		console.error("Error getting task:", error);
		throw error;
	}
};

/**
 * Create a new task
 * @param {Object} taskData - Task data object
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} taskData.type - Task type (task, bug, feature, improvement)
 * @param {string} taskData.status - Task status (backlog, in-progress, done)
 * @param {string} taskData.priority - Task priority (High, Medium, Low)
 * @param {number} taskData.progress - Task progress (0-100)
 * @param {Array} taskData.assignees - Array of assignee IDs or emails
 * @param {number} taskData.attachments - Number of attachments
 * @param {number} taskData.comments - Number of comments
 * @param {string} taskData.category - Task category (optional)
 * @returns {Promise<string>} Document ID of created task
 */
export const createTask = async (taskData) => {
	try {
		const { data, error } = await supabase
			.from(TASKS_TABLE)
			.insert({
				title: taskData.title,
				description: taskData.description || "",
				type: taskData.type || "task",
				status: taskData.status || "backlog",
				priority: taskData.priority || "Medium",
				progress: taskData.progress || 0,
				assignees: taskData.assignees || [],
				attachments: taskData.attachments || 0,
				comments: taskData.comments || 0,
				category: taskData.category || null,
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
		console.error("Error creating task:", error);
		throw error;
	}
};

/**
 * Update an existing task
 * @param {string} id - Task document ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<void>}
 */
export const updateTask = async (id, taskData) => {
	try {
		const updateData = {
			title: taskData.title,
			description: taskData.description,
			type: taskData.type,
			status: taskData.status,
			priority: taskData.priority,
			progress: taskData.progress,
			assignees: taskData.assignees,
			attachments: taskData.attachments,
			comments: taskData.comments,
			category: taskData.category,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateData).forEach(
			(key) => updateData[key] === undefined && delete updateData[key]
		);

		const { error } = await supabase
			.from(TASKS_TABLE)
			.update(updateData)
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating task:", error);
		throw error;
	}
};

/**
 * Delete a task
 * @param {string} id - Task document ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (id) => {
	try {
		const { error } = await supabase.from(TASKS_TABLE).delete().eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting task:", error);
		throw error;
	}
};

/**
 * Update task status (for drag and drop)
 * @param {string} id - Task document ID
 * @param {string} status - New status (backlog, in-progress, done)
 * @returns {Promise<void>}
 */
export const updateTaskStatus = async (id, status) => {
	try {
		const { error } = await supabase
			.from(TASKS_TABLE)
			.update({
				status: status,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating task status:", error);
		throw error;
	}
};

/**
 * Add assignee to task
 * @param {string} id - Task document ID
 * @param {string} assigneeId - Assignee ID or email
 * @returns {Promise<void>}
 */
export const addAssigneeToTask = async (id, assigneeId) => {
	try {
		const task = await getTaskById(id);
		const currentAssignees = task.assignees || [];

		if (!currentAssignees.includes(assigneeId)) {
			const { error } = await supabase
				.from(TASKS_TABLE)
				.update({
					assignees: [...currentAssignees, assigneeId],
					updated_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (error) {
				throw error;
			}
		}
	} catch (error) {
		console.error("Error adding assignee to task:", error);
		throw error;
	}
};

/**
 * Remove assignee from task
 * @param {string} id - Task document ID
 * @param {string} assigneeId - Assignee ID or email
 * @returns {Promise<void>}
 */
export const removeAssigneeFromTask = async (id, assigneeId) => {
	try {
		const task = await getTaskById(id);
		const currentAssignees = task.assignees || [];

		const { error } = await supabase
			.from(TASKS_TABLE)
			.update({
				assignees: currentAssignees.filter((a) => a !== assigneeId),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error removing assignee from task:", error);
		throw error;
	}
};
