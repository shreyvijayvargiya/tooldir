import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shapes } from "lucide-react";
import IconsDirectoryGrid from "../marketing/IconsDirectoryGrid";
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

/** IconDir — Lucide React icon grid with copy-to-clipboard (frontend-only) */
export default function LandingIconsDir() {
	const { preset } = usePreset();
	const { landing } = preset;

	return (
		<>
			<MotionSection className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[48vh] flex items-center border-b">
				<HeroBackdrop presetId={preset.id} noiseOpacity={0.1} />
				<div className="max-w-5xl mx-auto text-center relative z-10 w-full">
					<motion.div variants={heroItemVariants}>
						<Badge variant="secondary" className="mb-4 gap-1">
							<Shapes className="w-3 h-3" />
							{landing.badge}
						</Badge>
					</motion.div>
					<motion.h1
						variants={heroItemVariants}
						className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
					>
						{landing.headlineBefore}{" "}
						<span className="text-primary">{landing.headlineAccent}</span>
					</motion.h1>
					<motion.p
						variants={heroItemVariants}
						className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
					>
						{landing.subhead}
					</motion.p>
					<motion.div
						variants={heroItemVariants}
						className="flex flex-col sm:flex-row gap-3 justify-center"
					>
						<Button asChild size="lg">
							<Link href="#icons">
								{landing.primaryCta}
								<ArrowRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<a
								href="https://lucide.dev"
								target="_blank"
								rel="noopener noreferrer"
							>
								Lucide docs
							</a>
						</Button>
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection id="icons" className="py-12 px-4 sm:px-6 lg:px-8 pb-28">
				<div className="max-w-7xl mx-auto space-y-5">
					<motion.div variants={itemVariants}>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							{landing.trendingTitle}
						</h2>
						<p className="text-muted-foreground text-sm">
							{landing.trendingSubhead}
						</p>
					</motion.div>
					<motion.div variants={itemVariants}>
						<IconsDirectoryGrid />
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection className="py-12 px-4 sm:px-6 lg:px-8 border-t">
				<motion.div className="max-w-7xl mx-auto" variants={itemVariants}>
					<div className="mb-8 text-center">
						<h2 className="text-2xl font-bold mb-2">{landing.statsTitle}</h2>
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
