import { normalizeSiteSpec } from "./schema";
import { buildFallbackSiteSpec } from "./fallback";
import {
	DEFAULT_MARKETING_CHANNELS,
	directoryNames,
} from "./directories";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are ToolDir's SiteSpec planner.
Return ONLY valid JSON matching this shape (no markdown fences):
{
  "template": "ai-tools|prompt-library|design-resources|ui-inspiration|resources|icons-library|components-library",
  "brand": { "name": string, "tagline": string, "description": string, "accent": "blue|green|violet|orange|rose|slate" },
  "taxonomy": { "entitySingular": string, "entityPlural": string, "categories": string[4-10] },
  "landing": {
    "badge": string,
    "headlineBefore": string,
    "headlineAccent": string,
    "subhead": string,
    "primaryCta": string,
    "secondaryCta": string,
    "trendingTitle": string,
    "trendingSubhead": string,
    "sections": [{ "type": "directory|features|stats|testimonials|pricing", "variant": string }]
  },
  "seedListings": [{ "name": string, "slug": string, "description": string, "category": string, "tags": string[], "website": string }],
  "seo": {
    "title": string,
    "description": string,
    "keywords": string[],
    "blogIdeas": [{ "title": string, "keyword": string, "outline": string[] }]
  },
  "marketing": {
    "positioning": string,
    "channels": string[],
    "directorySubmissions": string[]
  },
  "cursorPrompt": string
}
Rules:
- Pick ONE supported template that best matches the user idea.
- Never invent JSX or file paths.
- Generate 6-12 seedListings max.
- Brand name should feel like a directory product (often ends with Dir).
- cursorPrompt must be a practical Cursor agent instruction to continue building this site on ToolDir.`;

function extractJson(text) {
	if (!text) throw new Error("Empty model response");
	const trimmed = text.trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		const start = trimmed.indexOf("{");
		const end = trimmed.lastIndexOf("}");
		if (start >= 0 && end > start) {
			return JSON.parse(trimmed.slice(start, end + 1));
		}
		throw new Error("Model did not return JSON");
	}
}

/**
 * Plan a SiteSpec via OpenRouter. Falls back locally if unconfigured/fails.
 */
export async function planSiteSpec({
	prompt,
	mode = "fullstack",
	style = "",
}) {
	const input = {
		prompt: String(prompt || "").trim(),
		mode: mode === "frontend" ? "frontend" : "fullstack",
		style: String(style || "").trim(),
	};

	if (!input.prompt) {
		throw new Error("prompt is required");
	}

	const apiKey = process.env.OPENROUTER_API_KEY?.trim();
	const model =
		process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";

	if (!apiKey) {
		const spec = buildFallbackSiteSpec(input);
		return { spec, source: "fallback", reason: "OPENROUTER_API_KEY missing" };
	}

	try {
		const res = await fetch(OPENROUTER_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
				"HTTP-Referer":
					process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
				"X-Title": "ToolDir Generator",
			},
			body: JSON.stringify({
				model,
				temperature: 0.4,
				messages: [
					{ role: "system", content: SYSTEM_PROMPT },
					{
						role: "user",
						content: JSON.stringify({
							idea: input.prompt,
							mode: input.mode,
							style: input.style || undefined,
							requiredDirectoryHints: directoryNames().slice(0, 10),
							requiredChannels: DEFAULT_MARKETING_CHANNELS.slice(0, 5),
						}),
					},
				],
			}),
		});

		if (!res.ok) {
			const errText = await res.text();
			throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`);
		}

		const data = await res.json();
		const content = data?.choices?.[0]?.message?.content;
		const parsed = extractJson(content);
		let spec = normalizeSiteSpec(parsed, { mode: input.mode });

		// Always merge known marketing directories so free models can't omit them
		if (!spec.marketing.directorySubmissions?.length) {
			spec.marketing.directorySubmissions = directoryNames();
		}
		if (!spec.marketing.channels?.length) {
			spec.marketing.channels = DEFAULT_MARKETING_CHANNELS;
		}

		return { spec, source: "openrouter", model };
	} catch (error) {
		const spec = buildFallbackSiteSpec(input);
		return {
			spec,
			source: "fallback",
			reason: error.message || "OpenRouter failed",
		};
	}
}
