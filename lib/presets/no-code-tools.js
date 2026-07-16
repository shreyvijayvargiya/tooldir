import { createNichePreset, makeSeed } from "./createNichePreset";

export const noCodeToolsPreset = createNichePreset({
	id: "no-code-tools",
	brand: "NoCodeDir",
	tagline: "No-Code Tools Directory",
	accent: "violet",
	entitySingular: "tool",
	entityPlural: "tools",
	heroVariant: "blocks",
	group: "Tools",
	seoDescription:
		"Browse no-code and low-code tools to ship apps, sites, and automations.",
	categories: ["Builders", "Automation", "Databases", "Forms", "Internal Tools", "AI"],
	landing: {
		headlineBefore: "Build without",
		headlineAccent: "writing code",
		primaryCta: "Submit Tool",
	},
	seed: makeSeed([
		{ slug: "flowkit", name: "Flowkit", category: "Automation", description: "Visual workflows between your SaaS stack." },
		{ slug: "sheetbase", name: "SheetBase", category: "Databases", description: "Spreadsheet-backed apps in minutes." },
		{ slug: "formcraft", name: "Formcraft", category: "Forms", description: "Beautiful forms with logic and payments." },
	]),
});
