import { createNichePreset, makeSeed } from "./createNichePreset";

export const couponsDealsPreset = createNichePreset({
	id: "coupons-deals",
	brand: "DealDir",
	tagline: "Coupons & Deals Directory",
	accent: "orange",
	entitySingular: "deal",
	entityPlural: "deals",
	heroVariant: "ticket",
	group: "Commerce",
	seoDescription:
		"Find verified coupons, promo codes, and limited-time deals across stores and SaaS tools.",
	categories: ["SaaS", "Ecommerce", "Travel", "Food", "Fashion", "Finance"],
	landing: {
		headlineBefore: "Save more with",
		headlineAccent: "verified deals",
		primaryCta: "Submit a Deal",
		trendingTitle: "Hot deals this week",
	},
	seed: makeSeed([
		{ slug: "notion-plus-20", name: "Notion Plus 20% off", category: "SaaS", description: "Annual plan promo for teams.", pricing: "20% off" },
		{ slug: "shopify-trial", name: "Shopify extended trial", category: "Ecommerce", description: "90-day trial for new stores.", pricing: "Free trial" },
		{ slug: "airline-flash", name: "Flash flight fares", category: "Travel", description: "Weekend city-hop deals under $99.", pricing: "Flash" },
	]),
});
