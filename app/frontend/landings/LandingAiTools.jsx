import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";
import ToolsDirectoryTable from "../marketing/ToolsDirectoryTable";
import CategoryChips from "../marketing/CategoryChips";
import SubmitToolCard from "../marketing/SubmitToolCard";
import StatsCards from "../marketing/StatsCards";
import TestimonialsMarquee from "../marketing/TestimonialsMarquee";
import PricingCalendar from "../marketing/PricingCalendar";
import { usePricingSlots } from "@/lib/hooks/usePricingSlots";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	MotionSection,
	itemVariants,
	heroItemVariants,
	HeroBackdrop,
	getLandingHeroGradients,
} from "./shared";
import dynamic from "next/dynamic";

const AnimatedGradient = dynamic(
	() =>
		import("@/components/ui/animated-gradient").then((m) => m.AnimatedGradient),
	{ ssr: false }
);

/** ToolDir — classic directory: hero → table → submit → stats → pricing */
export default function LandingAiTools() {
	const { data: slotsMap = {} } = usePricingSlots();
	const { preset } = usePreset();
	const { landing } = preset;
	const pricingGradients = getLandingHeroGradients(preset.id);

	return (
		<>
			<MotionSection className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[60vh] flex items-center">
				<HeroBackdrop presetId={preset.id} />
				<div className="max-w-5xl mx-auto text-center relative z-10">
					<motion.div variants={heroItemVariants}>
						<Badge variant="secondary" className="mb-4 gap-1">
							<Sparkles className="w-3 h-3" />
							{landing.badge}
						</Badge>
					</motion.div>
					<motion.h1
						variants={heroItemVariants}
						className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight"
					>
						{landing.headlineBefore}{" "}
						<span className="text-primary">{landing.headlineAccent}</span>
					</motion.h1>
					<motion.p
						variants={heroItemVariants}
						className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
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

			<MotionSection id="trending" className="py-12 px-4 sm:px-6 lg:px-8 pb-28">
				<div className="max-w-7xl mx-auto space-y-5">
					<motion.div variants={itemVariants}>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							{landing.trendingTitle}
						</h2>
						<p className="text-muted-foreground text-sm">
							{landing.trendingSubhead}
						</p>
					</motion.div>
					<motion.div id="categories" className="w-full" variants={itemVariants}>
						<CategoryChips />
					</motion.div>
					<motion.div variants={itemVariants}>
						<ToolsDirectoryTable />
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection className="py-8 px-4 sm:px-6 lg:px-8">
				<motion.div className="max-w-7xl mx-auto" variants={itemVariants}>
					<SubmitToolCard />
				</motion.div>
			</MotionSection>

			<MotionSection className="py-16 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto space-y-14">
					<div className="max-w-4xl mx-auto">
						<motion.div variants={itemVariants} className="text-center mb-10">
							<h2 className="text-2xl font-bold text-foreground mb-2">
								{landing.statsTitle}
							</h2>
							<p className="text-muted-foreground text-sm">{landing.statsSubhead}</p>
						</motion.div>
						<motion.div variants={itemVariants}>
							<StatsCards />
						</motion.div>
					</div>
					<motion.div variants={itemVariants} className="overflow-hidden">
						<div className="text-center mb-8">
							<h3 className="text-2xl font-bold text-foreground mb-2">
								{landing.testimonialsTitle}
							</h3>
							<p className="text-muted-foreground text-sm">
								{landing.testimonialsSubhead}
							</p>
						</div>
						<TestimonialsMarquee />
					</motion.div>
				</div>
			</MotionSection>

			<MotionSection className="py-16 px-4 sm:px-6 lg:px-8">
				<motion.div variants={itemVariants}>
					<Card className="relative overflow-hidden border shadow-xl shadow-primary/5">
						<div className="pointer-events-none absolute inset-0" aria-hidden>
							<AnimatedGradient
								config={pricingGradients.light}
								darkConfig={pricingGradients.dark}
								noise={{ opacity: 0.1, scale: 1 }}
							/>
							<div className="absolute inset-0 bg-background/40" />
						</div>
						<CardContent className="relative z-10 p-6 sm:p-8 max-w-3xl mx-auto">
							<div className="text-center mb-8">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-background/90 shadow-sm backdrop-blur-sm">
									<Calendar className="h-5 w-5 text-primary" />
								</div>
								<Badge
									variant="outline"
									className="mb-3 gap-1 bg-background/70 backdrop-blur-sm"
								>
									Launch Slots
								</Badge>
								<h2 className="text-2xl font-bold text-foreground mb-2">
									Book Your Launch Slot
								</h2>
								<p className="text-muted-foreground text-sm max-w-lg mx-auto">
									{landing.pricingSubhead}
								</p>
							</div>
							<PricingCalendar mini slotsMap={slotsMap} />
							<div className="text-center mt-6">
								<Button asChild size="lg">
									<Link href="/pricing">
										View Full Pricing
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</MotionSection>
		</>
	);
}
