import getStripe from "../../../../lib/utils/getStripe";

/**
 * Create checkout link for a product using Stripe Checkout
 * POST /api/stripe/products/checkout-link
 * Body: { productId: string (Stripe Product ID), priceId: string (Stripe Price ID) }
 */
export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { productId, priceId } = req.body;

		if (!priceId) {
			return res.status(400).json({
				error: "Price ID is required",
			});
		}

		if (!process.env.STRIPE_SECRET_KEY) {
			return res.status(500).json({
				error: "Stripe API credentials not configured",
			});
		}

		const stripe = getStripe();

		// Verify the price exists and get product info
		let stripeProduct = null;
		try {
			const price = await stripe.prices.retrieve(priceId, {
				expand: ["product"],
			});

			// Use product from price if productId not provided
			if (!productId && price.product) {
				stripeProduct =
					typeof price.product === "string"
						? await stripe.products.retrieve(price.product)
						: price.product;
			} else if (productId) {
				stripeProduct = await stripe.products.retrieve(productId);
			}
		} catch (error) {
			console.error("Error retrieving price/product:", error);
			return res.status(400).json({
				error: "Invalid price ID or product ID",
			});
		}

		// Create Stripe Checkout Session
		const sessionParams = {
			mode: "subscription", // Default to subscription, can be changed based on price type
			payment_method_types: ["card"],
			line_items: [
				{
					price: priceId, // Stripe Price ID
					quantity: 1,
				},
			],
			success_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?success=true`,
			cancel_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?cancelled=true`,
			metadata: {
				source: "saas-app",
				productId: productId || (stripeProduct ? stripeProduct.id : null),
			},
		};

		// Check if price is one-time or recurring
		try {
			const price = await stripe.prices.retrieve(priceId);
			if (!price.recurring) {
				// One-time payment
				sessionParams.mode = "payment";
			}
		} catch (error) {
			console.warn("Could not determine price type, defaulting to subscription");
		}

		const session = await stripe.checkout.sessions.create(sessionParams);

		return res.status(200).json({
			success: true,
			checkoutUrl: session.url,
			checkoutId: session.id,
		});
	} catch (error) {
		console.error("Error creating checkout link:", error);
		return res.status(500).json({
			error: error.message || "Internal server error",
		});
	}
}
