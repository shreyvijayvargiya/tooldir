import getStripe from "../../../../lib/utils/getStripe";

/**
 * Delete product from Stripe API
 * DELETE /api/stripe/products/delete
 * Body: { stripeProductId: string }
 */
export default async function handler(req, res) {
	if (req.method !== "DELETE") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { stripeProductId } = req.body;

		if (!stripeProductId) {
			return res.status(400).json({
				error: "Stripe product ID is required",
			});
		}

		if (!process.env.STRIPE_SECRET_KEY) {
			return res.status(500).json({
				error: "Stripe API credentials not configured",
			});
		}

		const stripe = getStripe();

		// Archive (soft delete) the product in Stripe
		// Stripe doesn't allow hard deletion of products that have been used
		await stripe.products.update(stripeProductId, {
			active: false,
		});

		return res.status(200).json({
			success: true,
			message: "Product archived successfully",
		});
	} catch (error) {
		console.error("Error deleting product from Stripe:", error);

		// Handle specific Stripe errors
		if (error.type === "StripeInvalidRequestError") {
			if (error.code === "resource_missing") {
				return res.status(404).json({
					error: "Product not found in Stripe",
				});
			}
			return res.status(400).json({
				error: error.message || "Invalid request to Stripe",
			});
		}

		return res.status(500).json({
			error: "Internal server error",
		});
	}
}
