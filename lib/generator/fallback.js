import { normalizeSiteSpec } from "./schema";
import {
	DEFAULT_MARKETING_CHANNELS,
	directoryNames,
} from "./directories";

const TEMPLATE_HINTS = [
	{ id: "ai-tools", keys: ["ai", "tool", "saas", "gpt", "llm"] },
	{ id: "prompt-library", keys: ["prompt", "claude", "cursor", "chatgpt"] },
	{ id: "design-resources", keys: ["design", "figma", "ui kit", "font", "icon pack"] },
	{ id: "ui-inspiration", keys: ["inspiration", "showcase", "dribbble", "landing page gallery"] },
	{ id: "resources", keys: ["resource", "template", "boilerplate", "kit"] },
	{ id: "icons-library", keys: ["icon", "lucide", "svg icon"] },
	{ id: "components-library", keys: ["component", "react ui", "shadcn", "animation library"] },
];

function pickTemplate(prompt) {
	const p = String(prompt || "").toLowerCase();
	for (const hint of TEMPLATE_HINTS) {
		if (hint.keys.some((k) => p.includes(k))) return hint.id;
	}
	return "ai-tools";
}

function brandFromPrompt(prompt) {
	const cleaned = String(prompt || "")
		.replace(/^(a|an|the)\s+/i, "")
		.trim();
	const words = cleaned.split(/\s+/).slice(0, 3);
	const base =
		words
			.map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
			.filter(Boolean)
			.map((w) => w[0].toUpperCase() + w.slice(1))
			.join("") || "Niche";
	return `${base}Dir`.slice(0, 24);
}

/**
 * Deterministic SiteSpec when OpenRouter is offline / fails.
 * Still produces a usable preview + download package.
 */
export function buildFallbackSiteSpec({ prompt, mode = "fullstack", style = "" }) {
	const template = pickTemplate(prompt);
	const brand = brandFromPrompt(prompt);
	const idea = String(prompt || "a curated niche directory").trim();

	const categories =
		template === "prompt-library"
			? ["Coding", "Writing", "Marketing", "Research", "Productivity"]
			: template === "icons-library"
				? ["Arrows", "UI", "Media", "Devices", "Development"]
				: template === "components-library"
					? ["Feedback", "Navigation", "Overlays", "Motion", "Layout"]
					: ["Featured", "Popular", "Open Source", "New", "Enterprise"];

	const entitySingular =
		template === "prompt-library"
			? "prompt"
			: template === "icons-library"
				? "icon"
				: template === "components-library"
					? "component"
					: "tool";
	const entityPlural = `${entitySingular}s`;

	return normalizeSiteSpec(
		{
			template,
			brand: {
				name: brand,
				tagline: idea.slice(0, 60),
				description: `A curated directory for ${idea}. ${style ? `Style: ${style}.` : ""}`.trim(),
				accent:
					template === "prompt-library"
						? "green"
						: template === "icons-library"
							? "violet"
							: "blue",
			},
			taxonomy: {
				entitySingular,
				entityPlural,
				categories,
			},
			landing: {
				badge: `${brand} Directory`,
				headlineBefore: "Discover the Best",
				headlineAccent: entityPlural,
				subhead: `Browse, compare, and submit ${entityPlural} for ${idea}.`,
				primaryCta: `Submit Your ${entitySingular[0].toUpperCase()}${entitySingular.slice(1)}`,
				secondaryCta: `Browse ${entityPlural}`,
				trendingTitle: `Trending ${entityPlural}`,
				trendingSubhead: "Community favorites ranked by upvotes",
				sections: [
					{ type: "directory", variant: "table" },
					{ type: "features", variant: "grid" },
					{ type: "stats", variant: "cards" },
				],
			},
			seedListings: categories.slice(0, 8).map((cat, i) => ({
				name: `${cat} ${entitySingular[0].toUpperCase()}${entitySingular.slice(1)} ${i + 1}`,
				slug: `${cat.toLowerCase().replace(/\s+/g, "-")}-${entitySingular}-${i + 1}`,
				description: `Example ${entitySingular} for ${cat} within ${idea}.`,
				category: cat,
				tags: [cat, "Starter"],
				website: "https://example.com",
			})),
			seo: {
				title: `${brand} — ${idea}`,
				description: `Find and submit the best ${entityPlural} for ${idea}.`,
				keywords: [entityPlural, idea, "directory", "launch", brand],
				blogIdeas: [
					{
						title: `Best ${entityPlural} for ${idea} in 2026`,
						keyword: entityPlural,
						outline: ["Market overview", "Top picks", "How to choose", "Submit yours"],
					},
					{
						title: `How we built ${brand}`,
						keyword: brand,
						outline: ["Why this niche", "Stack", "Launch checklist"],
					},
					{
						title: `SEO playbook for ${entityPlural} directories`,
						keyword: "directory seo",
						outline: ["Keyword map", "Category pages", "Blog cluster"],
					},
				],
			},
			marketing: {
				positioning: `${brand} is the focused directory for ${idea}.`,
				channels: DEFAULT_MARKETING_CHANNELS,
				directorySubmissions: directoryNames(),
			},
			cursorPrompt: `You are continuing work on ${brand}, a ToolDir-based ${mode} directory for "${idea}". Niche template: ${template}. Keep the locked preset, improve SEO category pages, seed listings, and the submit flow. Prefer small diffs over rewrites.`,
		},
		{ mode }
	);
}
