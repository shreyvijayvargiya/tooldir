import { savePayment } from "../../../lib/api/payments";
import { COLLECTIONS, DEFAULTS, STATUS_MAPPING, VALIDATION } from "./constants";
import { normalizeDate } from "./dateUtils";
import { getCustomerFromFirestore } from "./customerUtils";

/**
 * Determine payment status from subscription status
 *
 * @param {string} subscriptionStatus - Subscription status
 * @returns {string} Payment status
 */
export function getPaymentStatusFromSubscription(subscriptionStatus) {
	return (
		STATUS_MAPPING.SUBSCRIPTION_TO_PAYMENT[subscriptionStatus] ||
		DEFAULTS.STATUS
	);
}

/**
 * Verify payment status against subscription status for consistency
 *
 * @param {string} paymentStatus - Current payment status
 * @param {string} customerId - Customer ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<string>} Verified payment status
 */
export async function verifyPaymentStatus(
	paymentStatus,
	customerId,
	subscriptionId
) {
	if (!customerId || !subscriptionId) return paymentStatus;

	try {
		const customer = await getCustomerFromFirestore(customerId);
		if (customer && customer.status) {
			const expectedStatus = getPaymentStatusFromSubscription(customer.status);
			// If payment is succeeded but subscription is not active, keep payment status
			// This handles past successful payments for canceled subscriptions
			if (
				paymentStatus === "succeeded" &&
				customer.status !== "active" &&
				customer.status !== "trialing"
			) {
				// Check if this is a past payment
				if (customer.expiresAt) {
					const expiresAt = normalizeDate(customer.expiresAt);
					if (expiresAt && expiresAt > new Date()) {
						return paymentStatus; // Still within period, payment was successful
					}
				}
			}
		}
	} catch (error) {
		console.error("Error verifying payment status:", error);
	}

	return paymentStatus;
}

/**
 * Validate payment data before storage
 *
 * @param {Object} payment - Payment data object
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePaymentData(payment) {
	const errors = [];

	VALIDATION.REQUIRED_PAYMENT_FIELDS.forEach((field) => {
		// Check both snake_case and camelCase variants
		const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

		// Special handling for 'id' field - also accept 'paymentId'
		let hasValue = payment[field] || payment[camelField];
		if (field === "id" && !hasValue) {
			hasValue = payment.paymentId;
		}

		if (!hasValue) {
			errors.push(`Missing required field: ${field}`);
		}
	});

	if (errors.length > 0) {
		console.error("Payment validation errors:", errors);
		return false;
	}

	return true;
}

/**
 * Store payment record in Supabase with enriched data
 *
 * @param {Object} paymentData - Payment data to store
 * @returns {Promise<boolean>} True if stored successfully, false otherwise
 */
export async function storePaymentRecord(paymentData) {
	try {
		// Validate required fields
		if (!validatePaymentData(paymentData)) {
			console.error("Skipping payment storage due to validation errors");
			return false;
		}

		const paymentId = paymentData.paymentId || paymentData.id;
		if (!paymentId) {
			console.error("Cannot store payment: missing payment ID");
			return false;
		}

		// Prepare payment document for Supabase
		const paymentDoc = {
			payment_id: paymentId,
			customer_id: paymentData.customerId || paymentData.customer_id || null,
			email: paymentData.customerEmail || null,
			amount: paymentData.amount || 0,
			currency: paymentData.currency || DEFAULTS.CURRENCY,
			status: paymentData.status || DEFAULTS.STATUS,
			plan_id: paymentData.planId || null,
			plan_name: paymentData.planName || DEFAULTS.PLAN_NAME,
		};

		// Handle date - convert to ISO string if it's a date object
		const createdAt =
			paymentData.createdAt ||
			paymentData.created_at ||
			paymentData.current_period_start;
		if (createdAt) {
			const normalizedDate = normalizeDate(createdAt);
			if (normalizedDate) {
				paymentDoc.created_at = normalizedDate.toISOString();
			}
		}

		await savePayment(paymentDoc);
		return true;
	} catch (error) {
		console.error("Error storing payment record:", error);
		return false;
	}
}
