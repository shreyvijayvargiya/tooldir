import { supabase } from '../api-supabase/supabase';

const CUSTOMERS_TABLE = 'customers';

/**
 * Get customer by email
 * @param {string} email - Customer email
 * @returns {Promise<Object|null>} Customer document or null
 */
export const getCustomerByEmail = async (email) => {
	try {
		const { data, error } = await supabase
			.from(CUSTOMERS_TABLE)
			.select('*')
			.eq('email', email)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error getting customer by email:', error);
		throw error;
	}
};

/**
 * Get customer by customer ID
 * @param {string} customerId - Customer ID from Polar
 * @returns {Promise<Object|null>} Customer document or null
 */
export const getCustomerById = async (customerId) => {
	try {
		const { data, error } = await supabase
			.from(CUSTOMERS_TABLE)
			.select('*')
			.eq('customer_id', customerId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error getting customer by ID:', error);
		throw error;
	}
};

/**
 * Get all customers from Supabase
 * @returns {Promise<Array>} Array of customer documents
 */
export const getAllCustomers = async () => {
	try {
		const { data, error } = await supabase
			.from(CUSTOMERS_TABLE)
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error getting customers:', error);
		throw error;
	}
};

/**
 * Get customer subscription status
 * @param {string} email - Customer email
 * @returns {Promise<Object>} Subscription status object
 */
export const getCustomerSubscription = async (email) => {
	try {
		const customer = await getCustomerByEmail(email);
		if (!customer) {
			return {
				isSubscribed: false,
				planName: null,
				status: null,
			};
		}

		return {
			isSubscribed: customer.status === 'active',
			planName: customer.plan_name || null,
			planId: customer.plan_id || null,
			customerId: customer.customer_id || null,
			status: customer.status || null,
			expiresAt: customer.expires_at || null,
		};
	} catch (error) {
		console.error('Error getting customer subscription:', error);
		throw error;
	}
};
