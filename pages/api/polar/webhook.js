import { saveCustomer } from "../../../lib/api/customers";
import crypto from "crypto";
import {
	sendSubscriptionConfirmationEmail,
	sendSubscriptionCancellationEmail,
	sendSubscriptionUpgradeEmail,
} from "../../../lib/api/subscriptionEmails";

// Import utility functions
import { DEFAULTS } from "../../../lib/utils/polar/constants";
import { normalizeDate } from "../../../lib/utils/polar/dateUtils";
import {
	getCustomerFromFirestore,
	enrichCustomerData,
} from "../../../lib/utils/polar/customerUtils";
import { enrichPlanData } from "../../../lib/utils/polar/planUtils";
import {
	getPaymentStatusFromSubscription,
	verifyPaymentStatus,
	storePaymentRecord,
} from "../../../lib/utils/polar/paymentUtils";

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Verify webhook signature (recommended for production)
		const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
		if (POLAR_WEBHOOK_SECRET) {
			const signature = req.headers["polar-signature"];
			if (!signature) {
				return res.status(401).json({ error: "Missing signature" });
			}

			const body = JSON.stringify(req.body);
			const expectedSignature = crypto
				.createHmac("sha256", POLAR_WEBHOOK_SECRET)
				.update(body)
				.digest("hex");

			if (signature !== expectedSignature) {
				return res.status(401).json({ error: "Invalid signature" });
			}
		}

		const event = req.body;

		// Handle different event types
		switch (event.type) {
			case "checkout.created":
			case "subscription.created":
			case "subscription.updated":
				await handleSubscriptionEvent(event);
				break;

			case "subscription.canceled":
				await handleSubscriptionCanceledEvent(event);
				break;

			case "payment.created":
			case "payment.succeeded":
			case "payment.failed":
				await handlePaymentEvent(event);
				break;

			case "customer.created":
			case "customer.updated":
				await handleCustomerEvent(event);
				break;

			default:
				console.log("Unhandled event type:", event.type);
		}

		return res.status(200).json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

async function handleSubscriptionEvent(event) {
	const subscription = event.data;
	const customerId = subscription.customer_id;

	if (!customerId) {
		console.error("No customer ID in subscription event");
		return;
	}

	// Enrich customer data
	const customerData = await enrichCustomerData(
		customerId,
		subscription.customer
	);

	if (!customerData.isValid) {
		console.warn(
			`Skipping subscription event for invalid customer: ${customerId}`
		);
		return;
	}

	// Get existing customer data for comparison
	const existingCustomer = await getCustomerFromFirestore(customerId);
	const existingCustomerData = existingCustomer || {};

	// Get plan information
	const planData = await enrichPlanData(
		customerId,
		subscription.product,
		subscription
	);

	const isUpgrade =
		existingCustomerData.plan_id &&
		existingCustomerData.plan_id !== planData.planId &&
		existingCustomerData.plan_name !== planData.planName;

	const isCancelled =
		subscription.status === "canceled" || subscription.status === "cancelled";

	// Update customer in Supabase
	const expiresAt = subscription.current_period_end
		? normalizeDate(subscription.current_period_end)
		: existingCustomerData.expires_at || null;

	const updatedCustomerData = {
		customer_id: customerId,
		email: customerData.email,
		name: customerData.name,
		plan_id: planData.planId,
		plan_name: planData.planName,
		status: subscription.status || "active",
		expires_at: expiresAt,
	};

	await saveCustomer(updatedCustomerData);

	// Store payment record for subscription events
	const periodStart =
		subscription.current_period_start || subscription.created_at;
	const paymentId =
		subscription.latest_invoice?.payment_intent?.id ||
		subscription.latest_invoice?.id ||
		`sub_${subscription.id}_${periodStart || Date.now()}`;

	const paymentStatus = await verifyPaymentStatus(
		getPaymentStatusFromSubscription(subscription.status),
		customerId,
		subscription.id
	);

	await storePaymentRecord({
		paymentId: paymentId,
		customerId: customerId,
		customerEmail: customerData.email,
		customerName: customerData.name,
		amount: subscription?.price?.amount,
		currency: subscription?.price?.currency || DEFAULTS.CURRENCY,
		status: paymentStatus,
		planId: planData?.planId,
		planName: planData?.planName,
		subscriptionId: subscription.id,
		createdAt: subscription?.current_period_start || subscription?.created_at,
		paymentType: "subscription",
		eventType: event.type,
	});

	// Send appropriate emails based on subscription status
	if (customerData.isValid) {
		try {
			if (isCancelled) {
				const expiresAtDate = expiresAt;
				await sendSubscriptionCancellationEmail({
					customerEmail: customerData?.email,
					customerName: customerData?.name,
					planName: planData?.planName,
					expiresAt: expiresAtDate,
				});
			} else if (isUpgrade && existingCustomerData.plan_name) {
				const expiresAtDate = expiresAt;
				await sendSubscriptionUpgradeEmail({
					customerEmail: customerData?.email,
					customerName: customerData?.name,
					oldPlanName: existingCustomerData?.plan_name,
					newPlanName: planData?.planName,
					amount: subscription?.price?.amount || 0,
					currency: subscription?.price?.currency || DEFAULTS.CURRENCY,
					expiresAt: expiresAtDate,
				});
			}
		} catch (error) {
			console.error("Failed to send subscription email:", error);
			// Don't throw - email failure shouldn't break the webhook
		}
	}
}

