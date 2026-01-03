import { supabase } from "./supabase";

const WAITLIST_TABLE = "waitlist";

/**
 * Get all waitlist entries from Supabase
 * @returns {Promise<Array>} Array of waitlist documents
 */
export const getAllWaitlist = async () => {
	try {
		const { data, error } = await supabase
			.from(WAITLIST_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return (data || []).map((entry) => ({
			...entry,
			createdAt: entry.created_at,
			updatedAt: entry.updated_at,
		}));
	} catch (error) {
		console.error("Error getting waitlist:", error);
		throw error;
	}
};

/**
 * Get a single waitlist entry by ID
 * @param {string} id - Waitlist document ID
 * @returns {Promise<Object>} Waitlist document
 */
export const getWaitlistById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(WAITLIST_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Waitlist entry not found");
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
		console.error("Error getting waitlist entry:", error);
		throw error;
	}
};

/**
 * Add a new waitlist entry
 * @param {Object} waitlistData - Waitlist data object
 * @param {string} waitlistData.name - Name of the waitlist member
 * @param {string} waitlistData.email - Email of the waitlist member
 * @returns {Promise<string>} Document ID of created waitlist entry
 */
export const addWaitlistEntry = async (waitlistData) => {
	try {
		const { data, error } = await supabase
			.from(WAITLIST_TABLE)
			.insert({
				name: waitlistData.name,
				email: waitlistData.email,
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
		console.error("Error adding waitlist entry:", error);
		throw error;
	}
};

/**
 * Delete a waitlist entry
 * @param {string} id - Waitlist document ID
 * @returns {Promise<void>}
 */
export const deleteWaitlistEntry = async (id) => {
	try {
		const { error } = await supabase.from(WAITLIST_TABLE).delete().eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting waitlist entry:", error);
		throw error;
	}
};
