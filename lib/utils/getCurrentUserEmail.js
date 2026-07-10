import { getCurrentUser } from "../api/auth";
import { getUserCookie } from "./cookies";

/**
 * Get current user email from cookie, Supabase session, or localStorage.
 * Safe for public pages — missing auth is not an error.
 * @returns {Promise<string|null>} User email or null
 */
export const getCurrentUserEmail = async () => {
	try {
		const cookieUser = getUserCookie();
		if (cookieUser?.email) return cookieUser.email;

		const currentUser = await getCurrentUser();
		if (currentUser?.email) return currentUser.email;

		if (typeof window !== "undefined") {
			return localStorage.getItem("currentUserEmail");
		}

		return null;
	} catch {
		if (typeof window !== "undefined") {
			return localStorage.getItem("currentUserEmail");
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

