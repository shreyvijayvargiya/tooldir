import { supabase } from '../api-supabase/supabase';

const USERS_TABLE = 'users';

/**
 * Get all users from Supabase
 * @returns {Promise<Array>} Array of user documents
 */
export const getAllUsers = async () => {
	try {
		const { data, error } = await supabase
			.from(USERS_TABLE)
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error getting users:', error);
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
			.select('*')
			.eq('email_verified', true)
			.not('email', 'is', null)
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error getting users with verified emails:', error);
		throw error;
	}
};
