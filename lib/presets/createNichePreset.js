import { buildCategoryMeta } from "./shared";

/**
 * Factory for directory niche presets (keeps packs / landings consistent).
 */
export function createNichePreset({
	id,
	brand,
	tagline,
	accent = "blue",
	entitySingular = "listing",
	entityPlural = "listings",
	seoTitle,
	seoDescription,
	categories,
	landing,
	stats,
	seed,
	heroVariant = "mesh",
	group = "Directories",
	packable = true,
}) {
	return {
		id,
		landingTemplate: id,
		brand,
		tagline,
		theme: { accent },
		entitySingular,
		entityPlural,
		seoTitle: seoTitle || `${brand} — ${tagline}`,
		seoDescription:
			seoDescription ||
			`Discover and submit the best ${entityPlural}. Built with ToolDir.`,
		categories,
		categoryMeta: buildCategoryMeta(categories),
		landing: {
			badge: tagline,
			headlineBefore: "Discover",
			headlineAccent: entityPlural,
			subhead: seoDescription,
			primaryCta: `Submit ${entitySingular[0].toUpperCase()}${entitySingular.slice(1)}`,
			secondaryCta: `Browse ${entityPlural}`,
			trendingTitle: `Trending ${entityPlural[0].toUpperCase()}${entityPlural.slice(1)}`,
			trendingSubhead: `Latest ${entityPlural} from the community`,
			statsTitle: "Trusted by builders",
			statsSubhead: "Live numbers from this niche",
			testimonialsTitle: "What people say",
			testimonialsSubhead: `Launchers who used ${brand}`,
			pricingSubhead: "Book a featured launch slot on the homepage.",
			submitCardTitle: `Submit your ${entitySingular}`,
			submitCardBody: `Get discovered. Add your ${entitySingular}, embed a badge, and book a launch slot.`,
			footerBlurb: seoDescription,
			navSubmitLabel: `Submit ${entitySingular[0].toUpperCase()}${entitySingular.slice(1)}`,
			...landing,
		},
		stats: {
			monthlyVisitors: "120K+",
			itemsSubmitted: "900+",
			itemsSubmittedLabel: `${entityPlural[0].toUpperCase()}${entityPlural.slice(1)} listed`,
			thirdStat: "4.8★",
			thirdStatLabel: "Avg rating",
			...stats,
		},
		seed: seed || [],
		heroVariant,
		group,
		packable,
	};
}

export function makeSeed(items, defaults = {}) {
	return items.map((item, i) => ({
		id: String(i + 1),
		slug: item.slug,
		name: item.name,
		website: item.website || "https://example.com",
		description: item.description,
		stars: item.stars ?? 200 + i * 40,
		upvotes: item.upvotes ?? 50 + i * 12,
		date: item.date || "2026-05-01",
		country: item.country || "US",
		pricing: item.pricing || "Free",
		category: item.category,
		tags: item.tags || [item.category],
		logo: item.logo || null,
		screenshot: null,
		...defaults,
	}));
}
