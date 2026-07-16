import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Blocks } from "lucide-react";
import ComponentsLibraryExplorer from "../marketing/ComponentsLibraryExplorer";
import StatsCards from "../marketing/StatsCards";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	MotionSection,
	itemVariants,
	heroItemVariants,
	HeroBackdrop,
} from "./shared";

/** CompDir — docs-style React component library (frontend-only) */
export default function LandingComponentsDir() {
	const { preset } = usePreset();
	const { landing } = preset;

	return (
		<>
			<MotionSection className="relative flex min-h-[40vh] items-center overflow-hidden border-b px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<HeroBackdrop presetId={preset.id} noiseOpacity={0.1} />
				<div className="relative z-10 mx-auto w-full max-w-4xl text-center">
					<motion.div variants={heroItemVariants}>
						<Badge variant="secondary" className="mb-4 gap-1">
							<Blocks className="size-3" />
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
						className="mx-auto mb-7 max-w-2xl text-lg text-muted-foreground"
					>
						{landing.subhead}
					</motion.p>
					<motion.div
						variants={heroItemVariants}
						className="flex flex-col justify-center gap-3 sm:flex-row"
					>
						<Button asChild size="lg">
							<Link href="#components">
								{landing.primaryCta}
								<ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<a
								href="https://ui.shadcn.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								shadcn/ui docs
							</a>
						</Button>
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection
				id="components"
				className="px-4 py-10 pb-28 sm:px-6 lg:px-8"
			>
				<div className="mx-auto max-w-7xl space-y-5">
					<motion.div variants={itemVariants}>
						<h2 className="mb-2 text-2xl font-bold text-foreground">
							{landing.trendingTitle}
						</h2>
						<p className="text-sm text-muted-foreground">
							{landing.trendingSubhead}
						</p>
					</motion.div>
					<motion.div variants={itemVariants}>
						<ComponentsLibraryExplorer />
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection className="border-t px-4 py-12 sm:px-6 lg:px-8">
				<motion.div className="mx-auto max-w-7xl" variants={itemVariants}>
					<div className="mb-8 text-center">
						<h2 className="mb-2 text-2xl font-bold">{landing.statsTitle}</h2>
						<p className="text-sm text-muted-foreground">
							{landing.statsSubhead}
						</p>
					</div>
					<StatsCards />
				</motion.div>
			</MotionSection>
		</>
	);
}
