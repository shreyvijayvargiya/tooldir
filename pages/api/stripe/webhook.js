import { supabase } from "../../../lib/config/supabase";
import getStripe from "../../../lib/utils/getStripe";
import {
	sendSubscriptionConfirmationEmail,
	sendSubscriptionCancellationEmail,
	sendSubscriptionUpgradeEmail,
} from "../../../lib/api/subscriptionEmails";

// Disable body parsing for webhook signature verification
export const config = {
	api: {
		bodyParser: false,
	},
};

// Helper function to normalize dates
const normalizeDate = (timestamp) => {
	if (!timestamp) return null;
	// If it's a Unix timestamp (seconds), convert to milliseconds
	if (typeof timestamp === "number") {
		return new Date(timestamp * 1000);
	}
	// If it's already a Date object
	if (timestamp instanceof Date) {
		return timestamp;
	}
	// Try to parse as date string
	try {
		return new Date(timestamp);
	} catch (error) {
		console.error("Error normalizing date:", error);
		return null;
	}
};

// Helper function to get customer data from Supabase
const getCustomerFromSupabase = async (customerId) => {
	try {
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.eq("customer_id", customerId) // Assuming customer_id is the Stripe Customer ID column
			.single();

		if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
			console.error("Error getting customer from Supabase:", error);
			return null;
		}
		return data;
	} catch (error) {
		console.error("Error getting customer from Supabase:", error);
		return null;
	}
};

