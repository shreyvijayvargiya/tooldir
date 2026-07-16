import { createNichePreset, makeSeed } from "./createNichePreset";

export const jobBoardPreset = createNichePreset({
	id: "job-board",
	brand: "HireDir",
	tagline: "Remote Job Board",
	accent: "blue",
	entitySingular: "job",
	entityPlural: "jobs",
	heroVariant: "split",
	group: "Careers",
	seoDescription:
		"Remote and hybrid roles for designers, engineers, and operators worldwide.",
	categories: ["Engineering", "Design", "Product", "Marketing", "Sales", "Ops"],
	landing: {
		headlineBefore: "Find remote",
		headlineAccent: "roles that fit",
		primaryCta: "Post a Job",
		secondaryCta: "Browse jobs",
	},
	seed: makeSeed([
		{ slug: "senior-frontend", name: "Senior Frontend Engineer", category: "Engineering", description: "React + TypeScript, fully remote EU/US.", pricing: "Full-time" },
		{ slug: "product-designer", name: "Product Designer", category: "Design", description: "End-to-end product design for B2B SaaS.", pricing: "Full-time" },
		{ slug: "growth-lead", name: "Growth Lead", category: "Marketing", description: "Own acquisition experiments and SEO.", pricing: "Contract" },
	]),
});
