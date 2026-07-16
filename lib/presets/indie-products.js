import { createNichePreset, makeSeed } from "./createNichePreset";

export const indieProductsPreset = createNichePreset({
	id: "indie-products",
	brand: "LaunchDir",
	tagline: "Indie Product Launches",
	accent: "violet",
	entitySingular: "product",
	entityPlural: "products",
	heroVariant: "spotlight",
	group: "Startups",
	seoDescription:
		"Discover indie SaaS, micro-tools, and maker launches worth watching.",
	categories: ["SaaS", "Devtools", "Creator", "AI", "Marketplace", "Mobile"],
	landing: {
		headlineBefore: "Catch launches",
		headlineAccent: "before they explode",
		primaryCta: "Submit Product",
	},
	seed: makeSeed([
		{ slug: "briefly", name: "Briefly", category: "AI", description: "Meeting notes that write themselves." },
		{ slug: "repokit", name: "RepoKit", category: "Devtools", description: "Scaffold production Next apps." },
		{ slug: "clipstack", name: "ClipStack", category: "Creator", description: "Repurpose long video into shorts." },
	]),
});
