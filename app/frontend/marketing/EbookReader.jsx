import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	SAMPLE_EBOOK_PAGES,
	coverToneForSlug,
} from "@/lib/data/ebook-sample-content";
import { cn } from "@/lib/utils";

/**
 * Online ebook reader — shared sample pages for every BookDir title.
 */
export default function EbookReader({ book, open, onOpenChange }) {
	const [pageIndex, setPageIndex] = useState(0);
	const pages = SAMPLE_EBOOK_PAGES;
	const total = pages.length;
	const page = pages[pageIndex] || pages[0];
	const tone = coverToneForSlug(book?.slug);

	useEffect(() => {
		if (open) setPageIndex(0);
	}, [open, book?.slug]);

	if (!book) return null;

	const goPrev = () => setPageIndex((i) => Math.max(0, i - 1));
	const goNext = () => setPageIndex((i) => Math.min(total - 1, i + 1));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"flex max-h-[92vh] w-[min(100vw-1.5rem,42rem)] flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl"
				)}
			>
				<div
					className="relative px-6 pb-5 pt-6 text-white"
					style={{
						background: `linear-gradient(145deg, ${tone.from}, ${tone.to})`,
					}}
				>
					<div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
					<DialogHeader className="relative z-10 space-y-2 pr-8 text-left">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant="secondary"
								className="border-0 bg-white/15 text-white hover:bg-white/20"
							>
								<BookOpen className="mr-1 size-3" />
								Online reader
							</Badge>
							<Badge
								variant="secondary"
								className="border-0 bg-white/10 text-white/90 hover:bg-white/15"
							>
								{book.category}
							</Badge>
						</div>
						<DialogTitle className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
							{book.name}
						</DialogTitle>
						<DialogDescription className="text-sm text-white/75">
							{book.author ? `By ${book.author}` : "Sample guide"} · Page{" "}
							{pageIndex + 1} of {total}
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="flex min-h-0 flex-1 flex-col bg-[#f7f4ef] dark:bg-zinc-950">
					<div className="min-h-[280px] flex-1 overflow-y-auto px-6 py-6 sm:px-8">
						<AnimatePresence mode="wait">
							<motion.article
								key={pageIndex}
								initial={{ opacity: 0, x: 16 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -12 }}
								transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
								className="mx-auto max-w-prose"
							>
								<p
									className="mb-1 text-xs font-medium uppercase tracking-[0.14em]"
									style={{ color: tone.accent }}
								>
									Sample chapter
								</p>
								<h3 className="mb-4 font-serif text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
									{page.title}
								</h3>
								<div className="space-y-4 font-serif text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 sm:text-base sm:leading-8">
									{page.body.split("\n\n").map((para) => (
										<p key={para.slice(0, 24)}>{para}</p>
									))}
								</div>
							</motion.article>
						</AnimatePresence>
					</div>

					<div className="flex items-center justify-between gap-3 border-t border-zinc-200/80 bg-[#f7f4ef]/95 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={goPrev}
							disabled={pageIndex === 0}
							className="gap-1"
						>
							<ChevronLeft className="size-4" />
							Prev
						</Button>
						<div className="flex items-center gap-1.5" aria-hidden>
							{pages.map((_, i) => (
								<span
									key={i}
									className={cn(
										"size-1.5 rounded-full transition-colors",
										i === pageIndex ? "bg-zinc-800 dark:bg-zinc-200" : "bg-zinc-300 dark:bg-zinc-700"
									)}
								/>
							))}
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={goNext}
							disabled={pageIndex >= total - 1}
							className="gap-1"
						>
							Next
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
