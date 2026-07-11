import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download, Package } from "lucide-react";
import CategoryChips from "../marketing/CategoryChips";
import SubmitToolCard from "../marketing/SubmitToolCard";
import TestimonialsMarquee from "../marketing/TestimonialsMarquee";
import DirectorySearchFilter, {
	useDirectoryListFilters,
} from "../marketing/DirectorySearchFilter";
import { useDirectoryTools } from "@/lib/hooks/useDirectoryTools";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotionSection, heroItemVariants, HeroBackdrop } from "./shared";

/** ResourceDir — marketplace cards with distinct icons per asset */
export default function LandingResourceDir() {
	const { preset } = usePreset();
	const { landing } = preset;
	const { data: tools = [], isLoading } = useDirectoryTools();
	const filters = useDirectoryListFilters(tools);

	return (
		<>
			<MotionSection className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-20 min-h-[50vh] flex items-center">
				<HeroBackdrop presetId={preset.id} noiseOpacity={0.1} />
				<div className="relative z-10 max-w-4xl mx-auto text-center w-full">
					<motion.div variants={heroItemVariants}>
						<Badge variant="secondary" className="mb-4 gap-1">
							<Package className="w-3 h-3" />
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
						className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
					>
						{landing.subhead}
					</motion.p>
					<motion.div
						variants={heroItemVariants}
						className="flex flex-col sm:flex-row gap-3 justify-center"
					>
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
			</MotionSection>

			<MotionSection id="trending" className="py-10 px-4 sm:px-6 lg:px-8 pb-28">
				<div className="max-w-7xl mx-auto space-y-6">
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
						<p className="text-sm text-muted-foreground">Loading assets…</p>
					) : filters.filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No assets match your search.
						</p>
					) : (
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{filters.filtered.map((tool) => (
								<Card
									key={tool.id || tool.slug}
									className="overflow-hidden group hover:border-primary/30 transition-colors"
								>
									<div className="h-36 bg-muted/60 border-b flex items-center justify-center relative">
										{tool.logo ? (
											<img
												src={tool.logo}
												alt=""
												className="size-16 rounded-2xl object-cover shadow-sm ring-1 ring-border/60 bg-background"
												loading="lazy"
											/>
										) : (
											<div className="size-16 rounded-2xl bg-background border flex items-center justify-center">
												<Package className="size-7 text-muted-foreground/60" />
											</div>
										)}
										<Badge className="absolute top-3 right-3" variant="secondary">
											{tool.pricing}
										</Badge>
									</div>
									<CardContent className="p-5 space-y-3">
										<div className="flex items-start gap-3">
											{tool.logo ? (
												<img
													src={tool.logo}
													alt=""
													className="size-9 rounded-lg object-cover shrink-0 ring-1 ring-border/50"
													loading="lazy"
												/>
											) : null}
											<div className="min-w-0">
												<Link
													href={`/tool/${tool.slug}`}
													className="font-semibold hover:text-primary"
												>
													{tool.name}
												</Link>
												<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
													{tool.description}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-between gap-2 pt-1">
											<span className="text-xs text-muted-foreground">
												{tool.category} · {tool.upvotes} votes
											</span>
											<Button asChild size="sm" variant="outline" className="gap-1">
												<Link href={`/tool/${tool.slug}`}>
													<Download className="size-3.5" />
													View
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</MotionSection>

			<MotionSection className="py-10 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<SubmitToolCard />
				</div>
			</MotionSection>

			<MotionSection className="py-12 px-4 sm:px-6 lg:px-8 border-t">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-8">
						<h3 className="text-2xl font-bold mb-2">{landing.testimonialsTitle}</h3>
						<p className="text-sm text-muted-foreground">
							{landing.testimonialsSubhead}
						</p>
					</div>
					<TestimonialsMarquee />
				</div>
			</MotionSection>
		</>
	);
}
