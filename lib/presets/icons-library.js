import { buildCategoryMeta } from "./shared";
import { ICON_CATEGORIES } from "../data/icons-catalog";

export const iconsLibraryPreset = {
	id: "icons-library",
	landingTemplate: "icons-library",
	brand: "IconDir",
	tagline: "Lucide React Icons",
	group: "Libraries",
	theme: { accent: "violet" },
	entitySingular: "icon",
	entityPlural: "icons",
	seoTitle: "IconDir — Lucide React Icon Directory",
	seoDescription:
		"Browse, search, and copy Lucide React icons. Change size and color, then copy SVG or React code instantly.",
	categories: ICON_CATEGORIES,
	categoryMeta: buildCategoryMeta(ICON_CATEGORIES),
	/** Frontend-only niche — no directory_tools / Supabase seed */
	seed: [],
	landing: {
		badge: "React Icon Directory",
		headlineBefore: "Browse & Copy",
		headlineAccent: "Lucide Icons",
		subhead:
			"A simple icon directory for builders. Search, filter by category, tweak size and color, then copy SVG or React code in one click.",
		primaryCta: "Browse Icons",
		secondaryCta: "Jump to grid",
		trendingTitle: "Icon Library",
		trendingSubhead:
			"10×10 grid of Lucide icons. Click any icon to copy React + SVG.",
		statsTitle: "Built for Frontend Devs",
		statsSubhead: "No database — pure component catalog",
		testimonialsTitle: "What Devs Say",
		testimonialsSubhead: "Teams shipping with IconDir",
		pricingSubhead: "Feature your icon pack with homepage placement.",
		submitCardTitle: "Ship Your Icon Pack",
		submitCardBody:
			"IconDir is frontend-only. Use this template to showcase React icon components with copy-to-clipboard.",
		footerBlurb:
			"The curated Lucide React icon directory. Search, restyle, and copy icons for your next UI.",
		navSubmitLabel: "Browse Icons",
	},
	stats: {
		monthlyVisitors: "180K+",
		itemsSubmitted: String(ICON_CATEGORIES.length * 15) + "+",
		itemsSubmittedLabel: "Icons Indexed",
		thirdStat: "10×10",
		thirdStatLabel: "Grid Layout",
	},
};
