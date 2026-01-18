import { supabase } from '../config/supabase';

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

/**
 * Get payment by payment ID
 * @param {string} paymentId - Payment ID from Polar
 * @returns {Promise<Object|null>} Payment document or null
 */
export const getPaymentById = async (paymentId) => {
	try {
		const { data, error } = await supabase
			.from(PAYMENTS_TABLE)
			.select('*')
			.eq('payment_id', paymentId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error getting payment by ID:', error);
		throw error;
	}
};

/**
 * Create or update payment
 * @param {Object} paymentData - Payment data object
 * @returns {Promise<string>} Payment ID
 */
export const savePayment = async (paymentData) => {
	try {
		// Check if payment exists
		let existing = null;
		if (paymentData.paymentId || paymentData.payment_id) {
			existing = await getPaymentById(paymentData.paymentId || paymentData.payment_id);
		}

		if (existing) {
			// Update existing payment
			const { error } = await supabase
				.from(PAYMENTS_TABLE)
				.update({
					customer_id: paymentData.customerId || paymentData.customer_id || existing.customer_id,
					email: paymentData.email || existing.email,
					amount: paymentData.amount || existing.amount,
					currency: paymentData.currency || existing.currency || 'usd',
					status: paymentData.status || existing.status,
					plan_name: paymentData.planName || paymentData.plan_name || existing.plan_name,
					plan_id: paymentData.planId || paymentData.plan_id || existing.plan_id,
					updated_at: new Date().toISOString(),
				})
				.eq('id', existing.id);

			if (error) {
				throw error;
			}

			return existing.id;
		} else {
			// Create new payment
			const { data, error } = await supabase
				.from(PAYMENTS_TABLE)
				.insert({
					payment_id: paymentData.paymentId || paymentData.payment_id,
					customer_id: paymentData.customerId || paymentData.customer_id,
					email: paymentData.email,
					amount: paymentData.amount,
					currency: paymentData.currency || 'usd',
					status: paymentData.status || 'pending',
					plan_name: paymentData.planName || paymentData.plan_name,
					plan_id: paymentData.planId || paymentData.plan_id,
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
		console.error('Error saving payment:', error);
		throw error;
	}
};
