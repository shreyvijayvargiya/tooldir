import { getCurrentUser } from "../api/auth";

/**
 * Get current user email from Supabase Auth or localStorage fallback
 * @returns {Promise<string|null>} User email or null
 */
export const getCurrentUserEmail = async () => {
	try {
		// First try to get from Supabase Auth
		const currentUser = await getCurrentUser();
		
		if (currentUser && currentUser.email) {
			console.log("getCurrentUserEmail: Found email from Supabase Auth:", currentUser.email);
			return currentUser.email;
		}

		// Fallback: Check localStorage for manually set email
		if (typeof window !== "undefined") {
			const storedEmail = localStorage.getItem("currentUserEmail");
			if (storedEmail) {
				console.log("getCurrentUserEmail: Found email from localStorage:", storedEmail);
				return storedEmail;
			}
		}

		console.warn("getCurrentUserEmail: No email found in Supabase Auth or localStorage");
		return null;
	} catch (error) {
		console.error("Error getting current user email:", error);
		
		// Fallback to localStorage
		if (typeof window !== "undefined") {
			const storedEmail = localStorage.getItem("currentUserEmail");
			if (storedEmail) {
				console.log("getCurrentUserEmail: Using email from localStorage (error fallback):", storedEmail);
				return storedEmail;
			}
		}
		
		return null;
	}
};

/**
 * Set current user email manually (for when Supabase Auth is not available)
 * @param {string} email - User email to set
 */
export const setCurrentUserEmail = (email) => {
	if (typeof window !== "undefined" && email) {
		const normalizedEmail = email.toLowerCase().trim();
		localStorage.setItem("currentUserEmail", normalizedEmail);
		console.log("setCurrentUserEmail: Email set to:", normalizedEmail);
	}
};

/**
 * Clear manually set current user email
 */
export const clearCurrentUserEmail = () => {
	if (typeof window !== "undefined") {
		localStorage.removeItem("currentUserEmail");
		console.log("clearCurrentUserEmail: Cleared stored email");
	}
};

