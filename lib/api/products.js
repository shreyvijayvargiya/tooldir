/**
 * Products API
 * Client-side API functions for managing products in Supabase
 * All Polar API calls are handled server-side via API routes
 */

import { supabase } from "./supabase";

const PRODUCTS_TABLE = "products";

/**
 * Get all products from Supabase ONLY
 * This function ONLY fetches from Supabase products table, NOT from Polar API
 * @returns {Promise<Array>} Array of products from Supabase
 */
export async function getAllProducts() {
	try {
		const { data, error } = await supabase
			.from(PRODUCTS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error getting products:", error);
		throw error;
	}
}

/**
 * Get product by ID from Supabase
 * @param {string} productId - Supabase product document ID
 * @returns {Promise<Object>} Product object
 */
export async function getProductById(productId) {
	try {
		const { data, error } = await supabase
			.from(PRODUCTS_TABLE)
			.select("*")
			.eq("id", productId)
			.single();

		if (error) {
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting product:", error);
		throw error;
	}
}

/**
 * Create a new product in Polar and Supabase
 * @param {Object} productData - Product data
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {Array} productData.prices - Pricing information array
 * @returns {Promise<Object>} Created product from Supabase
 */
export async function createProduct(productData) {
	try {
		// Step 1: Create product in Polar (server-side)
		const createResponse = await fetch("/api/polar/products/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: productData.name,
				description: productData.description,
				bannerImages: productData.bannerImages,
				prices: productData.prices,
			}),
		});

		if (!createResponse.ok) {
			const errorData = await createResponse.json();
			throw new Error(errorData.error || "Failed to create product in Polar");
		}

		const createData = await createResponse.json();
		const polarProduct = createData.product;
		const polarProductId = polarProduct.id;
		const priceId = createData.priceId;
		const mediaFileIds = createData.mediaFileIds || [];

		// Step 2: Create checkout link with price ID (server-side)
		let checkoutLink = "";
		try {
			const checkoutResponse = await fetch(
				"/api/polar/products/checkout-link",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						productId: polarProductId,
						priceId: priceId, // Pass the price ID to ensure correct price/plan
					}),
				}
			);

			if (checkoutResponse.ok) {
				const checkoutData = await checkoutResponse.json();
				checkoutLink = checkoutData.checkoutUrl || "";
			}
		} catch (checkoutError) {
			console.warn("Failed to create checkout link:", checkoutError);
			// Continue even if checkout link creation fails
		}

		// Step 3: Store in Supabase
		// Store banner images with their file IDs from Polar
		const supabaseData = {
			polar_product_id: polarProductId,
			name: productData.name,
			description: productData.description || "",
			banner_images: productData.bannerImages || [], // Store original banner image data
			media_file_ids: mediaFileIds, // Store Polar file IDs
			prices: productData.prices,
			checkout_link: checkoutLink,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from(PRODUCTS_TABLE)
			.insert(supabaseData)
			.select()
			.single();

		if (error) {
			throw error;
		}

		// Return the Supabase document
		return data;
	} catch (error) {
		console.error("Error creating product:", error);
		throw error;
	}
}

/**
 * Update a product in Polar and Supabase
 * @param {string} productId - Supabase product document ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product from Supabase
 */
export async function updateProduct(productId, productData) {
	try {
		// Get existing product from Supabase to get Polar product ID
		const existingProduct = await getProductById(productId);
		const polarProductId = existingProduct.polar_product_id;

		if (!polarProductId) {
			throw new Error("Product does not have a Polar product ID");
		}

		// Step 1: Update product in Polar (server-side)
		const updateResponse = await fetch("/api/polar/products/update", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				polarProductId: polarProductId,
				name: productData.name,
				description: productData.description,
				bannerImages: productData.bannerImages,
				prices: productData.prices,
			}),
		});

		if (!updateResponse.ok) {
			const errorData = await updateResponse.json();
			throw new Error(errorData.error || "Failed to update product in Polar");
		}

		const updateResponseData = await updateResponse.json();
		const priceId = updateResponseData.priceId;
		const mediaFileIds = updateResponseData.mediaFileIds;

		// Step 2: Regenerate checkout link with updated product and price ID
		let checkoutLink = existingProduct.checkout_link || "";
		try {
			const checkoutResponse = await fetch(
				"/api/polar/products/checkout-link",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						productId: polarProductId,
						priceId: priceId, // Pass the updated price ID
					}),
				}
			);

			if (checkoutResponse.ok) {
				const checkoutData = await checkoutResponse.json();
				checkoutLink = checkoutData.checkoutUrl || "";
			}
		} catch (checkoutError) {
			console.warn("Failed to regenerate checkout link:", checkoutError);
			// Continue with existing checkout link if regeneration fails
		}

		// Step 3: Update in Supabase with new checkout link
		const supabaseUpdateData = {
			name: productData.name,
			description: productData.description || "",
			banner_images:
				productData.bannerImages || existingProduct.banner_images || [],
			prices: productData.prices,
			checkout_link: checkoutLink,
			updated_at: new Date().toISOString(),
		};

		// Update media_file_ids if new ones were uploaded
		if (mediaFileIds && mediaFileIds.length > 0) {
			supabaseUpdateData.media_file_ids = mediaFileIds;
		}

		const { data, error } = await supabase
			.from(PRODUCTS_TABLE)
			.update(supabaseUpdateData)
			.eq("id", productId)
			.select()
			.single();

		if (error) {
			throw error;
		}

		// Return updated product
		return data;
	} catch (error) {
		console.error("Error updating product:", error);
		throw error;
	}
}

/**
 * Delete a product from Polar and Supabase
 * @param {string} productId - Supabase product document ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
	try {
		// Get existing product from Supabase to get Polar product ID
		const existingProduct = await getProductById(productId);
		const polarProductId = existingProduct.polar_product_id;

		// Step 1: Delete from Polar (server-side, if polarProductId exists)
		if (polarProductId) {
			try {
				const deleteResponse = await fetch("/api/polar/products/delete", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						polarProductId: polarProductId,
					}),
				});

				if (!deleteResponse.ok) {
					const errorData = await deleteResponse.json();
					console.warn("Failed to delete product from Polar:", errorData);
					// Continue to delete from Supabase even if Polar deletion fails
				}
			} catch (polarError) {
				console.warn("Error deleting product from Polar:", polarError);
				// Continue to delete from Supabase
			}
		}

		// Step 2: Delete from Supabase
		const { error } = await supabase
			.from(PRODUCTS_TABLE)
			.delete()
			.eq("id", productId);

		if (error) {
			throw error;
		}

		return;
	} catch (error) {
		console.error("Error deleting product:", error);
		throw error;
	}
}

