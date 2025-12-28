import { getCustomerById, saveCustomer } from "../../../lib/api-supabase/customers";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { subscriptionId, customerId } = req.body;

		if (!subscriptionId && !customerId) {
			return res.status(400).json({
				error: "Subscription ID or Customer ID is required",
			});
		}

		// Get Polar API credentials from environment variables
		const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
		const POLAR_API_URL = process.env.POLAR_API_URL || "https://api.polar.sh";

		if (!POLAR_ACCESS_TOKEN) {
			return res.status(500).json({
				error: "Polar API credentials not configured",
			});
		}

		// If we only have customerId, get subscription from Supabase or Polar API
		let actualSubscriptionId = subscriptionId;
		if (!actualSubscriptionId && customerId) {
			// First, try to get customer from Supabase
			const customerData = await getCustomerById(customerId);
			
			if (customerData) {
				// Check if subscription ID is stored in customer data
				// Note: Supabase schema doesn't have subscription_id field, but keeping for compatibility
				if (customerData.subscription_id) {
					actualSubscriptionId = customerData.subscription_id;
				}
			}

			// If we still don't have subscription ID, fetch from Polar API
			if (!actualSubscriptionId) {
				try {
					const subscriptionsResponse = await fetch(
						`${POLAR_API_URL}/v1/subscriptions?customer_id=${customerId}`,
						{
							method: "GET",
							headers: {
								Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
								"Content-Type": "application/json",
							},
						}
					);

					if (subscriptionsResponse.ok) {
						const subscriptionsData = await subscriptionsResponse.json();
						
						if (subscriptionsData.items && subscriptionsData.items.length > 0) {
							// Get the first active subscription
							const activeSubscription = subscriptionsData.items.find(
								(sub) => sub.status === "active" || sub.status === "trialing"
							) || subscriptionsData.items[0]; // Fallback to first subscription if no active

							if (activeSubscription) {
								actualSubscriptionId = activeSubscription.id;
							}
						}
					}
				} catch (error) {
					console.error("Error fetching subscriptions from Polar:", error);
					// Continue - we'll try with what we have
				}
			}

			if (!actualSubscriptionId) {
				return res.status(404).json({ 
					error: "No subscription found for this customer. Please contact support." 
				});
			}
		}

		// Verify subscription exists before canceling
		if (!actualSubscriptionId) {
			return res.status(400).json({
				error: "Subscription ID is required",
			});
		}

		// Cancel subscription with Polar
		// Try PATCH method first (more common for subscription APIs)
		let cancelResponse = await fetch(
			`${POLAR_API_URL}/v1/subscriptions/${actualSubscriptionId}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cancel_at_period_end: true,
				}),
			}
		);

		// If PATCH doesn't work, try POST to /cancel endpoint
		if (!cancelResponse.ok && cancelResponse.status === 404) {
			console.log("Trying alternative cancel endpoint...");
			cancelResponse = await fetch(
				`${POLAR_API_URL}/v1/subscriptions/${actualSubscriptionId}/cancel`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						immediate: false, // Cancel at end of billing period
					}),
				}
			);
		}

		if (!cancelResponse.ok) {
			let errorData;
			try {
				errorData = await cancelResponse.json();
			} catch (e) {
				errorData = { detail: cancelResponse.statusText };
			}
			
			const errorMessage = errorData.detail || errorData.message || cancelResponse.statusText || "";
			const isAlreadyCancelled = 
				errorMessage.toLowerCase().includes("already cancelled") ||
				errorMessage.toLowerCase().includes("already canceled") ||
				errorMessage.toLowerCase().includes("subscription is cancelled") ||
				errorMessage.toLowerCase().includes("subscription is canceled");

			// If subscription is already cancelled, update Supabase and return success
			if (isAlreadyCancelled && customerId) {
				console.log("Subscription already cancelled, updating Supabase...");
				
				try {
					await saveCustomer({
						customer_id: customerId,
						status: "canceled",
					});
					
					console.log("Supabase updated: Subscription marked as cancelled");
					
					return res.status(200).json({
						success: true,
						message: "Subscription was already cancelled. Supabase has been updated.",
						alreadyCancelled: true,
					});
				} catch (supabaseError) {
					console.error("Error updating Supabase:", supabaseError);
					// Continue to return error even if Supabase update fails
				}
			}
			
			console.error("Polar cancel subscription error:", {
				status: cancelResponse.status,
				statusText: cancelResponse.statusText,
				error: errorData,
				subscriptionId: actualSubscriptionId,
			});

			if (cancelResponse.status === 404) {
				return res.status(404).json({
					error: `Subscription not found. Please verify your subscription ID: ${actualSubscriptionId}`,
				});
			}

			return res.status(cancelResponse.status).json({
				error: errorMessage || "Failed to cancel subscription",
			});
		}

		const cancelData = await cancelResponse.json();

		// Note: Supabase will be updated via webhook when Polar sends the cancellation event
		// We don't update it here to avoid race conditions

		return res.status(200).json({
			success: true,
			message: "Subscription cancelled successfully",
			subscription: cancelData,
		});
	} catch (error) {
		console.error("Error cancelling subscription:", error);
		return res.status(500).json({
			error: "Internal server error",
		});
	}
}

