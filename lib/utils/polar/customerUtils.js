import { getCustomerById } from "../../../lib/api/customers";
import { COLLECTIONS, DEFAULTS, VALIDATION } from "./constants";

/**
 * Fetch customer data from Supabase
 *
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object|null>} Customer data or null
 */
export async function getCustomerFromFirestore(customerId) {
	if (!customerId) return null;

	try {
		const customer = await getCustomerById(customerId);
		return customer;
	} catch (error) {
		console.error(
			`Error fetching customer ${customerId} from Supabase:`,
			error
		);
		return null;
	}
}

/**
 * Enrich customer data from multiple sources
 * Priority: Event data > Firestore data > Defaults
 *
 * @param {string} customerId - Customer ID
 * @param {Object} eventCustomerData - Customer data from webhook event
 * @returns {Promise<Object>} Enriched customer data with isValid flag
 */
export async function enrichCustomerData(customerId, eventCustomerData = {}) {
	// Start with event data
	let customerEmail = eventCustomerData?.email || null;
	let customerName = eventCustomerData?.name || null;

	// If missing, fetch from Supabase
	if (customerId && (!customerEmail || !customerName)) {
		const supabaseCustomer = await getCustomerFromFirestore(customerId);
		if (supabaseCustomer) {
			customerEmail = customerEmail || supabaseCustomer.email || null;
			customerName = customerName || supabaseCustomer.name || null;
		}
	}

	// Validate email (not a placeholder)
	const isValidEmail =
		customerEmail &&
		customerEmail !== `${customerId}@polar.sh` &&
		!VALIDATION.INVALID_EMAIL_PATTERN.test(customerEmail);

	return {
		email: isValidEmail ? customerEmail : null,
		name: customerName || DEFAULTS.CUSTOMER_NAME,
		isValid: isValidEmail,
	};
}