// Helper function to get plan name from Stripe Price/Product
const getPlanName = async (priceId) => {
	try {
		const stripe = getStripe();
		const price = await stripe.prices.retrieve(priceId, {
			expand: ["product"],
		});
		return price.product?.name || price.nickname || "Pro Plan";
	} catch (error) {
		console.error("Error fetching plan name:", error);
		return "Pro Plan";
	}
};

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const sig = req.headers["stripe-signature"];
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		console.error("Stripe webhook secret not configured");
		return res.status(500).json({ error: "Webhook secret not configured" });
	}

	// Read raw body from request stream
	let rawBody = "";
	await new Promise((resolve, reject) => {
		req.on("data", (chunk) => {
			rawBody += chunk.toString();
		});
		req.on("end", resolve);
		req.on("error", reject);
	});

	let event;

	try {
		// Verify webhook signature with raw body
		const stripe = getStripe();
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	} catch (err) {
		console.error("Webhook signature verification failed:", err.message);
		return res.status(400).json({ error: `Webhook Error: ${err.message}` });
	}

	try {
		// Handle different event types
		switch (event.type) {
			case "checkout.session.completed":
				await handleCheckoutCompleted(event);
				break;

			case "customer.subscription.created":
			case "customer.subscription.updated":
				await handleSubscriptionEvent(event);
				break;

			case "customer.subscription.deleted":
				await handleSubscriptionDeleted(event);
				break;

			case "invoice.payment_succeeded":
				await handlePaymentSucceeded(event);
				break;

			case "invoice.payment_failed":
				await handlePaymentFailed(event);
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

async function handleCheckoutCompleted(event) {
	const session = event.data.object;

	// Get customer email from session
	const customerEmail = session.customer_details?.email;
	const customerId = session.customer; // Stripe Customer ID
	const subscriptionId = session.subscription;

	if (!customerId || !customerEmail) {
		console.error("Missing customer ID or email in checkout session");
		return;
	}

	// Get subscription details if available
	let subscription = null;
	if (subscriptionId) {
		try {
			const stripe = getStripe();
			subscription = await stripe.subscriptions.retrieve(subscriptionId, {
				expand: ["items.data.price.product"],
			});
		} catch (error) {
			console.error("Error retrieving subscription:", error);
		}
	}

	// Get plan information
	const priceId =
		subscription?.items?.data[0]?.price?.id || session.metadata?.planId;
	const productId =
		subscription?.items?.data[0]?.price?.product?.id ||
		(typeof subscription?.items?.data[0]?.price?.product === "string"
			? subscription.items.data[0].price.product
			: null);
	const planName =
		subscription?.items?.data[0]?.price?.product?.name ||
		subscription?.items?.data[0]?.price?.nickname ||
		(await getPlanName(priceId));

	// Log for debugging
	console.log("handleCheckoutCompleted - Price ID:", priceId);
	console.log("handleCheckoutCompleted - Product ID:", productId);
	console.log("handleCheckoutCompleted - Plan Name:", planName);

	// Ensure we store the Price ID, not Product ID or other IDs
	if (!priceId || !priceId.startsWith("price_")) {
		console.warn("Warning: priceId is not a valid Stripe Price ID:", priceId);
	}

	// Update or create customer in Supabase
	// We try to upsert by customer_id

	const customerData = {
		customer_id: customerId,
		subscription_id: subscriptionId || null,
		email: customerEmail ? customerEmail.toLowerCase().trim() : null,
		name: session.customer_details?.name || customerEmail?.split("@")[0],
		plan_id: priceId || null,
		plan_name: planName,
		status: subscription?.status || "active",
		amount:
			subscription?.items?.data[0]?.price?.unit_amount !== undefined
				? subscription.items.data[0].price.unit_amount / 100
				: 0, // Store 0 for free plans, not null/undefined
		currency: subscription?.items?.data[0]?.price?.currency || "usd",
		expires_at: subscription?.current_period_end
			? normalizeDate(subscription.current_period_end).toISOString()
			: null,
		updated_at: new Date().toISOString(),
	};

	// Check if customer exists to set created_at
	const existingCustomer = await getCustomerFromSupabase(customerId);
	if (!existingCustomer) {
		customerData.created_at = new Date().toISOString();
	}

	// Upsert customer
	const { error: upsertError } = await supabase
		.from("customers")
		.upsert(customerData, { onConflict: 'customer_id' });

	if (upsertError) {
		console.error("Error upserting customer:", upsertError);
	}

	// Store payment record
	if (subscription?.items?.data[0]?.price?.unit_amount) {
		// We'll use upsert for payments as well to be safe
		const paymentId = session.payment_intent || `checkout_${session.id}`;

		const paymentData = {
			payment_id: paymentId,
			customer_id: customerId,
			customer_email: customerEmail,
			customer_name: customerData.name,
			amount: subscription.items.data[0].price.unit_amount / 100,
			currency: subscription.items.data[0].price.currency || "usd",
			status: "succeeded",
			plan_id: priceId,
			plan_name: planName,
			subscription_id: subscriptionId,
			payment_type: "subscription",
			event_type: event.type,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { error: paymentError } = await supabase
			.from("payments")
			.upsert(paymentData, { onConflict: 'payment_id' });

		if (paymentError) {
			console.error("Error saving payment:", paymentError);
		}
	}

	// Send confirmation email
	try {
		const expiresAtDate = typeof customerData.expires_at === 'string' ? new Date(customerData.expires_at) : customerData.expires_at;
		await sendSubscriptionConfirmationEmail({
			customerEmail: customerEmail,
			customerName: customerData.name,
			planName: planName,
			amount: customerData.amount,
			currency: customerData.currency,
			paymentId: session.payment_intent || session.id,
			expiresAt: expiresAtDate,
		});
	} catch (error) {
		console.error("Failed to send confirmation email:", error);
	}
}

async function handleSubscriptionEvent(event) {
	const subscription = event.data.object;
	const customerId = subscription.customer;

	if (!customerId) {
		console.error("No customer ID in subscription event");
		return;
	}

	// Get customer details from Stripe
	let customerEmail = null;
	let customerName = null;
	try {
		const stripe = getStripe();
		const customer = await stripe.customers.retrieve(customerId);
		customerEmail = customer.email;
		customerName = customer.name || customer.email?.split("@")[0];
	} catch (error) {
		console.error("Error retrieving customer:", error);
	}

	// Get existing customer data for comparison
	const existingCustomer = await getCustomerFromSupabase(customerId);
	const existingCustomerData = existingCustomer || {};

	// Get plan information
	const priceId = subscription.items?.data[0]?.price?.id;
	const productId =
		subscription.items?.data[0]?.price?.product?.id ||
		(typeof subscription.items?.data[0]?.price?.product === "string"
			? subscription.items.data[0].price.product
			: null);
	const planName =
		subscription.items?.data[0]?.price?.product?.name ||
		subscription.items?.data[0]?.price?.nickname ||
		(await getPlanName(priceId));

	// Log for debugging
	console.log("handleSubscriptionEvent - Price ID:", priceId);
	console.log("handleSubscriptionEvent - Product ID:", productId);
	console.log("handleSubscriptionEvent - Plan Name:", planName);

	const isUpgrade =
		existingCustomerData.plan_id && existingCustomerData.plan_id !== priceId;

	const isCancelled =
		subscription.status === "cancelled" || subscription.cancel_at_period_end;

	// Determine customer status based on subscription status
	let customerStatus = "active";
	if (subscription.status === "cancelled") {
		customerStatus = "cancelled";
	} else if (subscription.cancel_at_period_end) {
		customerStatus = "cancelled"; // Will cancel at period end
	} else if (
		subscription.status === "past_due" ||
		subscription.status === "unpaid"
	) {
		customerStatus = "past_due";
	} else if (subscription.status === "active") {
		customerStatus = "active";
	} else {
		customerStatus = subscription.status || "active";
	}

	// Update customer in Supabase
	const updatedCustomerData = {
		customer_id: customerId,
		subscription_id:
			subscription.id || existingCustomerData.subscription_id || null,
		email: customerEmail
			? customerEmail.toLowerCase().trim()
			: existingCustomerData.email || null,
		name: customerName || existingCustomerData.name,
		plan_id: priceId || existingCustomerData.plan_id || null,
		plan_name: planName,
		status: customerStatus, // Use determined status instead of subscription.status
		amount:
			subscription.items?.data[0]?.price?.unit_amount !== undefined
				? subscription.items.data[0].price.unit_amount / 100
				: existingCustomerData.amount !== undefined
					? existingCustomerData.amount
					: 0,
		currency:
			subscription.items?.data[0]?.price?.currency ||
			existingCustomerData.currency ||
			"usd",
		expires_at: subscription.current_period_end
			? normalizeDate(subscription.current_period_end).toISOString()
			: existingCustomerData.expires_at || null,
		updated_at: new Date().toISOString(),
	};

	// Add cancelledAt timestamp if subscription is cancelled
	if (isCancelled && !existingCustomerData.cancelled_at) {
		updatedCustomerData.cancelled_at = new Date().toISOString();
	}

	if (!existingCustomer) {
		updatedCustomerData.created_at = new Date().toISOString();
	}

	// Upsert
	const { error: upsertError } = await supabase
		.from("customers")
		.upsert(updatedCustomerData, { onConflict: 'customer_id' });

	if (upsertError) {
		console.error("Error upserting customer:", upsertError);
	}

	// Store payment record for subscription events
	if (subscription.items?.data[0]?.price?.unit_amount) {
		const paymentId = `sub_${subscription.id}_${subscription.current_period_start || Date.now()}`;

		const paymentData = {
			payment_id: paymentId,
			customer_id: customerId,
			customer_email: customerEmail || existingCustomerData.email,
			customer_name: customerName || existingCustomerData.name,
			amount: subscription.items.data[0].price.unit_amount / 100,
			currency: subscription.items.data[0].price.currency || "usd",
			status: subscription.status === "active" ? "succeeded" : "pending",
			plan_id: priceId,
			plan_name: planName,
			subscription_id: subscription.id,
			payment_type: "subscription",
			event_type: event.type,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { error: paymentError } = await supabase
			.from("payments")
			.upsert(paymentData, { onConflict: 'payment_id' });

		if (paymentError) {
			console.error("Error saving payment:", paymentError);
		}
	}

	// Send appropriate emails
	if (customerEmail) {
		try {
			if (isCancelled) {
				const expiresAtDate = updatedCustomerData.expires_at ? new Date(updatedCustomerData.expires_at) : null;
				await sendSubscriptionCancellationEmail({
					customerEmail: customerEmail,
					customerName: customerName || existingCustomerData.name,
					planName: planName,
					expiresAt: expiresAtDate,
				});
			} else if (isUpgrade && existingCustomerData.plan_name) {
				const expiresAtDate = updatedCustomerData.expires_at ? new Date(updatedCustomerData.expires_at) : null;
				await sendSubscriptionUpgradeEmail({
					customerEmail: customerEmail,
					customerName: customerName || existingCustomerData.name,
					oldPlanName: existingCustomerData.plan_name,
					newPlanName: planName,
					amount: updatedCustomerData.amount,
					currency: updatedCustomerData.currency,
					expiresAt: expiresAtDate,
				});
			}
		} catch (error) {
			console.error("Failed to send subscription email:", error);
		}
	}
}

async function handleSubscriptionDeleted(event) {
	const subscription = event.data.object;
	const customerId = subscription.customer;

	if (!customerId) {
		console.error("No customer ID in subscription deleted event");
		return;
	}

	// Get existing customer data
	const existingCustomer = await getCustomerFromSupabase(customerId);
	if (!existingCustomer) {
		console.error("Customer not found in Supabase for deletion");
		return;
	}

	// Get customer details from Stripe
	let customerEmail = existingCustomer.email;
	let customerName = existingCustomer.name;
	try {
		const stripe = getStripe();
		const customer = await stripe.customers.retrieve(customerId);
		customerEmail = customer.email || customerEmail;
		customerName = customer.name || customerName;
	} catch (error) {
		console.error("Error retrieving customer:", error);
	}

	// Get plan information
	const priceId = subscription.items?.data[0]?.price?.id;
	const planName =
		subscription.items?.data[0]?.price?.product?.name ||
		subscription.items?.data[0]?.price?.nickname ||
		existingCustomer.plan_name ||
		(await getPlanName(priceId));

	const expiresAt = subscription.current_period_end
		? normalizeDate(subscription.current_period_end).toISOString()
		: existingCustomer.expires_at;

	// Update customer status to cancelled (NEVER DELETE - only update status)
	// Keep all customer data, just mark as cancelled
	// Upsert to merge

	const updateData = {
		customer_id: customerId,
		subscription_id:
			subscription.id || existingCustomer.subscription_id || null,
		email: customerEmail
			? customerEmail.toLowerCase().trim()
			: existingCustomer.email,
		name: customerName || existingCustomer.name,
		plan_id: priceId || existingCustomer.plan_id || null,
		plan_name: planName || existingCustomer.plan_name,
		status: "cancelled", // Set status to cancelled, but keep customer record
		amount:
			existingCustomer.amount !== undefined ? existingCustomer.amount : 0,
		currency: existingCustomer.currency || "usd",
		expires_at: expiresAt,
		cancelled_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const { error: updateError } = await supabase
		.from("customers")
		.upsert(updateData, { onConflict: 'customer_id' });

	if (updateError) {
		console.error("Error updating customer cancellation:", updateError);
	}

	// Send cancellation email
	if (customerEmail) {
		try {
			const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
			await sendSubscriptionCancellationEmail({
				customerEmail: customerEmail,
				customerName: customerName,
				planName: planName,
				expiresAt: expiresAtDate,
			});
		} catch (error) {
			console.error("Failed to send cancellation email:", error);
		}
	}
}

async function handlePaymentSucceeded(event) {
	const invoice = event.data.object;
	const customerId = invoice.customer;
	const subscriptionId = invoice.subscription;

	if (!customerId) {
		console.error("No customer ID in payment succeeded event");
		return;
	}

	// Get customer details - use invoice data first, fallback to API call
	let customerEmail = invoice.customer_email || null;
	let customerName = invoice.customer_name || null;

	// If email/name not in invoice, retrieve from Stripe
	if (!customerEmail || !customerName) {
		try {
			const stripe = getStripe();
			const customer = await stripe.customers.retrieve(customerId);
			customerEmail = customerEmail || customer.email;
			customerName =
				customerName || customer.name || customer.email?.split("@")[0];
		} catch (error) {
			console.error("Error retrieving customer:", error);
		}
	}

	// Get subscription details if available
	let subscription = null;
	if (subscriptionId) {
		try {
			const stripe = getStripe();
			subscription = await stripe.subscriptions.retrieve(subscriptionId, {
				expand: ["items.data.price.product"],
			});
		} catch (error) {
			console.error("Error retrieving subscription:", error);
		}
	}

	// Get plan information from invoice lines (most reliable source)
	// invoice.lines.data[0].price.id is the Price ID
	// invoice.lines.data[0].price.product is a string (Product ID), not an object
	// invoice.lines.data[0].plan.id is also the Price ID
	const priceId =
		invoice.lines?.data[0]?.price?.id ||
		invoice.lines?.data[0]?.plan?.id ||
		subscription?.items?.data[0]?.price?.id;

	const productId =
		invoice.lines?.data[0]?.price?.product ||
		invoice.lines?.data[0]?.plan?.product ||
		subscription?.items?.data[0]?.price?.product?.id ||
		(typeof subscription?.items?.data[0]?.price?.product === "string"
			? subscription.items.data[0].price.product
			: null);

	// Get plan name - try subscription first (has expanded product), then fetch if needed
	let planName = null;
	if (subscription?.items?.data[0]?.price?.product?.name) {
		planName = subscription.items.data[0].price.product.name;
	} else if (subscription?.items?.data[0]?.price?.nickname) {
		planName = subscription.items.data[0].price.nickname;
	} else if (priceId) {
		planName = await getPlanName(priceId);
	}

	// Log for debugging
	console.log("handlePaymentSucceeded - Price ID:", priceId);
	console.log("handlePaymentSucceeded - Product ID:", productId);
	console.log("handlePaymentSucceeded - Plan Name:", planName);
	console.log("handlePaymentSucceeded - Customer Email:", customerEmail);
	console.log("handlePaymentSucceeded - Customer Name:", customerName);

	// Store payment record
	// Use invoice.id as payment ID if payment_intent is null (for $0 invoices)
	const paymentId = invoice.payment_intent || invoice.id;

	// Amount is already in cents, convert to dollars
	const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;

	const paymentData = {
		payment_id: paymentId,
		customer_id: customerId,
		customer_email: customerEmail ? customerEmail.toLowerCase().trim() : null,
		customer_name: customerName,
		amount: amount,
		currency: invoice.currency || "usd",
		status: "succeeded",
		plan_id: priceId, // Store Price ID (e.g., "price_1SjSw2GLY7dXLvjRXS42FloL")
		plan_name: planName,
		subscription_id: subscriptionId,
		payment_type: "subscription", // This is a subscription payment
		event_type: event.type,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const { error: paymentError } = await supabase
		.from("payments")
		.upsert(paymentData, { onConflict: 'payment_id' });

	if (paymentError) {
		console.error("Error saving payment:", paymentError);
	}

	// Update customer subscription status and planId
	// This ensures the customer record has the correct Price ID stored
	if (subscription || priceId) {
		// Load existing customer to preserve other fields
		const existingCustomer = await getCustomerFromSupabase(customerId);

		const updateData = {
			customer_id: customerId,
			status: "active",
			updated_at: new Date().toISOString(),
		};

		// Merge with existing logic (if exists) or create new (if not)
		// But for update, we can just upsert safely with required fields.
		// We do need to handle the fields similar to Firestore logic.

		// Update planId if we have it and it's different
		if (priceId) {
			updateData.plan_id = priceId;
		}

		// Update planName if we have it
		if (planName) {
			updateData.plan_name = planName;
		}

		// Update email and name if we have them
		if (customerEmail) {
			updateData.email = customerEmail.toLowerCase().trim();
		}
		if (customerName) {
			updateData.name = customerName;
		}

		// Update amount from subscription or invoice
		// Priority: subscription > invoice lines
		if (subscription?.items?.data[0]?.price?.unit_amount !== undefined) {
			updateData.amount = subscription.items.data[0].price.unit_amount / 100;
			updateData.currency = subscription.items.data[0].price.currency || "usd";
		} else if (invoice.lines?.data[0]?.price?.unit_amount !== undefined) {
			// Fallback to invoice line item if subscription not available
			updateData.amount = invoice.lines.data[0].price.unit_amount / 100;
			updateData.currency =
				invoice.lines.data[0].price.currency || invoice.currency || "usd";
		} else if (invoice.amount_paid !== undefined) {
			// Last fallback: use invoice amount_paid
			updateData.amount = invoice.amount_paid / 100;
			updateData.currency = invoice.currency || "usd";
		}

		// Update expiresAt from subscription
		if (subscription?.current_period_end) {
			updateData.expires_at = normalizeDate(subscription.current_period_end).toISOString();
		}

		if (!existingCustomer) {
			updateData.subscription_id = subscriptionId;
			updateData.created_at = new Date().toISOString();
		}

		const { error: customerUpdateError } = await supabase
			.from("customers")
			.upsert(updateData, { onConflict: 'customer_id' });

		if (customerUpdateError) {
			console.error("Error updating customer:", customerUpdateError);
		}

		// Send payment confirmation email only for recurring payments
		// Skip email for initial subscription (billing_reason: "subscription_create")
		// because handleCheckoutCompleted already sends it
		if (customerEmail && invoice.billing_reason !== "subscription_create") {
			try {
				const expiresAtDate = subscription?.current_period_end
					? normalizeDate(subscription.current_period_end)
					: null;
				await sendSubscriptionConfirmationEmail({
					customerEmail: customerEmail,
					customerName: customerName,
					planName: planName,
					amount: amount,
					currency: invoice.currency || "usd",
					paymentId: paymentId,
					expiresAt: expiresAtDate,
				});
			} catch (error) {
				console.error("Failed to send payment confirmation email:", error);
			}
		} else if (invoice.billing_reason === "subscription_create") {
			console.log(
				"Skipping email for initial subscription (already sent by checkout.session.completed)"
			);
		}
	}
}

async function handlePaymentFailed(event) {
	const invoice = event.data.object;
	const customerId = invoice.customer;

	if (!customerId) {
		console.error("No customer ID in payment failed event");
		return;
	}

	// Get customer details
	let customerEmail = null;
	let customerName = null;
	try {
		const stripe = getStripe();
		const customer = await stripe.customers.retrieve(customerId);
		customerEmail = customer.email;
		customerName = customer.name || customer.email?.split("@")[0];
	} catch (error) {
		console.error("Error retrieving customer:", error);
	}

	// Get plan information
	const priceId = invoice.lines?.data[0]?.price?.id;
	const planName =
		invoice.lines?.data[0]?.price?.product?.name ||
		(await getPlanName(priceId));

	// Store payment record
	const paymentId = invoice.payment_intent || invoice.id;

	const paymentData = {
		payment_id: paymentId,
		customer_id: customerId,
		customer_email: customerEmail,
		customer_name: customerName,
		amount: invoice.amount_due / 100,
		currency: invoice.currency || "usd",
		status: "failed",
		plan_id: priceId,
		plan_name: planName,
		subscription_id: invoice.subscription,
		payment_type: "payment",
		event_type: event.type,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	const { error: paymentError } = await supabase
		.from("payments")
		.upsert(paymentData, { onConflict: 'payment_id' });

	if (paymentError) {
		console.error("Error saving payment:", paymentError);
	}

	// Update customer subscription status
	const { error: customerError } = await supabase
		.from("customers")
		.update({
			status: "past_due",
			updated_at: new Date().toISOString(),
		})
		.eq("customer_id", customerId);

	if (customerError) {
		console.error("Error updating customer stats:", customerError);
	}
}

async function handleCustomerEvent(event) {
	const customer = event.data.object;

	// Store customer in Supabase
	// Upsert

	const customerData = {
		customer_id: customer.id,
		email: customer.email || null,
		name: customer.name || customer.email || "Customer",
		updated_at: new Date().toISOString(),
	};

	// Check if exists for created_at
	const existingCustomer = await getCustomerFromSupabase(customer.id);
	if (!existingCustomer) {
		customerData.created_at = new Date().toISOString();
	}

	const { error } = await supabase
		.from("customers")
		.upsert(customerData, { onConflict: 'customer_id' });

	if (error) {
		console.error("Error handling customer event:", error);
	}
}