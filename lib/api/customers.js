import { supabase } from "./supabase";

const CUSTOMERS_TABLE = "customers";

/**
 * Get customer by email
 * @param {string} email - Customer email
 * @returns {Promise<Object|null>} Customer document or null
 */
export const getCustomerByEmail = async (email) => {
	try {
		const { data, error } = await supabase
			.from(CUSTOMERS_TABLE)
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
		console.error("Error getting customer by email:", error);
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
			.select("*")
			.eq("customer_id", customerId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting customer by ID:", error);
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
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error getting customers:", error);
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
			isSubscribed: customer.status === "active",
			planName: customer.plan_name || null,
			planId: customer.plan_id || null,
			customerId: customer.customer_id || null,
			status: customer.status || null,
			expiresAt: customer.expires_at || null,
		};
	} catch (error) {
		console.error("Error getting customer subscription:", error);
		throw error;
	}
};

/**
 * Create or update customer
 * @param {Object} customerData - Customer data object
 * @returns {Promise<string>} Customer ID
 */
export const saveCustomer = async (customerData) => {
	try {
		// Check if customer exists by customer_id or email
		let existing = null;
		if (customerData.customerId || customerData.customer_id) {
			existing = await getCustomerById(
				customerData.customerId || customerData.customer_id
			);
		}
		if (!existing && customerData.email) {
			existing = await getCustomerByEmail(customerData.email);
		}

		if (existing) {
			// Update existing customer
			const { error } = await supabase
				.from(CUSTOMERS_TABLE)
				.update({
					email: customerData.email || existing.email,
					name: customerData.name || existing.name,
					plan_name:
						customerData.planName ||
						customerData.plan_name ||
						existing.plan_name,
					plan_id:
						customerData.planId || customerData.plan_id || existing.plan_id,
					status: customerData.status || existing.status,
					expires_at:
						customerData.expiresAt ||
						customerData.expires_at ||
						existing.expires_at,
					updated_at: new Date().toISOString(),
				})
				.eq("id", existing.id);

			if (error) {
				throw error;
			}

			return existing.id;
		} else {
			// Create new customer
			const { data, error } = await supabase
				.from(CUSTOMERS_TABLE)
				.insert({
					customer_id: customerData.customerId || customerData.customer_id,
					email: customerData.email,
					name: customerData.name,
					plan_name: customerData.planName || customerData.plan_name,
					plan_id: customerData.planId || customerData.plan_id,
					status: customerData.status || "active",
					expires_at: customerData.expiresAt || customerData.expires_at,
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
		console.error("Error saving customer:", error);
		throw error;
	}
};
