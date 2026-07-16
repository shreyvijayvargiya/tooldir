/** Supported templates the generator may select (maps to existing landings). */
export const GENERATOR_TEMPLATES = [
	"ai-tools",
	"prompt-library",
	"design-resources",
	"ui-inspiration",
	"resources",
	"icons-library",
	"components-library",
];

export const GENERATOR_ACCENTS = [
	"blue",
	"green",
	"violet",
	"orange",
	"rose",
	"slate",
];

export const SECTION_TYPES = [
	"directory",
	"features",
	"stats",
	"testimonials",
	"pricing",
];

/**
 * @typedef {Object} SiteSpec
 * @property {1} version
 * @property {"frontend"|"fullstack"} mode
 * @property {string} template
 * @property {{ name: string, tagline: string, description: string, accent: string }} brand
 * @property {{ entitySingular: string, entityPlural: string, categories: string[] }} taxonomy
 * @property {object} landing
 * @property {Array<object>} seedListings
 * @property {object} seo
 * @property {object} marketing
 * @property {string} cursorPrompt
 */

const slugify = (value) =>
	String(value || "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 48) || "item";

const asString = (v, fallback = "") =>
	typeof v === "string" && v.trim() ? v.trim() : fallback;

const asArray = (v) => (Array.isArray(v) ? v : []);

/**
 * Normalize + validate AI / fallback output into a safe SiteSpec.
 * Never throws for soft AI failures — fills defaults instead.
 */
export function normalizeSiteSpec(raw = {}, options = {}) {
	const mode = options.mode === "frontend" ? "frontend" : "fullstack";
	const template = GENERATOR_TEMPLATES.includes(raw.template)
		? raw.template
		: "ai-tools";

	const brandName = asString(raw.brand?.name, "NicheDir");
	const tagline = asString(raw.brand?.tagline, "Curated directory");
	const description = asString(
		raw.brand?.description,
		"A curated directory built with ToolDir."
	);
	const accent = GENERATOR_ACCENTS.includes(raw.brand?.accent)
		? raw.brand.accent
		: "blue";

	const entitySingular = asString(raw.taxonomy?.entitySingular, "tool");
	const entityPlural = asString(raw.taxonomy?.entityPlural, "tools");
	const categories = asArray(raw.taxonomy?.categories)
		.map((c) => asString(c))
		.filter(Boolean)
		.slice(0, 12);
	const safeCategories =
		categories.length > 0
			? categories
			: ["Featured", "Popular", "New", "Open Source"];

	const sections = asArray(raw.landing?.sections)
		.map((s) => ({
			type: SECTION_TYPES.includes(s?.type) ? s.type : "directory",
			variant: asString(s?.variant, "default"),
		}))
		.slice(0, 6);
	const safeSections =
		sections.length > 0
			? sections
			: [
					{ type: "directory", variant: "table" },
					{ type: "features", variant: "grid" },
					{ type: "stats", variant: "cards" },
				];

	const seedListings = asArray(raw.seedListings)
		.slice(0, 20)
		.map((item, i) => {
			const name = asString(item?.name, `Listing ${i + 1}`);
			const category =
				asString(item?.category) ||
				safeCategories[i % safeCategories.length];
			return {
				id: `g${i + 1}`,
				name,
				slug: slugify(item?.slug || name),
				description: asString(
					item?.description,
					`A featured ${entitySingular} in ${category}.`
				),
				website: asString(item?.website, "https://example.com"),
				category,
				tags: asArray(item?.tags)
					.map((t) => asString(t))
					.filter(Boolean)
					.slice(0, 5),
				stars: Number(item?.stars) > 0 ? Math.round(Number(item.stars)) : 100 + i * 17,
				upvotes: Number(item?.upvotes) > 0 ? Math.round(Number(item.upvotes)) : 40 + i * 3,
				pricing: asString(item?.pricing, "Freemium"),
				date: asString(item?.date, "2026-06-01"),
				country: asString(item?.country, "US"),
				logo: null,
				screenshot: null,
			};
		});

	const blogIdeas = asArray(raw.seo?.blogIdeas)
		.slice(0, 8)
		.map((b) => ({
			title: asString(b?.title, `Best ${entityPlural} in 2026`),
			keyword: asString(b?.keyword, entityPlural),
			outline: asArray(b?.outline)
				.map((o) => asString(o))
				.filter(Boolean)
				.slice(0, 6),
		}));

	while (blogIdeas.length < 3) {
		blogIdeas.push({
			title: `${brandName}: ${["How to launch", "Top picks", "Buyer guide"][blogIdeas.length]} for ${entityPlural}`,
			keyword: entityPlural,
			outline: [
				"Why this niche matters",
				"Evaluation criteria",
				"Top picks",
				"How to submit",
			],
		});
	}

	return {
		version: 1,
		mode,
		template,
		brand: {
			name: brandName,
			tagline,
			description,
			accent,
		},
		taxonomy: {
			entitySingular,
			entityPlural,
			categories: safeCategories,
		},
		landing: {
			badge: asString(raw.landing?.badge, tagline),
			headlineBefore: asString(raw.landing?.headlineBefore, "Discover the Best"),
			headlineAccent: asString(raw.landing?.headlineAccent, entityPlural),
			subhead: asString(
				raw.landing?.subhead,
				description
			),
			primaryCta: asString(
				raw.landing?.primaryCta,
				`Submit Your ${entitySingular[0].toUpperCase()}${entitySingular.slice(1)}`
			),
			secondaryCta: asString(
				raw.landing?.secondaryCta,
				`Browse ${entityPlural[0].toUpperCase()}${entityPlural.slice(1)}`
			),
			trendingTitle: asString(
				raw.landing?.trendingTitle,
				`Trending ${entityPlural[0].toUpperCase()}${entityPlural.slice(1)}`
			),
			trendingSubhead: asString(
				raw.landing?.trendingSubhead,
				`Latest ${entityPlural} ranked by the community`
			),
			sections: safeSections,
		},
		seedListings:
			seedListings.length > 0
				? seedListings
				: safeCategories.slice(0, 6).map((cat, i) => ({
						id: `g${i + 1}`,
						name: `${cat} Starter`,
						slug: slugify(`${cat}-starter`),
						description: `Starter ${entitySingular} for the ${cat} category.`,
						website: "https://example.com",
						category: cat,
						tags: [cat, "Starter"],
						stars: 120 + i * 10,
						upvotes: 30 + i * 5,
						pricing: "Freemium",
						date: "2026-06-01",
						country: "US",
						logo: null,
						screenshot: null,
					})),
		seo: {
			title: asString(
				raw.seo?.title,
				`${brandName} — ${tagline}`
			),
			description: asString(raw.seo?.description, description),
			keywords: asArray(raw.seo?.keywords)
				.map((k) => asString(k))
				.filter(Boolean)
				.slice(0, 12),
			blogIdeas,
		},
		marketing: {
			positioning: asString(
				raw.marketing?.positioning,
				`${brandName} is the go-to directory for ${entityPlural}.`
			),
			channels: asArray(raw.marketing?.channels)
				.map((c) => asString(c))
				.filter(Boolean)
				.slice(0, 10),
			directorySubmissions: asArray(raw.marketing?.directorySubmissions)
				.map((d) => asString(d))
				.filter(Boolean)
				.slice(0, 20),
		},
		cursorPrompt: asString(
			raw.cursorPrompt,
			`Continue building ${brandName}, a ${mode} ${entityPlural} directory based on ToolDir. Keep the niche locked to ${template}, improve SEO pages, and polish the submit flow.`
		),
	};
}

export function isValidSiteSpec(spec) {
	return (
		spec &&
		spec.version === 1 &&
		GENERATOR_TEMPLATES.includes(spec.template) &&
		spec.brand?.name &&
		Array.isArray(spec.taxonomy?.categories)
	);
}
