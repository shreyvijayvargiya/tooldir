import Stripe from "stripe";

let stripeInstance = null;

const getStripe = () => {
	if (!stripeInstance) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
		}
		stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: "2024-12-18.acacia",
		});
	}
	return stripeInstance;
};

export default getStripe;