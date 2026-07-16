import { createNichePreset, makeSeed } from "./createNichePreset";

export const newsletterDirectoryPreset = createNichePreset({
	id: "newsletter-directory",
	brand: "InboxDir",
	tagline: "Newsletter Directory",
	accent: "violet",
	entitySingular: "newsletter",
	entityPlural: "newsletters",
	heroVariant: "inbox",
	group: "Media",
	seoDescription:
		"Discover high-signal newsletters across tech, business, design, and culture.",
	categories: ["Tech", "Business", "Design", "Finance", "Culture", "Science"],
	landing: {
		headlineBefore: "Curate your",
		headlineAccent: "inbox better",
		primaryCta: "List Newsletter",
	},
	seed: makeSeed([
		{ slug: "byte-sized", name: "Byte Sized", category: "Tech", description: "Weekly AI and developer tools digest." },
		{ slug: "operator-notes", name: "Operator Notes", category: "Business", description: "Tactics for bootstrapped SaaS." },
		{ slug: "type-weekly", name: "Type Weekly", category: "Design", description: "Fonts, layout, and visual craft." },
	]),
});
