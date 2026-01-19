import { supabase } from "../../../lib/config/supabase";
import getStripe from "../../../lib/utils/getStripe";

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

        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({
                error: "Stripe API credentials not configured",
            });
        }

        // If we only have customerId, get subscription from Supabase or Stripe API
        let actualSubscriptionId = subscriptionId;
        if (!actualSubscriptionId && customerId) {
            // First, try to get customer from Supabase
            const { data: customerData, error: customerError } = await supabase
                .from("customers")
                .select("*")
                .eq("customer_id", customerId)
                .single();

            if (customerData) {
                // Check if subscription ID is stored in customer data
                if (customerData.subscription_id) {
                    actualSubscriptionId = customerData.subscription_id;
                }
            }

            // If we still don't have subscription ID, fetch from Stripe API
            if (!actualSubscriptionId) {
                try {
                    const stripe = getStripe();
                    const subscriptions = await stripe.subscriptions.list({
                        customer: customerId,
                        limit: 1,
                        status: "active",
                    });

                    if (subscriptions.data && subscriptions.data.length > 0) {
                        actualSubscriptionId = subscriptions.data[0].id;
                    }
                } catch (error) {
                    console.error("Error fetching subscriptions from Stripe:", error);
                    // Continue - we'll try with what we have
                }
            }

            if (!actualSubscriptionId) {
                return res.status(404).json({
                    error:
                        "No active subscription found for this customer. Please contact support.",
                });
            }
        }

        // Verify subscription exists before canceling
        if (!actualSubscriptionId) {
            return res.status(400).json({
                error: "Subscription ID is required",
            });
        }

        // Cancel subscription with Stripe
        // Cancel at period end (recommended) - customer keeps access until period ends
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.update(
            actualSubscriptionId,
            {
                cancel_at_period_end: true,
            }
        );

        // If subscription is already cancelled, update Supabase and return success
        if (
            subscription.status === "cancelled" ||
            subscription.cancel_at_period_end
        ) {
            if (customerId) {
                try {
                    await supabase
                        .from("customers")
                        .update({
                            status: subscription.cancel_at_period_end ? "active" : "cancelled",
                            cancelled_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq("customer_id", customerId);
                } catch (dbError) {
                    console.error("Error updating Supabase:", dbError);
                    // Continue - webhook will update it
                }
            }

            return res.status(200).json({
                success: true,
                message: subscription.cancel_at_period_end
                    ? "Subscription will be cancelled at the end of the billing period."
                    : "Subscription was already cancelled.",
                subscription: subscription,
            });
        }

        // Note: Supabase will be updated via webhook when Stripe sends the cancellation event
        // We don't update it here to avoid race conditions

        return res.status(200).json({
            success: true,
            message:
                "Subscription cancelled successfully. You'll have access until the end of your billing period.",
            subscription: subscription,
        });
    } catch (error) {
        console.error("Error cancelling subscription:", error);

        // Handle specific Stripe errors
        if (error.type === "StripeInvalidRequestError") {
            if (error.code === "resource_missing") {
                return res.status(404).json({
                    error: "Subscription not found. Please verify your subscription ID.",
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