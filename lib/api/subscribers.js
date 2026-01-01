import { supabase } from "./supabase";

const SUBSCRIBERS_TABLE = "subscribers";

/**
 * Get all subscribers
 * @param {string} status - Optional: 'active' or 'unsubscribed' to filter by status
 * @returns {Promise<Array>} Array of subscriber documents
 */
export const getAllSubscribers = async (status = null) => {
	try {
		let query = supabase
			.from(SUBSCRIBERS_TABLE)
			.select("*")
			.order("subscribed_at", { ascending: false });

		if (status) {
			query = query.eq("status", status);
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error getting subscribers:", error);
		throw error;
	}
};

/**
 * Get active subscribers only
 * @returns {Promise<Array>} Array of active subscriber documents
 */
export const getActiveSubscribers = async () => {
	return getAllSubscribers("active");
};

/**
 * Get a single subscriber by ID
 * @param {string} id - Subscriber document ID
 * @returns {Promise<Object>} Subscriber document
 */
export const getSubscriberById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(SUBSCRIBERS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Subscriber not found");
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting subscriber:", error);
		throw error;
	}
};

/**
 * Get subscriber by email
 * @param {string} email - Subscriber email
 * @returns {Promise<Object|null>} Subscriber document or null
 */
export const getSubscriberByEmail = async (email) => {
	try {
		const { data, error } = await supabase
			.from(SUBSCRIBERS_TABLE)
			.select("*")
			.eq("email", email)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting subscriber by email:", error);
		throw error;
	}
};

/**
 * Add a new subscriber
 * @param {Object} subscriberData - Subscriber data object
 * @param {string} subscriberData.email - Subscriber email
 * @param {string} subscriberData.name - Subscriber name (optional)
 * @returns {Promise<string>} Document ID of created subscriber
 */
export const addSubscriber = async (subscriberData) => {
	try {
		// Check if subscriber already exists
		const existing = await getSubscriberByEmail(subscriberData.email);

		if (existing) {
			// Update existing subscriber to active
			if (existing.status === "unsubscribed") {
				await updateSubscriber(existing.id, {
					status: "active",
					subscribed_at: new Date().toISOString(),
				});
				return existing.id;
			}
			throw new Error("Subscriber already exists");
		}

		const { data, error } = await supabase
			.from(SUBSCRIBERS_TABLE)
			.insert({
				email: subscriberData.email,
				name: subscriberData.name || subscriberData.email.split("@")[0],
				status: "active",
				subscribed_at: new Date().toISOString(),
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
		console.error("Error adding subscriber:", error);
		throw error;
	}
};

/**
 * Update an existing subscriber
 * @param {string} id - Subscriber document ID
 * @param {Object} subscriberData - Updated subscriber data
 * @returns {Promise<void>}
 */
export const updateSubscriber = async (id, subscriberData) => {
	try {
		const updateData = {
			email: subscriberData.email,
			name: subscriberData.name,
			status: subscriberData.status,
			subscribed_at:
				subscriberData.subscribedAt || subscriberData.subscribed_at,
			unsubscribed_at:
				subscriberData.unsubscribedAt || subscriberData.unsubscribed_at,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateData).forEach(
			(key) => updateData[key] === undefined && delete updateData[key]
		);

		const { error } = await supabase
			.from(SUBSCRIBERS_TABLE)
			.update(updateData)
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating subscriber:", error);
		throw error;
	}
};

/**
 * Delete a subscriber
 * @param {string} id - Subscriber document ID
 * @returns {Promise<void>}
 */
export const deleteSubscriber = async (id) => {
	try {
		const { error } = await supabase
			.from(SUBSCRIBERS_TABLE)
			.delete()
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting subscriber:", error);
		throw error;
	}
};

/**
 * Unsubscribe a subscriber
 * @param {string} id - Subscriber document ID
 * @returns {Promise<void>}
 */
export const unsubscribeSubscriber = async (id) => {
	try {
		const { error } = await supabase
			.from(SUBSCRIBERS_TABLE)
			.update({
				status: "unsubscribed",
				unsubscribed_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error unsubscribing subscriber:", error);
		throw error;
	}
};
