import { createNichePreset, makeSeed } from "./createNichePreset";

export const affiliateOffersPreset = createNichePreset({
	id: "affiliate-offers",
	brand: "AffDir",
	tagline: "Affiliate Offers Directory",
	accent: "rose",
	entitySingular: "offer",
	entityPlural: "offers",
	heroVariant: "bands",
	group: "Commerce",
	seoDescription:
		"High-converting affiliate programs for creators, bloggers, and newsletters.",
	categories: ["SaaS", "Finance", "Health", "Education", "Ecommerce", "Crypto"],
	landing: {
		headlineBefore: "Monetize with",
		headlineAccent: "better offers",
		primaryCta: "Submit Offer",
	},
	seed: makeSeed([
		{ slug: "hostfast", name: "HostFast Affiliates", category: "SaaS", description: "40% recurring on hosting plans.", pricing: "40% rev" },
		{ slug: "learnplus", name: "LearnPlus Partners", category: "Education", description: "Flat bounty per paid course.", pricing: "$45 CPA" },
		{ slug: "walletly", name: "Walletly", category: "Finance", description: "Fintech cards with lifetime cookie.", pricing: "25% rev" },
	]),
});
