import { supabase } from "../config/supabase";

const REPORT_ISSUES_TABLE = "report_issues";

/**
 * Get all report issues from Supabase
 * @returns {Promise<Array>} Array of report issue documents
 */
export const getAllReportIssues = async () => {
	try {
		const { data, error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return (data || []).map((issue) => ({
			...issue,
			createdAt: issue.created_at,
			updatedAt: issue.updated_at,
		}));
	} catch (error) {
		console.error("Error getting report issues:", error);
		throw error;
	}
};

/**
 * Get a single report issue by ID
 * @param {string} id - Report issue document ID
 * @returns {Promise<Object>} Report issue document
 */
export const getReportIssueById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Report issue not found");
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
		console.error("Error getting report issue:", error);
		throw error;
	}
};

/**
 * Add a new report issue
 * @param {Object} issueData - Report issue data object
 * @param {string} issueData.name - Reporter name
 * @param {string} issueData.email - Reporter email
 * @param {string} issueData.username - Reporter username (optional)
 * @param {string} issueData.issue - Issue description
 * @param {string} issueData.status - Issue status (default: 'pending')
 * @returns {Promise<string>} Document ID of created report issue
 */
export const addReportIssue = async (issueData) => {
	try {
		const { data, error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.insert({
				name: issueData.name,
				email: issueData.email,
				username: issueData.username || null,
				issue: issueData.issue,
				status: issueData.status || "pending",
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
		console.error("Error adding report issue:", error);
		throw error;
	}
};

/**
 * Update an existing report issue
 * @param {string} id - Report issue document ID
 * @param {Object} issueData - Updated report issue data
 * @returns {Promise<void>}
 */
export const updateReportIssue = async (id, issueData) => {
	try {
		const updateData = {
			name: issueData.name,
			email: issueData.email,
			username: issueData.username,
			issue: issueData.issue,
			status: issueData.status,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateData).forEach(
			(key) => updateData[key] === undefined && delete updateData[key]
		);

		const { error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.update(updateData)
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating report issue:", error);
		throw error;
	}
};

/**
 * Delete a report issue
 * @param {string} id - Report issue document ID
 * @returns {Promise<void>}
 */
export const deleteReportIssue = async (id) => {
	try {
		const { error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.delete()
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting report issue:", error);
		throw error;
	}
};

/**
 * Mark report issue as fixed
 * @param {string} id - Report issue document ID
 * @returns {Promise<void>}
 */
export const markIssueAsFixed = async (id) => {
	try {
		const { error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.update({
				status: "fixed",
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error marking issue as fixed:", error);
		throw error;
	}
};

/**
 * Mark report issue as pending
 * @param {string} id - Report issue document ID
 * @returns {Promise<void>}
 */
export const markIssueAsPending = async (id) => {
	try {
		const { error } = await supabase
			.from(REPORT_ISSUES_TABLE)
			.update({
				status: "pending",
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error marking issue as pending:", error);
		throw error;
	}
};
