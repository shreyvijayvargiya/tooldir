import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Ticket,
	FileText,
	Briefcase,
	Mail,
	GraduationCap,
	Mic,
	Puzzle,
	Blocks,
	Users,
	BookOpen,
	Percent,
	Rocket,
} from "lucide-react";
import CategoryChips from "../marketing/CategoryChips";
import SubmitToolCard from "../marketing/SubmitToolCard";
import DirectorySearchFilter, {
	useDirectoryListFilters,
} from "../marketing/DirectorySearchFilter";
import ToolsDirectoryTable from "../marketing/ToolsDirectoryTable";
import { useDirectoryTools } from "@/lib/hooks/useDirectoryTools";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	MotionSection,
	itemVariants,
	heroItemVariants,
	HeroBackdrop,
} from "./shared";
import { cn } from "@/lib/utils";

const HERO_ICONS = {
	ticket: Ticket,
	paper: FileText,
	split: Briefcase,
	inbox: Mail,
	syllabus: GraduationCap,
	waveform: Mic,
	browser: Puzzle,
	blocks: Blocks,
	radial: Users,
	shelf: BookOpen,
	bands: Percent,
	spotlight: Rocket,
};

/** Distinct hero shells — avoid one shared mesh look for every niche */
function NicheHero({ preset }) {
	const { landing, heroVariant = "mesh" } = preset;
	const Icon = HERO_ICONS[heroVariant] || Rocket;

	if (heroVariant === "split") {
		return (
			<section className="border-b">
				<div className="mx-auto grid max-w-6xl lg:grid-cols-2">
					<div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:py-24">
						<Badge variant="secondary" className="mb-4 w-fit gap-1">
							<Icon className="size-3" />
							{landing.badge}
						</Badge>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							{landing.headlineBefore}{" "}
							<span className="text-primary">{landing.headlineAccent}</span>
						</h1>
						<p className="mt-4 max-w-md text-muted-foreground">{landing.subhead}</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Button asChild size="lg">
								<Link href="/submit">
									{landing.primaryCta}
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="#trending">{landing.secondaryCta}</Link>
							</Button>
						</div>
					</div>
					<div className="relative flex items-center justify-center bg-zinc-950 px-8 py-16 text-zinc-100 dark:bg-zinc-900">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px]" />
						<div className="relative grid w-full max-w-sm gap-3">
							{(preset.stats
								? [
										[preset.stats.monthlyVisitors, "Visitors"],
										[preset.stats.itemsSubmitted, preset.stats.itemsSubmittedLabel],
										[preset.stats.thirdStat, preset.stats.thirdStatLabel],
									]
								: []
							).map(([value, label]) => (
								<div
									key={label}
									className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
								>
									<p className="text-2xl font-bold">{value}</p>
									<p className="text-xs text-zinc-400">{label}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "ticket") {
		return (
			<section className="relative overflow-hidden border-b bg-[#fff7ed] px-4 py-16 dark:bg-[#1c1008] sm:px-6 sm:py-20 lg:px-8">
				<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-[repeating-linear-gradient(-45deg,#fb923c33_0_8px,transparent_8px_16px)]" />
				<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-[repeating-linear-gradient(45deg,#fb923c33_0_8px,transparent_8px_16px)]" />
				<div className="relative z-10 mx-auto max-w-3xl rounded-2xl border-2 border-dashed border-orange-300/80 bg-background/90 p-8 text-center shadow-sm sm:p-12">
					<Badge className="mb-4 bg-orange-500 hover:bg-orange-500">{landing.badge}</Badge>
					<h1 className="text-4xl font-black tracking-tight sm:text-5xl">
						{landing.headlineBefore}{" "}
						<span className="text-orange-600 dark:text-orange-400">
							{landing.headlineAccent}
						</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-muted-foreground">{landing.subhead}</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Button asChild size="lg" className="bg-orange-600 hover:bg-orange-600/90">
							<Link href="/submit">{landing.primaryCta}</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "paper") {
		return (
			<section className="relative overflow-hidden border-b px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
				<div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)]" />
				<div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
				<div className="relative z-10 mx-auto max-w-3xl text-center">
					<div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-lg border bg-background shadow-sm">
						<Icon className="size-6" />
					</div>
					<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
						{landing.headlineBefore}{" "}
						<span className="underline decoration-primary/40 decoration-4 underline-offset-8">
							{landing.headlineAccent}
						</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-muted-foreground">{landing.subhead}</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Button asChild size="lg">
							<Link href="/submit">{landing.primaryCta}</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "browser") {
		return (
			<section className="border-b bg-muted/40 px-4 py-14 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-background shadow-lg">
					<div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
						<span className="size-2.5 rounded-full bg-red-400" />
						<span className="size-2.5 rounded-full bg-amber-400" />
						<span className="size-2.5 rounded-full bg-emerald-400" />
						<div className="ml-3 flex-1 rounded-md border bg-background px-3 py-1 text-xs text-muted-foreground">
							chrome://extensions — {preset.brand}
						</div>
					</div>
					<div className="px-6 py-12 text-center sm:px-10">
						<Badge variant="secondary" className="mb-4 gap-1">
							<Icon className="size-3" />
							{landing.badge}
						</Badge>
						<h1 className="text-3xl font-bold sm:text-5xl">
							{landing.headlineBefore}{" "}
							<span className="text-primary">{landing.headlineAccent}</span>
						</h1>
						<p className="mx-auto mt-4 max-w-xl text-muted-foreground">{landing.subhead}</p>
						<div className="mt-6 flex flex-wrap justify-center gap-3">
							<Button asChild size="lg">
								<Link href="/submit">{landing.primaryCta}</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="#trending">{landing.secondaryCta}</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "waveform") {
		return (
			<section className="relative overflow-hidden border-b bg-zinc-950 px-4 py-20 text-zinc-50 sm:px-6 lg:px-8">
				<div className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center gap-1 opacity-40">
					{Array.from({ length: 48 }).map((_, i) => (
						<span
							key={i}
							className="w-1.5 rounded-t bg-rose-400"
							style={{ height: `${12 + ((i * 17) % 64)}px` }}
						/>
					))}
				</div>
				<div className="relative z-10 mx-auto max-w-3xl text-center">
					<Badge className="mb-4 bg-rose-500 hover:bg-rose-500">{landing.badge}</Badge>
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
						{landing.headlineBefore}{" "}
						<span className="text-rose-300">{landing.headlineAccent}</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-zinc-400">{landing.subhead}</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Button asChild size="lg" className="bg-rose-500 text-white hover:bg-rose-500/90">
							<Link href="/submit">{landing.primaryCta}</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900"
						>
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "inbox") {
		return (
			<section className="border-b px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
				<div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<Badge variant="secondary" className="mb-4 gap-1">
							<Mail className="size-3" />
							{landing.badge}
						</Badge>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							{landing.headlineBefore}{" "}
							<span className="text-primary">{landing.headlineAccent}</span>
						</h1>
						<p className="mt-4 max-w-lg text-muted-foreground">{landing.subhead}</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Button asChild size="lg">
								<Link href="/submit">{landing.primaryCta}</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="#trending">{landing.secondaryCta}</Link>
							</Button>
						</div>
					</div>
					<div className="relative mx-auto w-full max-w-sm space-y-3">
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className={cn(
									"rounded-xl border bg-background p-4 shadow-sm",
									i === 0 && "rotate-[-2deg]",
									i === 1 && "translate-x-3 rotate-[1deg]",
									i === 2 && "translate-x-1 rotate-[-1deg]"
								)}
							>
								<div className="mb-2 h-2 w-24 rounded bg-muted" />
								<div className="h-2 w-full rounded bg-muted/70" />
								<div className="mt-1 h-2 w-2/3 rounded bg-muted/50" />
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "syllabus") {
		return (
			<section className="border-b px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8 text-center">
						<Badge variant="secondary" className="mb-4">{landing.badge}</Badge>
						<h1 className="text-4xl font-bold sm:text-5xl">
							{landing.headlineBefore}{" "}
							<span className="text-emerald-600 dark:text-emerald-400">
								{landing.headlineAccent}
							</span>
						</h1>
						<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
							{landing.subhead}
						</p>
					</div>
					<div className="relative space-y-4 border-l-2 border-emerald-500/40 pl-6">
						{["Week 1 — Foundations", "Week 2 — Build", "Week 3 — Launch"].map(
							(step, i) => (
								<div key={step} className="relative">
									<span className="absolute -left-[1.9rem] top-1 size-3 rounded-full bg-emerald-500" />
									<p className="font-medium">{step}</p>
									<p className="text-sm text-muted-foreground">
										Module {i + 1} included in featured courses
									</p>
								</div>
							)
						)}
					</div>
					<div className="mt-8 flex justify-center gap-3">
						<Button asChild size="lg">
							<Link href="/submit">{landing.primaryCta}</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (heroVariant === "bands" || heroVariant === "spotlight" || heroVariant === "radial" || heroVariant === "blocks" || heroVariant === "shelf") {
		const tones = {
			bands: "from-rose-100 via-orange-50 to-amber-100 dark:from-rose-950 dark:via-zinc-950 dark:to-amber-950",
			spotlight: "from-violet-100 via-fuchsia-50 to-background dark:from-violet-950 dark:via-zinc-950 dark:to-background",
			radial: "from-emerald-50 via-background to-sky-50 dark:from-emerald-950 dark:via-background dark:to-sky-950",
			blocks: "from-indigo-50 via-background to-violet-50 dark:from-indigo-950 dark:via-background dark:to-violet-950",
			shelf: "from-amber-50 via-orange-50/40 to-background dark:from-amber-950 dark:via-zinc-950 dark:to-background",
		};
		return (
			<section
				className={cn(
					"relative overflow-hidden border-b bg-gradient-to-br px-4 py-20 sm:px-6 lg:px-8",
					tones[heroVariant]
				)}
			>
				{heroVariant === "radial" ? (
					<div className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.25),transparent_65%)]" />
				) : null}
				{heroVariant === "blocks" ? (
					<div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,transparent_24px,#a78bfa33_25px),linear-gradient(#a78bfa22_24px,transparent_25px)] [background-size:48px_48px]" />
				) : null}
				{heroVariant === "bands" ? (
					<div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(105deg,transparent,transparent_40px,rgba(244,63,94,0.12)_40px,rgba(244,63,94,0.12)_80px)]" />
				) : null}
				<div className="relative z-10 mx-auto max-w-3xl text-center">
					<Badge variant="secondary" className="mb-4 gap-1">
						<Icon className="size-3" />
						{landing.badge}
					</Badge>
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
						{landing.headlineBefore}{" "}
						<span className="text-primary">{landing.headlineAccent}</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-muted-foreground">{landing.subhead}</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Button asChild size="lg">
							<Link href="/submit">
								{landing.primaryCta}
								<ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="#trending">{landing.secondaryCta}</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	/* default mesh */
	return (
		<MotionSection className="relative flex min-h-[48vh] items-center overflow-hidden border-b px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
			<HeroBackdrop presetId={preset.id} noiseOpacity={0.1} />
			<div className="relative z-10 mx-auto max-w-4xl text-center">
				<motion.div variants={heroItemVariants}>
					<Badge variant="secondary" className="mb-4 gap-1">
						<Icon className="size-3" />
						{landing.badge}
					</Badge>
				</motion.div>
				<motion.h1
					variants={heroItemVariants}
					className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
				>
					{landing.headlineBefore}{" "}
					<span className="text-primary">{landing.headlineAccent}</span>
				</motion.h1>
				<motion.p
					variants={heroItemVariants}
					className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
				>
					{landing.subhead}
				</motion.p>
				<motion.div
					variants={heroItemVariants}
					className="flex flex-col justify-center gap-3 sm:flex-row"
				>
					<Button asChild size="lg">
						<Link href="/submit">
							{landing.primaryCta}
							<ArrowRight className="size-4" />
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="#trending">{landing.secondaryCta}</Link>
					</Button>
				</motion.div>
			</div>
		</MotionSection>
	);
}

/** Shared catalog landing for extra niches — unique hero via preset.heroVariant */
export default function LandingCatalogDir() {
	const { preset } = usePreset();
	const { landing } = preset;
	const { data: tools = [], isLoading } = useDirectoryTools();
	const filters = useDirectoryListFilters(tools);
	const useCards = ["notion-templates", "course-directory"].includes(preset.id);

	return (
		<>
			<NicheHero preset={preset} />

			<MotionSection id="trending" className="px-4 py-12 pb-28 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl space-y-5">
					<motion.div variants={itemVariants}>
						<h2 className="mb-2 text-2xl font-bold">{landing.trendingTitle}</h2>
						<p className="mb-4 text-sm text-muted-foreground">
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
					</motion.div>

					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading…</p>
					) : useCards ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filters.filtered.map((tool) => (
								<Card key={tool.id || tool.slug} className="hover:border-primary/30">
									<CardContent className="space-y-2 p-5">
										<p className="font-semibold">{tool.name}</p>
										<p className="line-clamp-2 text-sm text-muted-foreground">
											{tool.description}
										</p>
										<p className="text-xs text-muted-foreground">
											{tool.category} · {tool.pricing}
										</p>
										<Button asChild size="sm" variant="outline" className="mt-2">
											<Link href={`/tool/${tool.slug}`}>View</Link>
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<ToolsDirectoryTable tools={filters.filtered} />
					)}
				</div>
			</MotionSection>

			<MotionSection className="border-t px-4 py-10 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<SubmitToolCard />
				</div>
			</MotionSection>
		</>
	);
}
