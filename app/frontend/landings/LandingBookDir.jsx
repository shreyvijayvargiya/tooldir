import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Bookmark } from "lucide-react";
import CategoryChips from "../marketing/CategoryChips";
import SubmitToolCard from "../marketing/SubmitToolCard";
import DirectorySearchFilter, {
	useDirectoryListFilters,
} from "../marketing/DirectorySearchFilter";
import EbookReader from "../marketing/EbookReader";
import { useDirectoryTools } from "@/lib/hooks/useDirectoryTools";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	SAMPLE_EBOOK_PAGE_COUNT,
	coverToneForSlug,
} from "@/lib/data/ebook-sample-content";
import {
	MotionSection,
	itemVariants,
	heroItemVariants,
} from "./shared";
import { cn } from "@/lib/utils";

const SHELF_SPINES = [
	{ h: "72%", label: "Maps" },
	{ h: "88%", label: "Cash" },
	{ h: "64%", label: "API" },
	{ h: "96%", label: "Quiet" },
	{ h: "78%", label: "Loops" },
	{ h: "70%", label: "Voice" },
	{ h: "90%", label: "Launch" },
	{ h: "66%", label: "Perf" },
	{ h: "84%", label: "Rate" },
	{ h: "74%", label: "Story" },
];

function BookCover({ book, className }) {
	const tone = coverToneForSlug(book.slug);
	return (
		<div
			className={cn(
				"relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-sm p-3 text-left shadow-[4px_6px_20px_rgba(0,0,0,0.28)]",
				className
			)}
			style={{
				background: `linear-gradient(160deg, ${tone.from} 0%, ${tone.to} 100%)`,
			}}
		>
			<div
				className="pointer-events-none absolute inset-y-0 left-0 w-1.5 opacity-80"
				style={{ background: tone.accent }}
			/>
			<div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.35),transparent_40%)]" />
			<div className="relative z-10">
				<p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
					{book.category}
				</p>
			</div>
			<div className="relative z-10 space-y-1">
				<p className="text-[13px] font-semibold leading-snug tracking-tight text-white sm:text-sm">
					{book.name}
				</p>
				{book.author ? (
					<p className="text-[11px] text-white/65">{book.author}</p>
				) : null}
			</div>
		</div>
	);
}

