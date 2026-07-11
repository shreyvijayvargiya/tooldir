import { getSiteOrigin } from "../lib/utils/blogSeo";
import { getLatestPublishedBlogs } from "../lib/api/blog";
import { getListedTools } from "../lib/api/directoryTools";
import { PRESET_LIST } from "../lib/presets";

const STATIC_ROUTES = [
	{ path: "/", changefreq: "weekly", priority: "1.0" },
	{ path: "/blog", changefreq: "weekly", priority: "0.9" },
	{ path: "/pricing", changefreq: "weekly", priority: "0.8" },
	{ path: "/submit", changefreq: "weekly", priority: "0.8" },
	{ path: "/contact", changefreq: "monthly", priority: "0.6" },
	{ path: "/privacy", changefreq: "yearly", priority: "0.3" },
	{ path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
];

const buildUrlEntry = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const getCategoryRoutes = () => {
	const seen = new Set();
	const routes = [];
	for (const preset of PRESET_LIST) {
		for (const category of preset.categoryMeta || []) {
			if (!category.slug || seen.has(category.slug)) continue;
			seen.add(category.slug);
			routes.push({
				path: `/categories/${category.slug}`,
				changefreq: "weekly",
				priority: "0.7",
			});
		}
	}
	return routes;
};

export async function getServerSideProps({ res }) {
	const origin = getSiteOrigin() || "https://tooldir.com";
	const now = new Date().toISOString();
	const categoryRoutes = getCategoryRoutes();

	let blogEntries = [];
	try {
		const blogs = await getLatestPublishedBlogs(500);
		blogEntries = blogs
			.filter((blog) => blog.slug)
			.map((blog) => {
				const lastmod = blog.updatedAt || blog.publishedAt || blog.createdAt;
				const lastmodIso = lastmod ? new Date(lastmod).toISOString() : now;
				return buildUrlEntry(
					`${origin}/blog/${blog.slug}`,
					lastmodIso,
					"weekly",
					"0.7"
				);
			});
	} catch (error) {
		console.error("Sitemap blog fetch failed:", error);
	}

	let toolEntries = [];
	try {
		const tools = await getListedTools();
		toolEntries = tools
			.filter((tool) => tool.slug)
			.map((tool) => {
				const lastmod = tool.updatedAt || tool.createdAt || tool.date;
				const lastmodIso = lastmod ? new Date(lastmod).toISOString() : now;
				return buildUrlEntry(
					`${origin}/tool/${tool.slug}`,
					lastmodIso,
					"weekly",
					"0.8"
				);
			});
	} catch (error) {
		console.error("Sitemap tools fetch failed:", error);
	}

	const staticEntries = [...STATIC_ROUTES, ...categoryRoutes].map((route) =>
		buildUrlEntry(`${origin}${route.path}`, now, route.changefreq, route.priority)
	);

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...toolEntries, ...blogEntries].join("\n")}
</urlset>`;

	res.setHeader("Content-Type", "text/xml");
	res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
	res.write(sitemap);
	res.end();

	return { props: {} };
}

export default function Sitemap() {
	return null;
}