async function handleSubscriptionCanceledEvent(event) {
	const subscription = event.data;
	const customerId = subscription.customer_id;

	if (!customerId) {
		console.error("No customer ID in subscription canceled event");
		return;
	}

	// Enrich customer data
	const customerData = await enrichCustomerData(
		customerId,
		subscription.customer
	);

	// Get existing customer data
	const existingCustomer = await getCustomerFromFirestore(customerId);
	if (!existingCustomer) {
		console.error("Customer not found in Firestore for cancellation");
		return;
	}

	// Get plan information
	const planData = await enrichPlanData(
		customerId,
		subscription.product,
		subscription
	);

	const expiresAt = subscription?.current_period_end
		? normalizeDate(subscription.current_period_end)
		: normalizeDate(existingCustomer?.expires_at);

	// Update customer status to canceled
	const updatedCustomerData = {
		customer_id: customerId,
		email: customerData.email || existingCustomer?.email,
		name: customerData.name || existingCustomer?.name,
		plan_id: planData.planId || existingCustomer?.plan_id || null,
		plan_name: planData.planName,
		status: "canceled",
		expires_at: expiresAt ? expiresAt : null,
	};

	await saveCustomer(updatedCustomerData);

	// Send cancellation email
	if (customerData.isValid) {
		try {
			const expiresAtDate = normalizeDate(expiresAt);
			await sendSubscriptionCancellationEmail({
				customerEmail: customerData?.email,
				customerName: customerData?.name,
				planName: planData.planName,
				expiresAt: expiresAtDate,
			});
			console.log(
				"Subscription cancellation email sent to:",
				customerData.email
			);
		} catch (error) {
			console.error("Failed to send subscription cancellation email:", error);
			// Don't throw - email failure shouldn't break the webhook
		}
	}

	console.log("Subscription canceled for customer:", customerId);
}

async function handlePaymentEvent(event) {
	const payment = event.data;

	// Validate required fields
	if (!payment.id || !payment.customer_id) {
		console.error("Payment event missing required fields:", {
			id: payment.id,
			customer_id: payment.customer_id,
		});
		return;
	}

	// Enrich customer data from multiple sources
	const customerData = await enrichCustomerData(
		payment.customer_id,
		payment.customer
	);

	// Enrich plan data from multiple sources
	const planData = await enrichPlanData(
		payment?.customer_id,
		payment?.product,
		payment?.subscription || {}
	);

	// Verify payment status against subscription if available
	let paymentStatus = payment.status || DEFAULTS.STATUS;
	if (payment.subscription_id) {
		paymentStatus = await verifyPaymentStatus(
			paymentStatus,
			payment?.customer_id,
			payment?.subscription_id
		);
	}

	// Store payment record with all enriched data
	await storePaymentRecord({
		paymentId: payment.id,
		customerId: payment.customer_id,
		customerEmail: customerData?.email,
		customerName: customerData?.name,
		amount: payment?.amount || 0,
		currency: payment?.currency || DEFAULTS.CURRENCY,
		status: paymentStatus,
		planId: planData?.planId,
		planName: planData?.planName,
		subscriptionId: payment?.subscription_id || null,
		createdAt: payment?.created_at,
		paymentType: "payment",
		eventType: event?.type,
	});

	// If payment succeeded, update customer subscription status
	if (payment.status === "succeeded" && payment.customer_id) {
		await saveCustomer({
			customer_id: payment.customer_id,
			status: "active",
		});

		// Get customer data for email (use enriched data)
		const customerForEmail = await getCustomerFromFirestore(
			payment.customer_id
		);
		const emailCustomerData = customerForEmail || {};

		// Send payment confirmation email using enriched data
		const emailToUse = customerData.email || emailCustomerData.email;
		if (emailToUse && customerData.isValid) {
			try {
				const expiresAtDate = normalizeDate(emailCustomerData.expires_at);
				await sendSubscriptionConfirmationEmail({
					customerEmail: emailToUse,
					customerName:
						customerData.name ||
						emailCustomerData.name ||
						DEFAULTS.CUSTOMER_NAME,
					planName: planData.planName,
					amount: payment.amount || 0,
					currency: payment.currency || DEFAULTS.CURRENCY,
					paymentId: payment.id,
					expiresAt: expiresAtDate,
				});
			} catch (error) {
				console.error("Failed to send payment confirmation email:", error);
				// Don't throw - email failure shouldn't break the webhook
			}
		}
	}
}

async function handleCustomerEvent(event) {
	const customer = event.data;

	// Store customer in Supabase
	const customerData = {
		customer_id: customer.id,
		email: customer.email || null,
		name: customer.name || customer.email || DEFAULTS.CUSTOMER_NAME,
	};

	await saveCustomer(customerData);
}
