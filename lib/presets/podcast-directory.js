import { createNichePreset, makeSeed } from "./createNichePreset";

export const podcastDirectoryPreset = createNichePreset({
	id: "podcast-directory",
	brand: "PodDir",
	tagline: "Podcast Directory",
	accent: "rose",
	entitySingular: "podcast",
	entityPlural: "podcasts",
	heroVariant: "waveform",
	group: "Media",
	seoDescription:
		"Find indie and pro podcasts on startups, tech, and creative work.",
	categories: ["Startups", "Engineering", "Design", "Marketing", "Interviews", "News"],
	landing: {
		headlineBefore: "Press play on",
		headlineAccent: "better shows",
		primaryCta: "Submit Podcast",
	},
	seed: makeSeed([
		{ slug: "ship-it-weekly", name: "Ship It Weekly", category: "Startups", description: "Founders unpack launches and lessons." },
		{ slug: "stack-trace", name: "Stack Trace", category: "Engineering", description: "Deep dives with staff engineers." },
		{ slug: "pixel-talk", name: "Pixel Talk", category: "Design", description: "UI craft and design careers." },
	]),
});
