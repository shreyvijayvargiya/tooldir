import { createNichePreset, makeSeed } from "./createNichePreset";

export const chromeExtensionsPreset = createNichePreset({
	id: "chrome-extensions",
	brand: "ExtDir",
	tagline: "Chrome Extension Directory",
	accent: "blue",
	entitySingular: "extension",
	entityPlural: "extensions",
	heroVariant: "browser",
	group: "Tools",
	seoDescription:
		"Discover Chrome extensions for productivity, privacy, and creators.",
	categories: ["Productivity", "Privacy", "Shopping", "Developer", "Writing", "Design"],
	landing: {
		headlineBefore: "Upgrade Chrome with",
		headlineAccent: "sharp extensions",
		primaryCta: "Submit Extension",
	},
	seed: makeSeed([
		{ slug: "tab-zen", name: "Tab Zen", category: "Productivity", description: "Auto-group and sleep unused tabs." },
		{ slug: "track-block", name: "Track Block", category: "Privacy", description: "Lightweight tracker shielding." },
		{ slug: "css-peek", name: "CSS Peek", category: "Developer", description: "Inspect and copy computed styles fast." },
	]),
});
