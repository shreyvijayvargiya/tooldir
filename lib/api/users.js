import { supabase } from "./supabase";

const USERS_TABLE = "users";

/**
 * Get all users from Supabase
 * @returns {Promise<Array>} Array of user documents
 */
export const getAllUsers = async () => {
	try {
		const { data, error } = await supabase
			.from(USERS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error getting users:", error);
		throw error;
	}
};

/**
 * Get all users with verified emails
 * @returns {Promise<Array>} Array of user documents with verified emails
 */
export const getUsersWithVerifiedEmails = async () => {
	try {
		const { data, error } = await supabase
			.from(USERS_TABLE)
			.select("*")
			.eq("email_verified", true)
			.not("email", "is", null)
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error getting users with verified emails:", error);
		throw error;
	}
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User document or null
 */
export const getUserById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(USERS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting user:", error);
		throw error;
	}
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User document or null
 */
export const getUserByEmail = async (email) => {
	try {
		const { data, error } = await supabase
			.from(USERS_TABLE)
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
		console.error("Error getting user by email:", error);
		throw error;
	}
};

/**
 * Create or update user
 * @param {Object} userData - User data object
 * @returns {Promise<string>} User ID
 */
export const saveUser = async (userData) => {
	try {
		// Check if user exists
		const existing = await getUserByEmail(userData.email);

		if (existing) {
			// Update existing user
			const { error } = await supabase
				.from(USERS_TABLE)
				.update({
					...userData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", existing.id);

			if (error) {
				throw error;
			}

			return existing.id;
		} else {
			// Create new user
			const { data, error } = await supabase
				.from(USERS_TABLE)
				.insert({
					...userData,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) {
				throw error;
			}

			return data.id;
		}
	} catch (error) {
		console.error("Error saving user:", error);
		throw error;
	}
};

/**
 * Get user by UID (Supabase Auth UID)
 * @param {string} uid - User UID
 * @returns {Promise<Object|null>} User document or null
 */
export const getUserByUid = async (uid) => {
	try {
		const { data, error } = await supabase
			.from(USERS_TABLE)
			.select("*")
			.eq("uid", uid)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting user by UID:", error);
		throw error;
	}
};

/**
 * Update user's last sign in time
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
export const updateUserLastSignIn = async (id) => {
	try {
		const { error } = await supabase
			.from(USERS_TABLE)
			.update({
				last_sign_in: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating last sign in:", error);
		throw error;
	}
};
