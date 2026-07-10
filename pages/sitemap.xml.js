import { getSiteOrigin } from "../lib/utils/blogSeo";
import { getLatestPublishedBlogs } from "../lib/api/blog";

const STATIC_ROUTES = [
	{ path: "/", changefreq: "weekly", priority: "1.0" },
	{ path: "/blog", changefreq: "weekly", priority: "0.9" },
	{ path: "/pricing", changefreq: "weekly", priority: "0.8" },
	{ path: "/submit", changefreq: "weekly", priority: "0.8" },
	{ path: "/categories/ai-writing", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/image-generation", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/code-assistant", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/productivity", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/marketing", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/analytics", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/open-source", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/video-audio", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/chatbots", changefreq: "weekly", priority: "0.7" },
	{ path: "/categories/automation", changefreq: "weekly", priority: "0.7" },
	{ path: "/dashboard", changefreq: "weekly", priority: "0.6" },
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

export async function getServerSideProps({ res }) {
	const origin = getSiteOrigin() || "https://tooldir.com";
	const now = new Date().toISOString();

	let blogEntries = [];
	try {
		const blogs = await getLatestPublishedBlogs(5);
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

	const staticEntries = STATIC_ROUTES.map((route) =>
		buildUrlEntry(`${origin}${route.path}`, now, route.changefreq, route.priority)
	);

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...blogEntries].join("\n")}
</urlset>`;

	res.setHeader("Content-Type", "text/xml");
	res.write(sitemap);
	res.end();

	return { props: {} };
}

export default function Sitemap() {
	return null;
}
