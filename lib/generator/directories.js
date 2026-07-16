/**
 * Top directories / launch platforms to submit niche sites & products.
 * Used by the AI generator marketing pack (always merged into SiteSpec).
 */
export const TOP_DIRECTORY_SUBMISSIONS = [
	{
		name: "Product Hunt",
		url: "https://www.producthunt.com",
		focus: "Product launches & upvotes",
	},
	{
		name: "Hacker News",
		url: "https://news.ycombinator.com/submit",
		focus: "Show HN launches",
	},
	{
		name: "BetaList",
		url: "https://betalist.com",
		focus: "Early-stage startups",
	},
	{
		name: "Indie Hackers",
		url: "https://www.indiehackers.com",
		focus: "Builder community & milestones",
	},
	{
		name: "Launching Next",
		url: "https://www.launchingnext.com",
		focus: "Upcoming SaaS launches",
	},
	{
		name: "SaaSHub",
		url: "https://www.saashub.com",
		focus: "SaaS comparisons",
	},
	{
		name: "AlternativeTo",
		url: "https://alternativeto.net",
		focus: "Software alternatives",
	},
	{
		name: "G2",
		url: "https://www.g2.com",
		focus: "B2B reviews",
	},
	{
		name: "Capterra",
		url: "https://www.capterra.com",
		focus: "Software marketplace",
	},
	{
		name: "Toolify",
		url: "https://www.toolify.ai",
		focus: "AI tools directory",
	},
	{
		name: "There's An AI For That",
		url: "https://theresanaiforthat.com",
		focus: "AI use-case directory",
	},
	{
		name: "Futurepedia",
		url: "https://www.futurepedia.io",
		focus: "AI tools catalog",
	},
	{
		name: "Dang.ai",
		url: "https://dang.ai",
		focus: "AI tool listings",
	},
	{
		name: "Startup Buffer",
		url: "https://startupbuffer.com",
		focus: "Startup directory",
	},
	{
		name: "Microlaunch",
		url: "https://microlaunch.net",
		focus: "Micro-SaaS launches",
	},
	{
		name: "Uneed",
		url: "https://www.uneed.best",
		focus: "Startup & tool launches",
	},
	{
		name: "Peerlist",
		url: "https://peerlist.io",
		focus: "Builder profiles & launches",
	},
	{
		name: "DevHunt",
		url: "https://devhunt.org",
		focus: "Developer tools",
	},
	{
		name: "Open-Source Alternative",
		url: "https://www.opensourcealternative.to",
		focus: "OSS alternatives",
	},
	{
		name: "Reddit (r/SideProject)",
		url: "https://www.reddit.com/r/SideProject",
		focus: "Community soft-launch",
	},
];

export const DEFAULT_MARKETING_CHANNELS = [
	"X / Twitter threads on launch day",
	"Indie Hackers milestone post",
	"Show HN with a crisp problem statement",
	"Niche Slack / Discord communities",
	"SEO blog cluster around your entity keywords",
	"Founder newsletter / Substack shoutout",
	"Cold outreach to listed products for backlinks",
	"YouTube / Loom demo of the directory UX",
];

export const directoryNames = () =>
	TOP_DIRECTORY_SUBMISSIONS.map((d) => d.name);
