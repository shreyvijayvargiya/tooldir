import { supabase } from "../config/supabase";
import { getAllBlogs } from "./blog";
import { getAllEmails } from "./emails";

const CRON_JOBS_TABLE = "cron_jobs";

const toCronJobModel = (row) => {
	if (!row) return row;
	return {
		...row,
		itemId: row.item_id,
		scheduledDate: row.scheduled_date,
		itemData: row.item_data,
		lastRunAt: row.last_run_at,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

const normalizeToISOString = (value) => {
	if (!value) return null;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") {
		const parsed = new Date(value);
		if (!isNaN(parsed.getTime())) return parsed.toISOString();
	}
	return null;
};

/**
 * Get all CRON jobs
 * @returns {Promise<Array>} Array of CRON job rows
 */
export const getAllCronJobs = async () => {
	try {
		const { data, error } = await supabase
			.from(CRON_JOBS_TABLE)
			.select("*")
			.order("scheduled_date", { ascending: true });

		if (error) throw error;

		return (data || []).map(toCronJobModel);
	} catch (error) {
		console.error("Error getting CRON jobs:", error);
		throw error;
	}
};

/**
 * Get CRON jobs by type
 * @param {string} type - 'blog' or 'email'
 * @returns {Promise<Array>} Array of CRON job rows
 */
export const getCronJobsByType = async (type) => {
	try {
		const { data, error } = await supabase
			.from(CRON_JOBS_TABLE)
			.select("*")
			.eq("type", type)
			.order("scheduled_date", { ascending: true });

		if (error) throw error;

		return (data || []).map(toCronJobModel);
	} catch (error) {
		console.error("Error getting CRON jobs by type:", error);
		throw error;
	}
};

/**
 * Get a single CRON job by ID
 * @param {string} id - CRON job id
 * @returns {Promise<Object>} CRON job row
 */
export const getCronJobById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(CRON_JOBS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("CRON job not found");
			}
			throw error;
		}

		return toCronJobModel(data);
	} catch (error) {
		console.error("Error getting CRON job:", error);
		throw error;
	}
};

/**
 * Create or update CRON job from scheduled blog/email
 * @param {Object} cronData - CRON job data
 * @param {string} cronData.type - 'blog' or 'email'
 * @param {string} cronData.itemId - Blog or email ID (uuid)
 * @param {Date|string} cronData.scheduledDate - Scheduled execution date
 * @param {Object} cronData.itemData - Minimal item data for display
 * @returns {Promise<string>} CRON job ID
 */
export const createCronJob = async (cronData) => {
	try {
		const now = new Date().toISOString();
		const scheduled = normalizeToISOString(cronData.scheduledDate);
		if (!scheduled) {
			throw new Error("Invalid scheduledDate");
		}

		// Prefer upsert to avoid duplicates; unique index: (type, item_id)
		const { data, error } = await supabase
			.from(CRON_JOBS_TABLE)
			.upsert(
				{
					type: cronData.type,
					item_id: cronData.itemId,
					scheduled_date: scheduled,
					status: "scheduled",
					item_data: cronData.itemData || {},
					error: null,
					updated_at: now,
					// keep created_at default on insert; set explicitly for deterministic behavior
					created_at: now,
				},
				{ onConflict: "type,item_id" }
			)
			.select()
			.single();

		if (error) throw error;

		return data.id;
	} catch (error) {
		console.error("Error creating CRON job:", error);
		throw error;
	}
};

/**
 * Update CRON job scheduled date
 * @param {string} id - CRON job id
 * @param {Date|string} scheduledDate - New scheduled date
 * @returns {Promise<void>}
 */
