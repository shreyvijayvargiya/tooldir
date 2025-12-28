import { supabase } from '../api-supabase/supabase';

const PAYMENTS_TABLE = 'payments';

/**
 * Get all payments from Supabase
 * @returns {Promise<Array>} Array of payment documents
 */
export const getAllPayments = async () => {
	try {
		const { data, error } = await supabase
			.from(PAYMENTS_TABLE)
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error getting payments:', error);
		throw error;
	}
};
