import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import CategoryChips from "../marketing/CategoryChips";
import SubmitToolCard from "../marketing/SubmitToolCard";
import ToolsDirectoryTable from "../marketing/ToolsDirectoryTable";
import DirectorySearchFilter, {
	useDirectoryListFilters,
} from "../marketing/DirectorySearchFilter";
import { useDirectoryTools } from "@/lib/hooks/useDirectoryTools";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotionSection, heroItemVariants, HeroBackdrop } from "./shared";

/** DesignDir — image cards + full directory table below */
export default function LandingDesignDir() {
	const { preset } = usePreset();
	const { landing } = preset;
	const { data: tools = [], isLoading } = useDirectoryTools();
	const filters = useDirectoryListFilters(tools);

	return (
		<>
			<MotionSection className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-14 overflow-hidden min-h-[50vh] flex items-center">
				<HeroBackdrop presetId={preset.id} noiseOpacity={0.1} />
				<div className="max-w-5xl mx-auto text-left relative z-10 w-full">
					<motion.p
						variants={heroItemVariants}
						className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6"
					>
						{landing.badge}
					</motion.p>
					<motion.h1
						variants={heroItemVariants}
						className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-6"
					>
						{landing.headlineBefore}
						<br />
						<span className="text-primary">{landing.headlineAccent}</span>
					</motion.h1>
					<motion.p
						variants={heroItemVariants}
						className="text-lg text-muted-foreground mb-8 max-w-xl"
					>
						{landing.subhead}
					</motion.p>
					<motion.div variants={heroItemVariants} className="flex flex-wrap gap-3">
						<Button asChild size="lg" variant="default">
							<Link href="/submit">
								{landing.primaryCta}
								<ArrowRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="ghost">
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</motion.div>
				</div>
			</MotionSection>

			{/* Featured image cards */}
			<MotionSection className="px-4 sm:px-6 lg:px-8 pb-10">
				<div className="max-w-7xl mx-auto space-y-5">
					<div>
						<h2 className="text-xl font-semibold mb-1">Featured kits</h2>
						<p className="text-sm text-muted-foreground mb-4">
							Sample previews from the design library
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
						<p className="text-sm text-muted-foreground">Loading resources…</p>
					) : filters.filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No resources match your search.
						</p>
					) : (
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{filters.filtered.map((tool) => (
								<Link
									key={tool.id || tool.slug}
									href={`/tool/${tool.slug}`}
									className="group block"
								>
									<Card className="overflow-hidden h-full hover:border-primary/40 transition-colors">
										<div className="aspect-[16/10] bg-muted relative overflow-hidden">
											{tool.screenshot ? (
												<img
													src={tool.screenshot}
													alt={tool.name}
													className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
													loading="lazy"
												/>
											) : (
												<div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-muted" />
											)}
											<Badge
												variant="secondary"
												className="absolute top-3 left-3 text-[10px] bg-background/90 backdrop-blur-sm"
											>
												{tool.category}
											</Badge>
										</div>
										<CardContent className="p-4 space-y-2">
											<div className="flex items-start justify-between gap-2">
												<h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
													{tool.name}
												</h3>
												<Badge variant="outline" className="shrink-0 text-[10px]">
													{tool.pricing}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{tool.description}
											</p>
											<p className="text-xs text-muted-foreground flex items-center gap-1">
												{tool.upvotes} upvotes
												<ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
											</p>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}
				</div>
			</MotionSection>

			{/* Directory table below — includes ToolDir search + filter */}
			<MotionSection id="trending" className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/20 pb-28">
				<div className="max-w-7xl mx-auto space-y-5">
					<div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							{landing.trendingTitle}
						</h2>
						<p className="text-muted-foreground text-sm">
							{landing.trendingSubhead}
						</p>
					</div>
					<ToolsDirectoryTable showSubmitCta={false} />
				</div>
			</MotionSection>

			<MotionSection className="py-10 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<SubmitToolCard />
				</div>
			</MotionSection>
		</>
	);
}
