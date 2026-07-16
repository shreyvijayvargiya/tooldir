import { createNichePreset, makeSeed } from "./createNichePreset";

export const communitiesPreset = createNichePreset({
	id: "communities",
	brand: "CommunityDir",
	tagline: "Communities Directory",
	accent: "green",
	entitySingular: "community",
	entityPlural: "communities",
	heroVariant: "radial",
	group: "Social",
	seoDescription:
		"Find Discord, Slack, and forum communities for builders and niches.",
	categories: ["Discord", "Slack", "Forum", "Circle", "Skool", "Reddit"],
	landing: {
		headlineBefore: "Join rooms that",
		headlineAccent: "move you forward",
		primaryCta: "Submit Community",
	},
	seed: makeSeed([
		{ slug: "indie-makers", name: "Indie Makers HQ", category: "Discord", description: "Daily standup for bootstrappers." },
		{ slug: "design-crit", name: "Design Crit Club", category: "Slack", description: "Weekly critiques and portfolio help." },
		{ slug: "ops-forum", name: "Ops Forum", category: "Forum", description: "Threads on tooling and process." },
	]),
});
