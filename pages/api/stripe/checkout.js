import { supabase } from "../../../lib/config/supabase";
import getStripe from "../../../lib/utils/getStripe";

/**
 * Create a one-time Stripe Checkout session for a launch-slot booking.
 *
 * Body: {
 *   submissionId,     // required — tool_submissions.id
 *   slotLabel?,
 *   slotPrice?,       // dollars (integer). Overridden to 0 when STRIPE_TEST_ZERO=true
 *   launchDate?,
 *   userEmail?,
 *   customerId?,      // existing Stripe customer id (optional)
 * }
 *
 * Set STRIPE_TEST_ZERO=true to skip Stripe and mark the submission paid at $0
 * (payment_method_collection is subscription-only; $0 one-time Checkout is unreliable).
 */
export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const {
			submissionId,
			slotLabel = "Launch slot",
			slotPrice = 0,
			launchDate,
			userEmail,
			customerId,
		} = req.body || {};

		if (!submissionId) {
			return res.status(400).json({ error: "submissionId is required" });
		}

		const testZero =
			process.env.STRIPE_TEST_ZERO === "true" ||
			process.env.NEXT_PUBLIC_STRIPE_TEST_ZERO === "true";

		const priceDollars = testZero
			? 0
			: Math.max(0, Math.round(Number(slotPrice) || 0));
		const unitAmountCents = priceDollars * 100;

		const appOrigin =
			req.headers.origin ||
			process.env.NEXT_PUBLIC_SITE_URL ||
			process.env.NEXT_PUBLIC_APP_URL ||
			"http://localhost:3002";

		const successUrl = `${appOrigin}/submit?payment=success&submissionId=${encodeURIComponent(submissionId)}`;
		const cancelUrl = `${appOrigin}/submit?payment=cancelled&submissionId=${encodeURIComponent(submissionId)}`;

		// $0 / test mode: no Stripe session (one-time Checkout rejects
		// payment_method_collection and $0 payment mode is awkward).
		// Mark paid locally so admin Payments + submission update still work.
		if (unitAmountCents === 0) {
			const paymentId = `test_zero_${submissionId}_${Date.now()}`;
			const email = userEmail
				? String(userEmail).toLowerCase().trim()
				: null;
			const planName = `Launch slot — ${slotLabel}`;

			await supabase
				.from("tool_submissions")
				.update({
					payment_status: "paid",
					payment_id: paymentId,
					updated_at: new Date().toISOString(),
				})
				.eq("id", submissionId);

			await supabase.from("payments").upsert(
				{
					payment_id: paymentId,
					customer_id: customerId || null,
					email,
					amount: 0,
					currency: "usd",
					status: "succeeded",
					plan_name: planName,
					plan_id: String(submissionId),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
				{ onConflict: "payment_id" }
			);

			if (email) {
				await supabase.from("customers").upsert(
					{
						customer_id: customerId || `test_${submissionId}`,
						email,
						name: email.split("@")[0],
						plan_name: planName,
						plan_id: String(submissionId),
						status: "active",
						updated_at: new Date().toISOString(),
						created_at: new Date().toISOString(),
					},
					{ onConflict: "customer_id" }
				);
			}

			return res.status(200).json({
				checkoutUrl: successUrl,
				checkoutId: paymentId,
				amount: 0,
				testZero: true,
			});
		}

		if (!process.env.STRIPE_SECRET_KEY) {
			return res.status(500).json({
				error: "Stripe API credentials not configured",
			});
		}

		const productName = launchDate
			? `ToolDir ${slotLabel} — ${launchDate}`
			: `ToolDir ${slotLabel}`;

		const sessionParams = {
			mode: "payment",
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "usd",
						unit_amount: unitAmountCents,
						product_data: {
							name: productName,
							description: "One-time launch slot on ToolDir",
						},
					},
					quantity: 1,
				},
			],
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: {
				source: "tooldir",
				type: "launch_slot",
				submissionId: String(submissionId),
				slotLabel: String(slotLabel),
				slotPrice: String(priceDollars),
				launchDate: launchDate ? String(launchDate) : "",
				testZero: "false",
			},
			payment_intent_data: {
				metadata: {
					source: "tooldir",
					type: "launch_slot",
					submissionId: String(submissionId),
				},
			},
		};

		if (customerId) {
			sessionParams.customer = customerId;
		} else if (userEmail) {
			sessionParams.customer_email = String(userEmail).toLowerCase().trim();
		}

		const stripe = getStripe();
		const session = await stripe.checkout.sessions.create(sessionParams);

		try {
			await supabase.from("checkouts").upsert(
				{
					checkout_id: session.id,
					plan_id: `slot:${slotLabel}`,
					customer_id: customerId || null,
					status: "pending",
					updated_at: new Date().toISOString(),
				},
				{ onConflict: "checkout_id" }
			);
		} catch (dbError) {
			console.error("Error storing checkout:", dbError);
		}

		const { error: linkErr } = await supabase
			.from("tool_submissions")
			.update({
				stripe_session_id: session.id,
				payment_status: "pending",
				updated_at: new Date().toISOString(),
			})
			.eq("id", submissionId);

		if (linkErr) {
			console.warn(
				"Could not link submission to checkout (run payment column migration):",
				linkErr.message
			);
		}

		return res.status(200).json({
			checkoutUrl: session.url,
			checkoutId: session.id,
			amount: priceDollars,
			testZero: false,
		});
	} catch (error) {
		console.error("Error creating checkout:", error);
		return res.status(500).json({
			error: error.message || "Internal server error",
		});
	}
}
