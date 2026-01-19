/**
 * Products API
 * Client-side API functions for managing products
 */

import { supabase } from "../config/supabase";

const PRODUCTS_TABLE = "products";

/**
 * Get all products from Supabase
 * @returns {Promise<Array>} Array of products from Supabase
 */
export async function getAllProducts() {
	try {
		const { data, error } = await supabase
			.from(PRODUCTS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;

		return data || [];
	} catch (error) {
		console.error("Error getting products:", error);
		// Fallback: try without ordering if index is missing
		try {
			const { data, error } = await supabase.from(PRODUCTS_TABLE).select("*");

			if (error) throw error;

			// Sort manually
			const products = data || [];
			products.sort((a, b) => {
				const dateA = new Date(a.created_at || 0);
				const dateB = new Date(b.created_at || 0);
				return dateB.getTime() - dateA.getTime(); // Descending order
			});

			return products;
		} catch (fallbackError) {
			console.error("Error getting products (fallback):", fallbackError);
			throw fallbackError;
		}
	}
}

/**
 * Get product by ID from Supabase
 * @param {string} productId - Supabase product ID (UUID or string)
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
			if (error.code === 'PGRST116') {
				throw new Error("Product not found");
			}
			throw error;
		}

		if (data) {
			return data;
		} else {
			throw new Error("Product not found");
		}
	} catch (error) {
		console.error("Error getting product:", error);
		throw error;
	}
}

/**
 * Create a new product via Server-Side API
 * API handles Stripe creation and Supabase storage
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product from API response
 */
export async function createProduct(productData) {
	try {
		const createResponse = await fetch("/api/stripe/products/create", {
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
			throw new Error(errorData.error || "Failed to create product");
		}

		const responseData = await createResponse.json();
		return responseData.product;
	} catch (error) {
		console.error("Error creating product:", error);
		throw error;
	}
}

/**
 * Update a product via Server-Side API
 * API handles Stripe update and Supabase storage
 * @param {string} productId - Supabase product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product from API response
 */
export async function updateProduct(productId, productData) {
	try {
		// Get existing product to identify Stripe ID
		const existingProduct = await getProductById(productId);
		const stripeProductId = existingProduct.stripe_product_id;

		if (!stripeProductId) {
			throw new Error("Product does not have a Stripe product ID");
		}

		const updateResponse = await fetch("/api/stripe/products/update", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				stripeProductId: stripeProductId,
				name: productData.name,
				description: productData.description,
				bannerImages: productData.bannerImages,
				prices: productData.prices,
			}),
		});

		if (!updateResponse.ok) {
			const errorData = await updateResponse.json();
			throw new Error(errorData.error || "Failed to update product");
		}

		const responseData = await updateResponse.json();
		return responseData.product;
	} catch (error) {
		console.error("Error updating product:", error);
		throw error;
	}
}

/**
 * Delete a product from Stripe and Supabase
 * @param {string} productId - Supabase product ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
	try {
		// Get existing product from Supabase to get Stripe product ID
		const existingProduct = await getProductById(productId);
		const stripeProductId = existingProduct.stripe_product_id;

		// Step 1: Archive product in Stripe (server-side)
		if (stripeProductId) {
			try {
				await fetch("/api/stripe/products/delete", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						stripeProductId: stripeProductId,
					}),
				});
				// We ignore errors here usually, just try to archive
			} catch (stripeError) {
				console.warn("Error archiving product in Stripe:", stripeError);
			}
		}

		// Step 2: Delete from Supabase (Client-side)
		// Assuming user has permission to delete own products
		// If RLS prevents this, we should move this to a server-side API too
		const { error } = await supabase
			.from(PRODUCTS_TABLE)
			.delete()
			.eq("id", productId);

		if (error) throw error;

		return;
	} catch (error) {
		console.error("Error deleting product:", error);
		throw error;
	}
}
