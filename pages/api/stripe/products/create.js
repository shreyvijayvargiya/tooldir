import { uploadFileToStorage, base64ToBuffer, getMimeType } from "./fileUpload";
import getStripe from "../../../../lib/utils/getStripe";
import { supabase } from "../../../../lib/config/supabase";

/**
 * Create product in Stripe API and store in Supabase
 * POST /api/stripe/products/create
 * Body: { name: string, description?: string, prices: Array, bannerImages?: Array<{base64: string, fileName: string}> }
 */
export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { name, description, prices, bannerImages } = req.body;

		if (!name || !prices || !Array.isArray(prices) || prices.length === 0) {
			return res.status(400).json({
				error: "Name and prices array are required",
			});
		}

		if (!process.env.STRIPE_SECRET_KEY) {
			return res.status(500).json({
				error: "Stripe API credentials not configured",
			});
		}

		if (!supabase) {
			return res.status(500).json({
				error: "Supabase Client not configured.",
			});
		}

		const stripe = getStripe();

		// Upload banner images to Supabase Storage if provided
		let imageUrls = [];
		if (
			bannerImages &&
			Array.isArray(bannerImages) &&
			bannerImages.length > 0
		) {
			try {
				for (const imageData of bannerImages) {
					// Support both new format (object with base64 and fileName) and legacy format (base64 string)
					let base64String, fileName;

					if (typeof imageData === "string") {
						// Legacy format: just a base64 string
						base64String = imageData;
						fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
					} else if (imageData.base64) {
						// New format: object with base64 and fileName
						base64String = imageData.base64;
						fileName =
							imageData.fileName ||
							`banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
					} else {
						console.warn("Invalid image data format, skipping:", imageData);
						continue;
					}

					// Validate file size (max 10MB)
					const fileBuffer = base64ToBuffer(base64String);
					if (fileBuffer.length > 10 * 1024 * 1024) {
						console.warn(`File ${fileName} exceeds 10MB limit, skipping`);
						continue;
					}

					const mimeType = getMimeType(base64String, fileName);

					// Upload to Supabase Storage
					const imageUrl = await uploadFileToStorage(
						fileBuffer,
						fileName,
						mimeType
					);

					imageUrls.push(imageUrl);
				}
			} catch (fileUploadError) {
				console.error(
					"Error uploading banner images to Supabase Storage:",
					fileUploadError
				);
				return res.status(500).json({
					error: "Failed to upload banner images",
					details: fileUploadError.message,
				});
			}
		}

		// Create Stripe Product
		const productParams = {
			name: name,
			description: description || undefined,
		};

		// Add images if we uploaded any
		if (imageUrls.length > 0) {
			productParams.images = imageUrls;
		}

		const stripeProduct = await stripe.products.create(productParams);

		// Create Stripe Prices for the product
		const createdPrices = [];
		for (const price of prices) {
			const amount = price.price_amount || price.amount || 0; // Amount in cents
			const currency = (price.price_currency || price.currency || "usd").toLowerCase();
			const interval = price.recurring_interval || price.interval || "one_time";

			const priceParams = {
				product: stripeProduct.id,
				currency: currency,
				unit_amount: amount, // Stripe expects amount in cents
			};

			// Add recurring interval if not one-time
			if (interval !== "one_time") {
				priceParams.recurring = {
					interval: interval === "month" ? "month" : "year",
				};
			}

			const stripePrice = await stripe.prices.create(priceParams);
			createdPrices.push({
				id: stripePrice.id,
				amount: stripePrice.unit_amount,
				currency: stripePrice.currency,
				interval: interval,
			});
		}

		// Generate Checkout Link using the first/main price
		let checkoutLink = "";
		if (createdPrices.length > 0) {
			const priceId = createdPrices[0].id;
			try {
				const sessionParams = {
					mode: "subscription",
					payment_method_types: ["card"],
					line_items: [
						{
							price: priceId,
							quantity: 1,
						},
					],
					success_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?success=true`,
					cancel_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?cancelled=true`,
					metadata: {
						source: "saas-app",
						productId: stripeProduct.id,
					},
				};

				if (createdPrices[0].interval === "one_time") {
					sessionParams.mode = "payment";
				}

				const session = await stripe.checkout.sessions.create(sessionParams);
				checkoutLink = session.url;
			} catch (checkoutError) {
				console.warn("Failed to create initial checkout link:", checkoutError);
			}
		}

		// Step 3: Store in Supabase
		const supabaseData = {
			// Using stripe_product_id column to store Stripe Product ID due to DB schema
			stipe_product_id: stripeProduct.id,
			name: name,
			description: description || "",
			banner_images: imageUrls.length > 0 ? imageUrls : [],
			prices: prices,
			checkout_link: checkoutLink,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { data: insertedProduct, error: insertError } = await supabase
			.from("products")
			.insert(supabaseData)
			.select()
			.single();

		if (insertError) {
			console.error("Error inserting product into Supabase:", insertError);
			throw new Error(`Product created in Stripe but failed to save to Database: ${insertError.message}`);
		}

		return res.status(200).json({
			success: true,
			product: insertedProduct,
			stripeProductId: stripeProduct.id,
			priceIds: createdPrices.map((p) => p.id),
		});

	} catch (error) {
		console.error("Error creating product:", error);
		return res.status(500).json({
			error: error.message || "Internal server error",
		});
	}
}
