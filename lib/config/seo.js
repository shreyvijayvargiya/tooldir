/**
 * Centralized SEO Configuration
 *
 * Add or modify routes here to automatically set SEO tags.
 * Routes are matched in order - more specific routes should come first.
 *
 * Supported patterns:
 * - Exact match: "/pricing" matches only /pricing
 * - Nested routes: "/blog/*" matches /blog, /blog/[slug], /blog/id/[id], etc.
 * - Wildcard: "*" matches all routes (use as fallback)
 *
 * @example
 * {
 *   path: "/pricing",
 *   title: "Pricing - My SaaS",
 *   description: "Choose the perfect plan for your needs",
 *   keywords: "pricing, plans, subscription",
 *   ogImage: "/og-pricing.png"
 * }
 */

export const SEO_CONFIG = {
	// Homepage — product pitch on demo site; niche directory for buyer installs
	"/":
		process.env.NEXT_PUBLIC_PRESET_SWITCHER === "true"
			? {
					title: "ToolDir — Full-stack Directory Website Boilerplate",
					description:
						"Next.js + Supabase + Stripe boilerplate to launch niche directory and animated sites. Preview templates, then buy on Gumroad.",
					keywords:
						"directory boilerplate, nextjs template, supabase, stripe, ai tools directory, component library",
					ogImage: "/og-home.png",
					ogType: "website",
				}
			: {
					title: "ToolDir — AI Tool Directory",
					description:
						"Discover trending AI tools. Browse, compare, and submit the best AI products in one curated directory.",
					keywords: "ai tools, directory, ai directory, tool listing, launch",
					ogImage: "/og-home.png",
					ogType: "website",
				},

	"/demo": {
		title: "Template previews — ToolDir",
		description:
			"Live niche landing templates included with ToolDir: AI tools, prompts, icons, components, and more.",
		keywords: "templates, directory niches, tooldir demo",
		ogImage: "/og-home.png",
		ogType: "website",
		noindex: true,
	},

	"/generate": {
		title: "AI Directory Generator — ToolDir",
		description:
			"Describe a niche. ToolDir plans a SiteSpec, previews it live, and lets PRO users download a starter repository pack.",
		keywords:
			"ai generator, directory boilerplate, sitespec, nextjs template generator",
		ogImage: "/og-home.png",
		ogType: "website",
	},

	// Pricing
	"/pricing": {
		title: "Pricing — ToolDir Launch Slots",
		description:
			"Book a launch slot for your AI tool. Choose your date and get featured on ToolDir.",
		keywords: "pricing, launch slot, featured listing, ai tool launch",
		ogImage: "/og-pricing.png",
		ogType: "website",
	},

	// Blog routes (nested)
	"/blog/*": {
		title: "Blog — ToolDir",
		description:
			"Guides, launch tips, and AI tool roundups from the ToolDir directory.",
		keywords: "blog, ai tools, directory, launches, tutorials",
		ogImage: "/og-blog.png",
		ogType: "article",
	},

	// Contact
	"/contact": {
		title: "Contact Us - ToolDir",
		description:
			"Get in touch with the ToolDir team. Questions about listings, launch slots, or partnerships.",
		keywords: "contact, support, help, directory support",
		ogImage: "/og-contact.png",
		ogType: "website",
	},

	"/submit": {
		title: "Submit Your Tool - ToolDir",
		description:
			"Submit your AI tool to ToolDir. Get discovered by 1M+ monthly visitors.",
		keywords: "submit, list tool, ai directory, launch",
		ogImage: "/og-default.png",
		ogType: "website",
	},

	"/tool/*": {
		title: "Tool Details - ToolDir",
		description: "View AI tool details on ToolDir directory.",
		keywords: "ai tool, directory, details",
		ogImage: "/og-default.png",
		ogType: "website",
	},

	"/privacy": {
		title: "Privacy Policy - ToolDir",
		description: "ToolDir privacy policy and data practices.",
		keywords: "privacy, policy, data",
		ogImage: "/og-default.png",
		ogType: "website",
	},

	"/terms-and-conditions": {
		title: "Terms & Conditions - ToolDir",
		description: "ToolDir terms and conditions of use.",
		keywords: "terms, conditions, legal",
		ogImage: "/og-default.png",
		ogType: "website",
	},

	// 404 Error Page
	"/404": {
		title: "404 — Page Not Found — ToolDir",
		description: "The page you are looking for does not exist.",
		keywords: "404, page not found, error",
		ogImage: "/og-default.png",
		ogType: "website",
		noindex: true,
	},

	// Admin routes (nested)
	"/admin/*": {
		title: "Admin — ToolDir",
		description: "Admin dashboard for managing ToolDir listings, blogs, and payments.",
		keywords: "admin, dashboard, directory management",
		ogImage: "/og-admin.png",
		ogType: "website",
		noindex: true,
	},

	// Default/fallback for all other routes
	"*": {
		title: "ToolDir — AI Tool Directory",
		description:
			"Launch-ready AI tool directory boilerplate with submit flow, blog CMS, pricing slots, and admin panel.",
		keywords: "ai tools, directory, nextjs, supabase, stripe, boilerplate",
		ogImage: "/og-default.png",
		ogType: "website",
	},
};

/**
 * Get SEO config for a specific path
 * @param {string} pathname - The current pathname
 * @returns {object} SEO configuration object
 */
export const getSEOConfig = (pathname) => {
	// Try exact match first
	if (SEO_CONFIG[pathname]) {
		return SEO_CONFIG[pathname];
	}

	// Try nested route patterns (e.g., "/blog/*")
	for (const [pattern, config] of Object.entries(SEO_CONFIG)) {
		if (pattern.includes("*")) {
			const basePath = pattern.replace("/*", "");
			if (pathname.startsWith(basePath)) {
				return config;
			}
		}
	}

	// Fallback to wildcard
	return SEO_CONFIG["*"] || {};
};

/**
 * Get canonical URL for a path
 * @param {string} pathname - The current pathname
 * @param {string} baseUrl - Base URL of the site (optional)
 * @returns {string} Canonical URL
 */
export const getCanonicalUrl = (pathname, baseUrl = "") => {
	const origin =
		baseUrl ||
		process.env.NEXT_PUBLIC_SITE_URL ||
		"";
	if (!origin) return pathname;
	return `${origin.replace(/\/$/, "")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
};
