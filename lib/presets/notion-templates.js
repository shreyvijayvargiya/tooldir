import { createNichePreset, makeSeed } from "./createNichePreset";

export const notionTemplatesPreset = createNichePreset({
	id: "notion-templates",
	brand: "NotionDir",
	tagline: "Notion Template Gallery",
	accent: "slate",
	entitySingular: "template",
	entityPlural: "templates",
	heroVariant: "paper",
	group: "Productivity",
	seoDescription:
		"Browse and submit Notion templates for startups, creators, and second brains.",
	categories: ["Startup OS", "Content", "CRM", "Finance", "Students", "Personal"],
	landing: {
		headlineBefore: "Ship faster with",
		headlineAccent: "Notion systems",
		primaryCta: "Submit Template",
	},
	seed: makeSeed([
		{ slug: "startup-os", name: "Startup OS", category: "Startup OS", description: "Roadmaps, hiring, and fundraising in one workspace." },
		{ slug: "content-calendar", name: "Content Calendar Pro", category: "Content", description: "Plan posts across X, LinkedIn, and YouTube." },
		{ slug: "simple-crm", name: "Simple CRM", category: "CRM", description: "Pipeline + follow-ups for solo founders." },
	]),
});
