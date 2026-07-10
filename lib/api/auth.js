import { supabase } from "../config/supabase";
import {
	saveUser,
	updateUserLastSignIn as updateUserLastSignInSupabase,
	getUserByEmail,
} from "./users";

/**
 * Sign in with Google using Supabase Auth
 * This will redirect to Google OAuth and then back to /auth/callback
 * @returns {Promise<void>}
 */
export const signInWithGoogle = async () => {
	try {
		const redirectTo =
			typeof window !== "undefined"
				? `${window.location.origin}/auth/callback`
				: undefined;

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: redirectTo,
			},
		});

		if (error) {
			throw error;
		}

		// The OAuth flow will redirect automatically
		// No need to return anything as the page will redirect
	} catch (error) {
		console.error("Error signing in with Google:", error);
		throw error;
	}
};

/**
 * Sign in with email and password using Supabase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export const signInWithEmail = async (email, password) => {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw error;
		}

		const user = data.user;

		// Save/update user in Supabase users table
		if (user) {
			await saveUserToSupabase(user, "email");
		}

		return user;
	} catch (error) {
		console.error("Error signing in with email:", error);
		throw error;
	}
};

/**
 * Sign up with email and password using Supabase Auth
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} User object
 */
export const signUpWithEmail = async (email, password, displayName) => {
	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					display_name: displayName,
					name: displayName,
				},
			},
		});

		if (error) {
			throw error;
		}

		const user = data.user;

		// Save user in Supabase users table
		if (user) {
			await saveUserToSupabase({ ...user, displayName }, "email");
		}

		return user;
	} catch (error) {
		console.error("Error signing up with email:", error);
		throw error;
	}
};

/**
 * Sign out current user using Supabase Auth
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error signing out:", error);
		throw error;
	}
};

const isMissingAuthSession = (error) =>
	error?.name === "AuthSessionMissingError" ||
	error?.message?.toLowerCase?.().includes("auth session missing");

/**
 * Get current user from Supabase Auth.
 * Missing session is normal for public pages — returns null, does not throw.
 * @returns {Promise<Object|null>} Current user object or null
 */
export const getCurrentUser = async () => {
	try {
		if (!supabase) return null;

		// Prefer getSession for optional auth — getUser() throws when logged out
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			if (isMissingAuthSession(error)) return null;
			throw error;
		}

		return session?.user ?? null;
	} catch (error) {
		if (isMissingAuthSession(error)) return null;
		console.error("Error getting current user:", error);
		return null;
	}
};

/**
 * Save user to Supabase users table
 * @param {Object} user - Supabase Auth user object
 * @param {string} provider - Auth provider ('google', 'email', etc.)
 * @returns {Promise<void>}
 */
export const saveUserToSupabase = async (user, provider) => {
	try {
		const userData = {
			uid: user.id,
			email: user.email,
			name:
				user.user_metadata?.name ||
				user.user_metadata?.display_name ||
				user.email?.split("@")[0] ||
				"User",
			display_name:
				user.user_metadata?.display_name ||
				user.user_metadata?.name ||
				user.email?.split("@")[0] ||
				"User",
			provider: provider,
			photo_url:
				user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
			email_verified: user.email_confirmed_at ? true : false,
			last_sign_in: user.last_sign_in_at || new Date().toISOString(),
		};

		await saveUser(userData);
	} catch (error) {
		console.error("Error saving user to Supabase:", error);
		throw error;
	}
};

/**
 * Update user's last sign in time
 * @param {string} userId - User ID (Supabase Auth ID)
 * @returns {Promise<void>}
 */
export const updateUserLastSignIn = async (userId) => {
	try {
		const user = await getCurrentUser();
		if (!user?.email) return;

		const supabaseUser = await getUserByEmail(user.email);
		if (supabaseUser) {
			await updateUserLastSignInSupabase(supabaseUser.id);
		}
	} catch (error) {
		if (isMissingAuthSession(error)) return;
		console.error("Error updating last sign in:", error);
	}
};

/**
 * Get user from Supabase users table
 * @param {string} userId - User ID (Supabase Auth ID)
 * @returns {Promise<Object|null>} User document or null
 */
export const getUserFromSupabase = async (userId) => {
	try {
		const { getUserByUid } = await import("./users");
		return await getUserByUid(userId);
	} catch (error) {
		console.error("Error getting user from Supabase:", error);
		throw error;
	}
};

// Keep old function name for backward compatibility
export const getUserFromFirestore = getUserFromSupabase;

/**
 * Subscribe to auth state changes using Supabase Auth
 * @param {Function} callback - Callback function that receives the user
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
	if (!supabase) {
		callback(null);
		return () => {};
	}

	const {
		data: { subscription },
	} = supabase.auth.onAuthStateChange(async (event, session) => {
		try {
			if (session?.user) {
				const provider = session.user.app_metadata?.provider || "email";
				// Skip DB write on token refresh / initial restore noise
				if (event === "SIGNED_IN" || event === "USER_UPDATED") {
					await saveUserToSupabase(session.user, provider);
				}

				const userObject = {
					uid: session.user.id,
					email: session.user.email,
					displayName:
						session.user.user_metadata?.display_name ||
						session.user.user_metadata?.name ||
						session.user.email?.split("@")[0],
					photoURL:
						session.user.user_metadata?.avatar_url ||
						session.user.user_metadata?.picture ||
						null,
					emailVerified: !!session.user.email_confirmed_at,
					providerData: [
						{
							providerId: provider === "google" ? "google.com" : "password",
						},
					],
				};
				callback(userObject);
			} else {
				callback(null);
			}
		} catch (error) {
			if (isMissingAuthSession(error)) {
				callback(null);
				return;
			}
			console.error("Auth state change error:", error);
			callback(null);
		}
	});

	return () => {
		subscription.unsubscribe();
	};
};
