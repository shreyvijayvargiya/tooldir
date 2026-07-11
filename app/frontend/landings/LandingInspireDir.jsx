import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LayoutTemplate } from "lucide-react";
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
import { MotionSection, heroItemVariants, HeroBackdrop } from "./shared";

/** InspireDir — Mobbin-style screenshot gallery grid */
export default function LandingInspireDir() {
	const { preset } = usePreset();
	const { landing } = preset;
	const { data: tools = [], isLoading } = useDirectoryTools();
	const filters = useDirectoryListFilters(tools);

	return (
		<>
			<MotionSection className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-10 overflow-hidden min-h-[42vh] flex items-end">
				<HeroBackdrop presetId={preset.id} noiseOpacity={0.14} />
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
					<div className="max-w-2xl">
						<motion.div variants={heroItemVariants}>
							<Badge variant="secondary" className="mb-3 gap-1">
								<LayoutTemplate className="w-3 h-3" />
								{landing.badge}
							</Badge>
						</motion.div>
						<motion.h1
							variants={heroItemVariants}
							className="text-3xl sm:text-5xl font-bold tracking-tight mb-3"
						>
							{landing.headlineBefore}{" "}
							<span className="text-primary">{landing.headlineAccent}</span>
						</motion.h1>
						<motion.p
							variants={heroItemVariants}
							className="text-muted-foreground"
						>
							{landing.subhead}
						</motion.p>
					</div>
					<motion.div variants={heroItemVariants} className="flex gap-2 shrink-0">
						<Button asChild>
							<Link href="/submit">
								{landing.primaryCta}
								<ArrowRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection id="trending" className="px-4 sm:px-6 lg:px-8 pb-28">
				<div className="max-w-7xl mx-auto space-y-5">
					<CategoryChips />
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

					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading screens…</p>
					) : filters.filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No screens match your search.
						</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{filters.filtered.map((tool, i) => (
								<Link
									key={tool.id || tool.slug}
									href={`/tool/${tool.slug}`}
									className="group block"
								>
									<div className="aspect-[4/3] rounded-2xl border bg-gradient-to-br from-muted to-muted/40 overflow-hidden relative mb-3">
										<div
											className="absolute inset-0 opacity-80"
											style={{
												background: `linear-gradient(${135 + i * 20}deg, hsl(var(--primary) / 0.15), hsl(var(--muted)), hsl(var(--primary) / 0.05))`,
											}}
										/>
										<div className="absolute inset-4 rounded-xl border bg-background/80 backdrop-blur-sm theme-blur shadow-sm flex flex-col p-4">
											<div className="h-2 w-16 rounded-full bg-muted mb-3" />
											<div className="space-y-2 flex-1">
												<div className="h-2 w-full rounded-full bg-muted/80" />
												<div className="h-2 w-4/5 rounded-full bg-muted/60" />
												<div className="h-16 rounded-lg bg-primary/10 mt-4" />
											</div>
										</div>
										<Badge className="absolute top-3 left-3 text-[10px]">
											{tool.country || "Web"}
										</Badge>
									</div>
									<div className="flex items-start justify-between gap-2 px-0.5">
										<div>
											<p className="font-medium group-hover:text-primary transition-colors">
												{tool.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{tool.category} · {tool.upvotes} upvotes
											</p>
										</div>
										<Badge variant="outline" className="text-[10px] shrink-0">
											{tool.pricing}
										</Badge>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</MotionSection>

			<MotionSection className="py-10 px-4 sm:px-6 lg:px-8 border-t bg-muted/20">
				<div className="max-w-7xl mx-auto space-y-10">
					<SubmitToolCard />
					<div>
						<h2 className="text-xl font-bold text-center mb-6">{landing.statsTitle}</h2>
						<div className="max-w-4xl mx-auto">
							<StatsCards />
						</div>
					</div>
				</div>
			</MotionSection>
		</>
	);
}