/** BookDir — full-bleed library hero + online shelf reader */
export default function LandingBookDir() {
	const { preset } = usePreset();
	const { landing } = preset;
	const { data: tools = [], isLoading } = useDirectoryTools();
	const filters = useDirectoryListFilters(tools);
	const [activeBook, setActiveBook] = useState(null);

	return (
		<>
			<section className="relative min-h-[88vh] overflow-hidden border-b bg-[#0b1220] text-white">
				{/* Full-bleed shelf plane */}
				<div className="pointer-events-none absolute inset-0" aria-hidden>
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(56,189,248,0.18),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(251,146,60,0.12),transparent_45%)]" />
					<div className="absolute inset-x-0 bottom-0 flex h-[42%] items-end justify-center gap-1.5 px-2 opacity-90 sm:gap-2 sm:px-8 md:h-[48%]">
						{SHELF_SPINES.map((spine, i) => {
							const tone = coverToneForSlug(spine.label + i);
							return (
								<motion.div
									key={spine.label}
									initial={{ y: 40, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										delay: 0.15 + i * 0.04,
										duration: 0.7,
										ease: [0.22, 1, 0.36, 1],
									}}
									className="relative w-[7.5%] min-w-[1.6rem] max-w-[3.25rem] rounded-t-[3px] shadow-lg"
									style={{
										height: spine.h,
										background: `linear-gradient(180deg, ${tone.from}, ${tone.to})`,
									}}
								>
									<span
										className="absolute inset-x-0 top-3 mx-auto block h-8 w-px opacity-50"
										style={{ background: tone.accent }}
									/>
									<span className="absolute bottom-4 left-1/2 origin-bottom -translate-x-1/2 -rotate-90 whitespace-nowrap text-[9px] font-medium tracking-wide text-white/50 sm:text-[10px]">
										{spine.label}
									</span>
								</motion.div>
							);
						})}
					</div>
					<div className="absolute inset-x-0 bottom-[40%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent md:bottom-[46%]" />
					<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b1220] to-transparent" />
				</div>

				<div className="relative z-10 mx-auto flex min-h-[88vh] max-w-5xl flex-col justify-center px-4 pb-36 pt-20 sm:px-6 sm:pb-44 lg:px-8">
					<motion.p
						variants={heroItemVariants}
						initial="hidden"
						animate="visible"
						className="mb-5 font-serif text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl"
					>
						{preset.brand}
					</motion.p>
					<motion.h1
						variants={heroItemVariants}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.08 }}
						className="max-w-2xl text-2xl font-medium tracking-tight text-white/95 sm:text-3xl md:text-4xl"
					>
						{landing.headlineBefore}{" "}
						<span className="text-sky-300">{landing.headlineAccent}</span>
					</motion.h1>
					<motion.p
						variants={heroItemVariants}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.14 }}
						className="mt-4 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg"
					>
						{landing.subhead}
					</motion.p>
					<motion.div
						variants={heroItemVariants}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.2 }}
						className="mt-8 flex flex-wrap gap-3"
					>
						<Button
							asChild
							size="lg"
							className="bg-white text-zinc-900 hover:bg-white/90"
						>
							<a href="#shelf">
								{landing.primaryCta}
								<ArrowRight className="size-4" />
							</a>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
						>
							<Link href="/submit">{landing.secondaryCta}</Link>
						</Button>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.55, duration: 0.6 }}
						className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/50"
					>
						<span className="inline-flex items-center gap-1.5">
							<BookOpen className="size-3.5" />
							{tools.length || 22}+ sample titles
						</span>
						<span aria-hidden>·</span>
						<span>{SAMPLE_EBOOK_PAGE_COUNT} pages each</span>
						<span aria-hidden>·</span>
						<span>Same sample manuscript</span>
					</motion.div>
				</div>
			</section>

			<MotionSection id="shelf" className="px-4 py-14 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl space-y-6">
					<motion.div variants={itemVariants} className="max-w-2xl">
						<Badge variant="secondary" className="mb-3 gap-1">
							<Bookmark className="size-3" />
							{landing.badge}
						</Badge>
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
							{landing.trendingTitle}
						</h2>
						<p className="mt-2 text-sm text-muted-foreground sm:text-base">
							{landing.trendingSubhead}
						</p>
					</motion.div>

					<motion.div variants={itemVariants}>
						<CategoryChips className="mb-4" />
						<DirectorySearchFilter
							search={filters.search}
							setSearch={filters.setSearch}
							allTags={filters.allTags}
							selectedCategories={filters.selectedCategories}
							selectedTags={filters.selectedTags}
							toggleCategory={filters.toggleCategory}
							toggleTag={filters.toggleTag}
							activeFilterCount={filters.activeFilterCount}
						/>
					</motion.div>

					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading the shelf…</p>
					) : filters.filtered.length === 0 ? (
						<p className="py-10 text-center text-sm text-muted-foreground">
							No ebooks match your filters.
						</p>
					) : (
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
							{filters.filtered.map((book, index) => (
								<motion.button
									key={book.id || book.slug}
									type="button"
									variants={itemVariants}
									initial="hidden"
									whileInView="visible"
									viewport={{ once: true, amount: 0.2 }}
									transition={{ delay: Math.min(index * 0.03, 0.35) }}
									whileHover={{ y: -6 }}
									onClick={() => setActiveBook(book)}
									className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<BookCover book={book} />
									<p className="mt-2 line-clamp-2 text-xs font-medium text-foreground sm:text-sm">
										{book.name}
									</p>
									<p className="mt-0.5 text-[11px] text-muted-foreground">
										Read {book.pageCount || SAMPLE_EBOOK_PAGE_COUNT} pages →
									</p>
								</motion.button>
							))}
						</div>
					)}
				</div>
			</MotionSection>

			<MotionSection className="border-t px-4 py-10 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SubmitToolCard />
				</div>
			</MotionSection>

			<EbookReader
				book={activeBook}
				open={Boolean(activeBook)}
				onOpenChange={(next) => {
					if (!next) setActiveBook(null);
				}}
			/>
		</>
	);
}
