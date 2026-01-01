import { supabase } from "./supabase";

const TEAMS_TABLE = "teams";

/**
 * Get all team members
 * @returns {Promise<Array>} Array of team member documents
 */
export const getAllTeamMembers = async () => {
	try {
		const { data, error } = await supabase
			.from(TEAMS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error getting team members:", error);
		throw error;
	}
};

/**
 * Get a single team member by ID
 * @param {string} id - Team member document ID
 * @returns {Promise<Object>} Team member document
 */
export const getTeamMemberById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(TEAMS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Team member not found");
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting team member:", error);
		throw error;
	}
};

/**
 * Get team member by email
 * @param {string} email - Team member email
 * @returns {Promise<Object|null>} Team member document or null
 */
export const getTeamMemberByEmail = async (email) => {
	try {
		if (!email) {
			console.warn("getTeamMemberByEmail: No email provided");
			return null;
		}

		const normalizedEmail = email.toLowerCase().trim();

		const { data, error } = await supabase
			.from(TEAMS_TABLE)
			.select("*")
			.ilike("email", normalizedEmail)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting team member by email:", error);
		throw error;
	}
};

/**
 * Add a new team member
 * @param {Object} memberData - Team member data object
 * @param {string} memberData.email - Team member email
 * @param {string} memberData.username - Team member username
 * @param {string} memberData.role - Team member role (admin, editor, author, viewer)
 * @returns {Promise<string>} Document ID of created team member
 */
export const addTeamMember = async (memberData) => {
	try {
		// Check if member already exists
		const existing = await getTeamMemberByEmail(memberData.email);

		if (existing) {
			throw new Error("Team member with this email already exists");
		}

		const { data, error } = await supabase
			.from(TEAMS_TABLE)
			.insert({
				email: memberData.email,
				username: memberData.username || memberData.email.split("@")[0],
				role: memberData.role || "viewer",
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
		console.error("Error adding team member:", error);
		throw error;
	}
};

/**
 * Update an existing team member
 * @param {string} id - Team member document ID
 * @param {Object} memberData - Updated team member data
 * @returns {Promise<void>}
 */
export const updateTeamMember = async (id, memberData) => {
	try {
		const updateData = {
			email: memberData.email,
			username: memberData.username,
			role: memberData.role,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateData).forEach(
			(key) => updateData[key] === undefined && delete updateData[key]
		);

		const { error } = await supabase
			.from(TEAMS_TABLE)
			.update(updateData)
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating team member:", error);
		throw error;
	}
};

/**
 * Update team member role
 * @param {string} id - Team member document ID
 * @param {string} role - New role
 * @returns {Promise<void>}
 */
export const updateTeamMemberRole = async (id, role) => {
	try {
		const { error } = await supabase
			.from(TEAMS_TABLE)
			.update({
				role: role,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating team member role:", error);
		throw error;
	}
};

/**
 * Delete a team member
 * @param {string} id - Team member document ID
 * @returns {Promise<void>}
 */
export const deleteTeamMember = async (id) => {
	try {
		const { error } = await supabase.from(TEAMS_TABLE).delete().eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting team member:", error);
		throw error;
	}
};
