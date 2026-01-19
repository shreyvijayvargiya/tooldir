import { supabase } from "../../../lib/config/supabase";
import getStripe from "../../../lib/utils/getStripe";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { planId, customerId, userEmail } = req.body;

		if (!planId) {
			return res.status(400).json({ error: "Plan ID is required" });
		}

		if (!process.env.STRIPE_SECRET_KEY) {
			return res.status(500).json({
				error: "Stripe API credentials not configured",
			});
		}

		// Get user email from request (you may need to pass this from the frontend)
		// For now, we'll create a checkout session without customer email
		// The customer will enter their email during checkout
		const successUrl = `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?success=true`;
		const cancelUrl = `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?cancelled=true`;

		// Create Stripe Checkout Session
		const sessionParams = {
			mode: "subscription",
			payment_method_types: ["card"],
			line_items: [
				{
					price: planId, // Stripe Price ID
					quantity: 1,
				},
			],
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: {
				source: "saas-app",
				// customerId: customerId || null,
			},
			subscription_data: {
				metadata: {
					source: "saas-app",
					// customerId: customerId || null,
				},
			},
		};

		// If we have a customerId (Stripe Customer ID), add it to the session
		if (customerId) {
			sessionParams.customer = customerId;
		} else if (userEmail) {
			// If we have user email but no customerId, pre-fill the email
			sessionParams.customer_email = userEmail;
		}
		// If neither customerId nor userEmail, Stripe will collect email during checkout

		const stripe = getStripe();
		const session = await stripe.checkout.sessions.create(sessionParams);

		// Store checkout session in Supabase (optional, for tracking)
		if (session.id) {
			try {
				// Determine user_id if possible, but we don't have it explicitly here usually unless passed in body
				// Assuming 'checkouts' table structure.
				await supabase.from("checkouts").insert({
					checkout_id: session.id,
					plan_id: planId,
					customer_id: customerId || null,
					status: "pending",
					created_at: new Date().toISOString(),
				});
			} catch (dbError) {
				console.error("Error storing checkout:", dbError);
				// Don't fail the request if DB write fails
			}
		}

		return res.status(200).json({
			checkoutUrl: session.url,
			checkoutId: session.id,
		});
	} catch (error) {
		console.error("Error creating checkout:", error);
		return res.status(500).json({
			error: error.message || "Internal server error",
		});
	}
}