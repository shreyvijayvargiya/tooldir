import { buildCategoryMeta } from "./shared";
import { COMPONENT_SECTIONS } from "../data/components-catalog";

export const componentsLibraryPreset = {
	id: "components-library",
	landingTemplate: "components-library",
	brand: "CompDir",
	tagline: "React Component Library",
	theme: { accent: "blue" },
	entitySingular: "component",
	entityPlural: "components",
	seoTitle: "CompDir — React Component Library for Developers",
	seoDescription:
		"Browse animated React UI components with live preview. Copy React or HTML snippets and ship your component library faster.",
	categories: COMPONENT_SECTIONS.map((s) => s.label),
	categoryMeta: buildCategoryMeta(COMPONENT_SECTIONS.map((s) => s.label)),
	seed: [],
	landing: {
		badge: "React Component Library",
		headlineBefore: "Ship UI",
		headlineAccent: "Components Faster",
		subhead:
			"A docs-style component directory for React developers. Search the sidebar, preview live, then copy React or HTML — no database required.",
		primaryCta: "Browse components",
		secondaryCta: "Jump to explorer",
		trendingTitle: "Component Explorer",
		trendingSubhead:
			"Sidebar list, search, and Preview / React / HTML tabs — like a mini Storybook.",
		statsTitle: "Built for React Devs",
		statsSubhead: "Frontend-only — drop in your own catalog",
		testimonialsTitle: "What Teams Say",
		testimonialsSubhead: "Developers shipping with CompDir",
		pricingSubhead: "Feature your component pack on the homepage.",
		submitCardTitle: "Add Your Components",
		submitCardBody:
			"Extend lib/data/components-catalog.js with previews and copy-paste snippets.",
		footerBlurb:
			"The React component library template for ToolDir. Preview, document, and copy UI patterns ASAP.",
		navSubmitLabel: "Browse Components",
	},
	stats: {
		monthlyVisitors: "95K+",
		itemsSubmitted: "27+",
		itemsSubmittedLabel: "UI Patterns",
		thirdStat: "3 tabs",
		thirdStatLabel: "Preview · React · HTML",
	},
};
