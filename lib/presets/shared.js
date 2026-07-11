/** Shared helpers for directory niche presets */

export const slugifyCategory = (name) =>
	String(name || "")
		.toLowerCase()
		.replace(/&/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

export const buildCategoryMeta = (categories) =>
	categories.map((cat, i) => {
		const name = typeof cat === "string" ? cat : cat.name;
		const icon = typeof cat === "string" ? DEFAULT_ICONS[i % DEFAULT_ICONS.length] : cat.icon;
		const color = typeof cat === "string" ? DEFAULT_COLORS[i % DEFAULT_COLORS.length] : cat.color;
		const bg = typeof cat === "string" ? DEFAULT_BGS[i % DEFAULT_BGS.length] : cat.bg;
		const border =
			typeof cat === "string" ? DEFAULT_BORDERS[i % DEFAULT_BORDERS.length] : cat.border;
		return {
			name,
			slug: slugifyCategory(name),
			icon,
			color,
			bg,
			border,
		};
	});

const DEFAULT_ICONS = [
	"PenLine",
	"Image",
	"Code2",
	"Zap",
	"Megaphone",
	"BarChart3",
	"Github",
	"Clapperboard",
	"Bot",
	"Workflow",
	"Layers",
	"Sparkles",
	"Palette",
	"FileText",
	"Layout",
];

const DEFAULT_COLORS = [
	"text-sky-500",
	"text-violet-500",
	"text-emerald-500",
	"text-amber-500",
	"text-rose-500",
	"text-blue-500",
	"text-zinc-600 dark:text-zinc-300",
	"text-pink-500",
	"text-teal-500",
	"text-indigo-500",
];

const DEFAULT_BGS = [
	"bg-sky-500/10",
	"bg-violet-500/10",
	"bg-emerald-500/10",
	"bg-amber-500/10",
	"bg-rose-500/10",
	"bg-blue-500/10",
	"bg-zinc-500/10",
	"bg-pink-500/10",
	"bg-teal-500/10",
	"bg-indigo-500/10",
];

const DEFAULT_BORDERS = [
	"border-sky-500/20",
	"border-violet-500/20",
	"border-emerald-500/20",
	"border-amber-500/20",
	"border-rose-500/20",
	"border-blue-500/20",
	"border-zinc-500/20",
	"border-pink-500/20",
	"border-teal-500/20",
	"border-indigo-500/20",
];
