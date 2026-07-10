import { supabase } from "../../../lib/config/supabase";
import getStripe from "../../../lib/utils/getStripe";
import { sendSlotPaymentEmail } from "../../../lib/api/subscriptionEmails";

export const config = {
	api: {
		bodyParser: false,
	},
};

async function readRawBody(req) {
	const chunks = [];
	for await (const chunk of req) {
		chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

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

	let event;
	try {
		const rawBody = await readRawBody(req);
		const stripe = getStripe();
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	} catch (err) {
		console.error("Webhook signature verification failed:", err.message);
		return res.status(400).json({ error: `Webhook Error: ${err.message}` });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed":
				await handleCheckoutCompleted(event.data.object);
				break;
			case "checkout.session.async_payment_succeeded":
				await handleCheckoutCompleted(event.data.object);
				break;
			case "checkout.session.async_payment_failed":
				await markSubmissionPaymentFailed(event.data.object);
				break;
			case "payment_intent.payment_failed":
				await handlePaymentIntentFailed(event.data.object);
				break;
			default:
				console.log("Unhandled Stripe event:", event.type);
		}

		return res.status(200).json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

async function handleCheckoutCompleted(session) {
	const meta = session.metadata || {};
	const submissionId = meta.submissionId;
	const customerEmail = (
		session.customer_details?.email ||
		session.customer_email ||
		""
	)
		.toLowerCase()
		.trim();
	const customerName =
		session.customer_details?.name ||
		customerEmail?.split("@")[0] ||
		"Customer";
	const stripeCustomerId =
		typeof session.customer === "string" ? session.customer : null;

	const amountCents =
		typeof session.amount_total === "number"
			? session.amount_total
			: Math.round(Number(meta.slotPrice || 0) * 100);
	const currency = session.currency || "usd";
	const paymentId =
		(typeof session.payment_intent === "string"
			? session.payment_intent
			: session.payment_intent?.id) || `checkout_${session.id}`;

	const planName = meta.slotLabel
		? `Launch slot — ${meta.slotLabel}`
		: "Launch slot";

	// 1) Mark submission paid
	if (submissionId) {
		const { error: subErr } = await supabase
			.from("tool_submissions")
			.update({
				payment_status: "paid",
				payment_id: paymentId,
				stripe_session_id: session.id,
				stripe_customer_id: stripeCustomerId,
				updated_at: new Date().toISOString(),
			})
			.eq("id", submissionId);

		if (subErr) {
			console.error("Error updating tool_submission payment:", subErr);
		}
	}

	// 2) Upsert customer (admin + user linking)
	if (customerEmail || stripeCustomerId) {
		const customerRow = {
			email: customerEmail || `unknown+${session.id}@tooldir.local`,
			name: customerName,
			plan_name: planName,
			plan_id: meta.submissionId || null,
			status: "active",
			updated_at: new Date().toISOString(),
		};
		if (stripeCustomerId) {
			customerRow.customer_id = stripeCustomerId;
		}

		const { error: custErr } = stripeCustomerId
			? await supabase
					.from("customers")
					.upsert(customerRow, { onConflict: "customer_id" })
			: await upsertCustomerByEmail(customerRow);

		if (custErr) {
			console.error("Error upserting customer:", custErr);
		}
	}

	// 3) Upsert users row by email (admin Users tab)
	if (customerEmail) {
		const { data: existingUser } = await supabase
			.from("users")
			.select("id")
			.eq("email", customerEmail)
			.maybeSingle();

		const userPayload = {
			email: customerEmail,
			name: customerName,
			display_name: customerName,
			updated_at: new Date().toISOString(),
		};

		if (existingUser?.id) {
			await supabase.from("users").update(userPayload).eq("id", existingUser.id);
		} else {
			await supabase.from("users").insert({
				...userPayload,
				created_at: new Date().toISOString(),
			});
		}
	}

	// 4) Payment row for admin Payments tab (amount in cents)
	const paymentData = {
		payment_id: paymentId,
		customer_id: stripeCustomerId,
		email: customerEmail || null,
		amount: amountCents,
		currency,
		status: "succeeded",
		plan_name: planName,
		plan_id: submissionId || meta.submissionId || null,
		updated_at: new Date().toISOString(),
		created_at: new Date().toISOString(),
	};

	const { error: payErr } = await supabase
		.from("payments")
		.upsert(paymentData, { onConflict: "payment_id" });

	if (payErr) {
		console.error("Error saving payment:", payErr);
	}

	// 5) Mark checkout complete
	if (session.id) {
		await supabase
			.from("checkouts")
			.update({
				status: "completed",
				customer_id: stripeCustomerId,
				updated_at: new Date().toISOString(),
			})
			.eq("checkout_id", session.id);
	}

	// 6) Sample Resend receipt
	let toolName = meta.toolName || null;
	if (!toolName && submissionId) {
		const { data: sub } = await supabase
			.from("tool_submissions")
			.select("name")
			.eq("id", submissionId)
			.maybeSingle();
		toolName = sub?.name || null;
	}

	try {
		await sendSlotPaymentEmail({
			customerEmail,
			customerName,
			toolName,
			slotLabel: meta.slotLabel,
			launchDate: meta.launchDate,
			amountCents,
			currency,
			paymentId,
			submissionId,
		});
	} catch (emailErr) {
		console.error("Failed to send payment email:", emailErr);
	}
}

async function upsertCustomerByEmail(customerRow) {
	const { data: existing } = await supabase
		.from("customers")
		.select("id, customer_id")
		.eq("email", customerRow.email)
		.maybeSingle();

	if (existing?.id) {
		return supabase
			.from("customers")
			.update(customerRow)
			.eq("id", existing.id);
	}

	return supabase.from("customers").insert({
		...customerRow,
		customer_id: customerRow.customer_id || `local_${Date.now()}`,
		created_at: new Date().toISOString(),
	});
}

async function markSubmissionPaymentFailed(session) {
	const submissionId = session?.metadata?.submissionId;
	if (!submissionId) return;

	await supabase
		.from("tool_submissions")
		.update({
			payment_status: "failed",
			updated_at: new Date().toISOString(),
		})
		.eq("id", submissionId);

	if (session.id) {
		await supabase
			.from("checkouts")
			.update({ status: "failed", updated_at: new Date().toISOString() })
			.eq("checkout_id", session.id);
	}
}

async function handlePaymentIntentFailed(pi) {
	const submissionId = pi?.metadata?.submissionId;
	if (!submissionId) return;

	await supabase
		.from("tool_submissions")
		.update({
			payment_status: "failed",
			payment_id: pi.id,
			updated_at: new Date().toISOString(),
		})
		.eq("id", submissionId);
}
