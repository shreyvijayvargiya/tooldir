import { createNichePreset, makeSeed } from "./createNichePreset";

export const courseDirectoryPreset = createNichePreset({
	id: "course-directory",
	brand: "LearnDir",
	tagline: "Online Course Directory",
	accent: "green",
	entitySingular: "course",
	entityPlural: "courses",
	heroVariant: "syllabus",
	group: "Education",
	seoDescription:
		"Compare online courses for coding, design, marketing, and career skills.",
	categories: ["Coding", "Design", "Marketing", "Data", "No-Code", "Career"],
	landing: {
		headlineBefore: "Learn skills that",
		headlineAccent: "ship products",
		primaryCta: "Submit Course",
	},
	seed: makeSeed([
		{ slug: "nextjs-pro", name: "Next.js Production", category: "Coding", description: "App Router, auth, and deploy patterns.", pricing: "$149" },
		{ slug: "figma-systems", name: "Figma Design Systems", category: "Design", description: "Tokens, components, and handoff.", pricing: "$89" },
		{ slug: "seo-sprints", name: "SEO Sprints", category: "Marketing", description: "Ship ranking pages in 30 days.", pricing: "$129" },
	]),
});
