/**
 * Shared sample ebook body used by every BookDir demo title.
 * Three short pages — enough to demo an online reader without shipping unique manuscripts.
 */
export const SAMPLE_EBOOK_PAGES = [
	{
		title: "Chapter 1 — The Quiet Start",
		body: `Most ambitious projects fail for a simple reason: they begin too loudly. Launch posts, feature lists, and polished decks arrive before the work has earned a clear shape. This short guide argues for the opposite habit.

Start with one reader, one problem, and one page of honest notes. Write the smallest useful chapter you can finish in an afternoon. Then read it aloud. If a sentence collapses when spoken, it was never clear on the page.

Clarity is not a style choice. It is a filter. Every vague claim you cut becomes room for a sharper one. Every example you replace with a real story becomes proof that the idea survives contact with the world.

You do not need a perfect outline to begin. You need a first page that tells the truth about what you know today.`,
	},
	{
		title: "Chapter 2 — Practice Over Performance",
		body: `Once the first page exists, the temptation is to decorate it. Design the cover. Announce the series. Collect applause for intention. Resist that loop.

Practice is quieter. It looks like rewriting the same paragraph until the verbs carry weight. It looks like deleting a clever line that does not help the reader move. It looks like shipping a rough second page before anyone asks for it.

The people who finish books are rarely the ones with the loudest plans. They are the ones who protect a small daily window and treat the draft as a craft object, not a performance.

Keep a short log: date, pages touched, one sentence on what improved. Over a month the log becomes evidence that progress is real even when motivation is not.`,
	},
	{
		title: "Chapter 3 — Leave the Door Open",
		body: `A finished chapter is not a closed case. It is an invitation. Share it with one careful reader. Ask what confused them, not whether they liked it. Fix the confusion. Then share again.

Online reading works the same way. People skim, pause, return, and highlight. Your job is to make each page worth stopping for: a concrete claim, a usable step, a line that sticks.

If you publish this sample as your own template, replace these three pages with your material and keep the structure. Brand on the cover. Promise in the subtitle. Proof in the chapters.

You now have a complete mini-book loop: start quietly, practice daily, leave the door open. Turn the page when you are ready to write the next one yourself.`,
	},
];

export const SAMPLE_EBOOK_PAGE_COUNT = SAMPLE_EBOOK_PAGES.length;

/** Cover palette keys used by BookDir shelf cards */
export const EBOOK_COVER_TONES = [
	{ key: "ink", from: "#1e293b", to: "#0f172a", accent: "#94a3b8" },
	{ key: "forest", from: "#14532d", to: "#052e16", accent: "#86efac" },
	{ key: "ocean", from: "#0c4a6e", to: "#082f49", accent: "#7dd3fc" },
	{ key: "clay", from: "#7c2d12", to: "#431407", accent: "#fdba74" },
	{ key: "wine", from: "#7f1d1d", to: "#450a0a", accent: "#fca5a5" },
	{ key: "slate", from: "#334155", to: "#1e293b", accent: "#cbd5e1" },
	{ key: "teal", from: "#115e59", to: "#134e4a", accent: "#5eead4" },
	{ key: "bronze", from: "#78350f", to: "#451a03", accent: "#fcd34d" },
];

export function coverToneForSlug(slug = "") {
	let hash = 0;
	for (let i = 0; i < slug.length; i += 1) {
		hash = (hash + slug.charCodeAt(i) * (i + 1)) % EBOOK_COVER_TONES.length;
	}
	return EBOOK_COVER_TONES[hash];
}
