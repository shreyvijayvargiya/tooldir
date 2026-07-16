import { createNichePreset, makeSeed } from "./createNichePreset";

export const ebookDirectoryPreset = createNichePreset({
	id: "ebook-directory",
	brand: "BookDir",
	tagline: "Digital Books & Guides",
	accent: "orange",
	entitySingular: "ebook",
	entityPlural: "ebooks",
	heroVariant: "shelf",
	group: "Education",
	seoDescription:
		"Curated ebooks, playbooks, and PDF guides for founders and creatives.",
	categories: ["Business", "Marketing", "Engineering", "Design", "Finance", "Career"],
	landing: {
		headlineBefore: "Read playbooks that",
		headlineAccent: "compound",
		primaryCta: "Submit Ebook",
	},
	seed: makeSeed([
		{ slug: "pricing-playbook", name: "SaaS Pricing Playbook", category: "Business", description: "Packaging and price tests that stick.", pricing: "$29" },
		{ slug: "seo-maps", name: "SEO Content Maps", category: "Marketing", description: "Cluster planning templates included.", pricing: "$19" },
		{ slug: "system-design", name: "Practical System Design", category: "Engineering", description: "Interview-ready diagrams and drills.", pricing: "$39" },
	]),
});