export const updateCronJobSchedule = async (id, scheduledDate) => {
	try {
		const scheduled = normalizeToISOString(scheduledDate);
		if (!scheduled) {
			throw new Error("Invalid scheduledDate");
		}

		const { error } = await supabase
			.from(CRON_JOBS_TABLE)
			.update({
				scheduled_date: scheduled,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error updating CRON job schedule:", error);
		throw error;
	}
};

/**
 * Mark CRON job as completed
 * @param {string} id - CRON job id
 * @returns {Promise<void>}
 */
export const markCronJobCompleted = async (id) => {
	try {
		const now = new Date().toISOString();
		const { error } = await supabase
			.from(CRON_JOBS_TABLE)
			.update({
				status: "completed",
				last_run_at: now,
				error: null,
				updated_at: now,
			})
			.eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error marking CRON job as completed:", error);
		throw error;
	}
};

/**
 * Mark CRON job as failed
 * @param {string} id - CRON job id
 * @param {string} errorMessage - Error message
 * @returns {Promise<void>}
 */
export const markCronJobFailed = async (id, errorMessage) => {
	try {
		const now = new Date().toISOString();
		const { error } = await supabase
			.from(CRON_JOBS_TABLE)
			.update({
				status: "failed",
				error: errorMessage || "Unknown error",
				last_run_at: now,
				updated_at: now,
			})
			.eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error marking CRON job as failed:", error);
		throw error;
	}
};

/**
 * Cancel CRON job
 * @param {string} id - CRON job id
 * @returns {Promise<void>}
 */
export const cancelCronJob = async (id) => {
	try {
		const { error } = await supabase
			.from(CRON_JOBS_TABLE)
			.update({
				status: "cancelled",
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error cancelling CRON job:", error);
		throw error;
	}
};

/**
 * Delete CRON job
 * @param {string} id - CRON job id
 * @returns {Promise<void>}
 */
export const deleteCronJob = async (id) => {
	try {
		const { error } = await supabase.from(CRON_JOBS_TABLE).delete().eq("id", id);
		if (error) throw error;
	} catch (error) {
		console.error("Error deleting CRON job:", error);
		throw error;
	}
};

/**
 * Sync scheduled blogs and emails to CRON jobs
 * This should be called to populate CRON jobs from existing scheduled items
 * @returns {Promise<{blogsCreated:number,emailsCreated:number,errors:string[]}>}
 */
export const syncScheduledItemsToCronJobs = async () => {
	try {
		const blogs = await getAllBlogs();
		const emails = await getAllEmails();

		const scheduledBlogs = (blogs || []).filter(
			(blog) => blog.status === "scheduled" && (blog.scheduledDate || blog.scheduled_date)
		);
		const scheduledEmails = (emails || []).filter(
			(email) => email.status === "scheduled" && (email.scheduledDate || email.scheduled_date)
		);

		const results = {
			blogsCreated: 0,
			emailsCreated: 0,
			errors: [],
		};

		// Create/update CRON jobs for scheduled blogs
		for (const blog of scheduledBlogs) {
			try {
				const scheduledDate =
					blog.scheduledDate ||
					blog.scheduled_date ||
					blog.publishedAt ||
					blog.published_at;

				const id = await createCronJob({
					type: "blog",
					itemId: blog.id,
					scheduledDate: scheduledDate,
					itemData: {
						title: blog.title,
						slug: blog.slug,
						status: blog.status,
					},
				});
				if (id) results.blogsCreated++;
			} catch (error) {
				results.errors.push(
					`Error creating CRON job for blog ${blog.id}: ${error.message}`
				);
			}
		}

		// Create/update CRON jobs for scheduled emails
		for (const email of scheduledEmails) {
			try {
				const scheduledDate =
					email.scheduledDate ||
					email.scheduled_date ||
					email.publishedAt ||
					email.published_at;

				const id = await createCronJob({
					type: "email",
					itemId: email.id,
					scheduledDate: scheduledDate,
					itemData: {
						subject: email.subject,
						status: email.status,
					},
				});
				if (id) results.emailsCreated++;
			} catch (error) {
				results.errors.push(
					`Error creating CRON job for email ${email.id}: ${error.message}`
				);
			}
		}

		return results;
	} catch (error) {
		console.error("Error syncing scheduled items:", error);
		throw error;
	}
};
