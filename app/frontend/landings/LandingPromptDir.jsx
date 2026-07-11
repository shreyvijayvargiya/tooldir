import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Terminal } from "lucide-react";
import CategoryChips from "../marketing/CategoryChips";
import SubmitToolCard from "../marketing/SubmitToolCard";
import StatsCards from "../marketing/StatsCards";
import DirectorySearchFilter, {
	useDirectoryListFilters,
} from "../marketing/DirectorySearchFilter";
import { useDirectoryTools } from "@/lib/hooks/useDirectoryTools";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotionSection, heroItemVariants, HeroBackdrop } from "./shared";

/** PromptDir — terminal-style hero + searchable prompt cards */
export default function LandingPromptDir() {
	const { preset } = usePreset();
	const { landing } = preset;
	const { data: tools = [], isLoading } = useDirectoryTools();
	const filters = useDirectoryListFilters(tools);

	return (
		<>
			<MotionSection className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[52vh] flex items-center border-b">
				<HeroBackdrop presetId={preset.id} noiseOpacity={0.1} />
				<div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center relative z-10 w-full">
					<div>
						<motion.div variants={heroItemVariants}>
							<Badge variant="secondary" className="mb-4 gap-1">
								<Terminal className="w-3 h-3" />
								{landing.badge}
							</Badge>
						</motion.div>
						<motion.h1
							variants={heroItemVariants}
							className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
						>
							{landing.headlineBefore}{" "}
							<span className="text-primary">{landing.headlineAccent}</span>
						</motion.h1>
						<motion.p
							variants={heroItemVariants}
							className="text-muted-foreground text-lg mb-6 max-w-xl"
						>
							{landing.subhead}
						</motion.p>
						<motion.div variants={heroItemVariants} className="flex flex-wrap gap-3">
							<Button asChild size="lg">
								<Link href="/submit">
									{landing.primaryCta}
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="#trending">{landing.secondaryCta}</Link>
							</Button>
						</motion.div>
					</div>

					<motion.div variants={heroItemVariants}>
						<Card className="bg-zinc-950 text-zinc-100 border-zinc-800 overflow-hidden">
							<CardContent className="p-0">
								<div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 text-xs text-zinc-400">
									<span className="size-2.5 rounded-full bg-red-500/80" />
									<span className="size-2.5 rounded-full bg-amber-500/80" />
									<span className="size-2.5 rounded-full bg-emerald-500/80" />
									<span className="ml-2">prompt.md — Claude / Cursor</span>
								</div>
								<pre className="p-5 text-sm leading-relaxed font-mono whitespace-pre-wrap text-emerald-300/90">
{`You are a senior engineer.
Review this diff for bugs, edge cases,
and clearer naming. Suggest a patch.`}
								</pre>
								<div className="px-4 py-3 border-t border-zinc-800 flex justify-end">
									<Button size="sm" variant="secondary" className="gap-1.5">
										<Copy className="size-3.5" />
										Copy prompt
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection id="trending" className="py-12 px-4 sm:px-6 lg:px-8 pb-28">
				<div className="max-w-6xl mx-auto space-y-6">
					<div>
						<h2 className="text-2xl font-bold">{landing.trendingTitle}</h2>
						<p className="text-sm text-muted-foreground mb-4">
							{landing.trendingSubhead}
						</p>
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
					</div>

					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading prompts…</p>
					) : filters.filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No prompts match your search.
						</p>
					) : (
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{filters.filtered.map((tool) => (
								<Link key={tool.id || tool.slug} href={`/tool/${tool.slug}`}>
									<Card className="h-full hover:border-primary/40 transition-colors">
										<CardContent className="p-5 space-y-3">
											<div className="flex items-start justify-between gap-2">
												<h3 className="font-semibold text-foreground leading-snug">
													{tool.name}
												</h3>
												<Badge variant="outline" className="shrink-0 text-[10px]">
													{tool.category}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{tool.description}
											</p>
											<div className="flex flex-wrap gap-1.5">
												{(tool.tags || []).slice(0, 3).map((tag) => (
													<Badge key={tag} variant="secondary" className="text-[10px]">
														{tag}
													</Badge>
												))}
											</div>
											<p className="text-xs text-muted-foreground">
												{tool.upvotes} upvotes · {tool.pricing}
											</p>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}
				</div>
			</MotionSection>

			<MotionSection className="py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto">
					<SubmitToolCard />
				</div>
			</MotionSection>

			<MotionSection className="py-14 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
				<div className="max-w-4xl mx-auto text-center mb-8">
					<h2 className="text-2xl font-bold mb-2">{landing.statsTitle}</h2>
					<p className="text-sm text-muted-foreground">{landing.statsSubhead}</p>
				</div>
				<div className="max-w-4xl mx-auto">
					<StatsCards />
				</div>
			</MotionSection>
		</>
	);
}
