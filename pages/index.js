import React from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import ToolsDirectoryTable from "../app/frontend/marketing/ToolsDirectoryTable";
import CategoryChips from "../app/frontend/marketing/CategoryChips";
import SubmitToolCard from "../app/frontend/marketing/SubmitToolCard";
import StatsCards from "../app/frontend/marketing/StatsCards";
import TestimonialsMarquee from "../app/frontend/marketing/TestimonialsMarquee";
import PricingCalendar from "../app/frontend/marketing/PricingCalendar";
import { usePricingSlots } from "@/lib/hooks/usePricingSlots";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const AnimatedGradient = dynamic(
	() =>
		import("@/components/ui/animated-gradient").then((m) => m.AnimatedGradient),
	{ ssr: false }
);

const ease = [0.22, 1, 0.36, 1];

const sectionVariants = {
	hidden: { opacity: 0, y: 48 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease, when: "beforeChildren", staggerChildren: 0.08 },
	},
	exit: {
		opacity: 0,
		y: -28,
		transition: { duration: 0.45, ease },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease },
	},
	exit: {
		opacity: 0,
		y: -12,
		transition: { duration: 0.3, ease },
	},
};

const heroItemVariants = {
	hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.65, ease },
	},
	exit: {
		opacity: 0,
		y: -16,
		filter: "blur(4px)",
		transition: { duration: 0.35, ease },
	},
};

const viewport = { once: false, amount: 0.2, margin: "-40px 0px" };

const MotionSection = ({ children, className, id, delay = 0 }) => (
	<motion.section
		id={id}
		className={className}
		variants={sectionVariants}
		initial="hidden"
		whileInView="visible"
		exit="exit"
		viewport={viewport}
		transition={{ delay }}
	>
		{children}
	</motion.section>
);

const HERO_GRADIENT_LIGHT = {
	preset: "custom",
	color1: "#ffffff",
	color2: "#eef6ff",
	color3: "#7eb8ff",
	rotation: -40,
	proportion: 55,
	scale: 0.55,
	speed: 12,
	distortion: 24,
	swirl: 50,
	swirlIterations: 8,
	softness: 100,
	offset: 80,
	shape: "Edge",
	shapeSize: 45,
};

const HERO_GRADIENT_DARK = {
	preset: "custom",
	color1: "#050810",
	color2: "#0b1a33",
	color3: "#1d6fd8",
	rotation: -40,
	proportion: 55,
	scale: 0.55,
	speed: 12,
	distortion: 24,
	swirl: 50,
	swirlIterations: 8,
	softness: 100,
	offset: 80,
	shape: "Edge",
	shapeSize: 45,
};

const HomePage = () => {
	const { data: slotsMap = {} } = usePricingSlots();
	return (
		<>
			<Head>
				<title>ToolDir — AI Tool Directory</title>
				<meta
					name="description"
					content="Discover trending AI tools. Browse, compare, and submit the best AI products in one curated directory."
				/>
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />

				{/* Hero */}
				<MotionSection className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[60vh] flex items-center">
					<div className="absolute inset-0 pointer-events-none" aria-hidden>
						<AnimatedGradient
							config={HERO_GRADIENT_LIGHT}
							darkConfig={HERO_GRADIENT_DARK}
							noise={{ opacity: 0.12, scale: 1 }}
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
					</div>
					<div className="max-w-5xl mx-auto text-center relative z-10">
						<motion.div variants={heroItemVariants}>
							<Badge variant="secondary" className="mb-4 gap-1">
								<Sparkles className="w-3 h-3" />
								AI Tool Directory
							</Badge>
						</motion.div>
						<motion.h1
							variants={heroItemVariants}
							className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight"
						>
							Discover the Best{" "}
							<span className="text-primary">AI Tools</span>
						</motion.h1>
						<motion.p
							variants={heroItemVariants}
							className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
						>
							The curated directory for AI builders and users. Browse trending
							tools, compare features, and launch your product to 1M+ monthly
							visitors.
						</motion.p>
						<motion.div
							variants={heroItemVariants}
							className="flex flex-col sm:flex-row gap-3 justify-center"
						>
							<Button asChild size="lg">
								<Link href="/submit">
									Submit Your Tool
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="#trending">Browse Tools</Link>
							</Button>
						</motion.div>
					</div>
				</MotionSection>

				{/* Trending Tools Table */}
				<MotionSection id="trending" className="py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto space-y-5">
						<motion.div variants={itemVariants}>
							<h2 className="text-2xl font-bold text-foreground mb-2">
								Trending AI Tools
							</h2>
							<p className="text-muted-foreground text-sm">
								Latest tools ranked by community upvotes and GitHub stars
							</p>
						</motion.div>

						<motion.div
							id="categories"
							className="w-full"
							variants={itemVariants}
						>
							<CategoryChips />
						</motion.div>

						<motion.div variants={itemVariants}>
							<ToolsDirectoryTable />
						</motion.div>
					</div>
				</MotionSection>

				{/* Submit CTA */}
				<MotionSection className="py-8 px-4 sm:px-6 lg:px-8">
					<motion.div className="max-w-7xl mx-auto" variants={itemVariants}>
						<SubmitToolCard />
					</motion.div>
				</MotionSection>

				{/* Stats + Testimonials */}
				<MotionSection className="py-16 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto space-y-14">
						<div className="max-w-4xl mx-auto">
							<motion.div variants={itemVariants} className="text-center mb-10">
								<h2 className="text-2xl font-bold text-foreground mb-2">
									Trusted by Builders Worldwide
								</h2>
								<p className="text-muted-foreground text-sm">
									Real numbers from our growing AI tool community
								</p>
							</motion.div>
							<motion.div variants={itemVariants}>
								<StatsCards />
							</motion.div>
						</div>

						<motion.div variants={itemVariants} className="overflow-hidden">
							<div className="text-center mb-8">
								<h3 className="text-2xl font-bold text-foreground mb-2">
									What Founders Say
								</h3>
								<p className="text-muted-foreground text-sm">
									Builders who launched on ToolDir
								</p>
							</div>
							<TestimonialsMarquee />
						</motion.div>
					</div>
				</MotionSection>

				{/* Pricing Preview */}
				<MotionSection className="py-16 px-4 sm:px-6 lg:px-8">
					<motion.div className="" variants={itemVariants}>
						<Card className="relative overflow-hidden border shadow-xl shadow-primary/5">
							<div className="pointer-events-none absolute inset-0" aria-hidden>
								<AnimatedGradient
									config={HERO_GRADIENT_LIGHT}
									darkConfig={HERO_GRADIENT_DARK}
									noise={{ opacity: 0.1, scale: 1 }}
								/>
								<div className="absolute inset-0 bg-background/40" />
							</div>
							<CardContent className="relative z-10 p-6 sm:p-8 max-w-3xl mx-auto">
								<div className="text-center mb-8">
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-background/90 shadow-sm backdrop-blur-sm">
										<motion.div
											animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }}
											transition={{
												duration: 2.6,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										>
											<Calendar className="h-5 w-5 text-primary" />
										</motion.div>
									</div>
									<Badge variant="outline" className="mb-3 gap-1 bg-background/70 backdrop-blur-sm">
										Launch Slots
									</Badge>
									<h2 className="text-2xl font-bold text-foreground mb-2">
										Book Your Launch Slot
									</h2>
									<p className="text-muted-foreground text-sm max-w-lg mx-auto">
										Choose a date to launch your tool with featured placement.
										Free slots available early each month.
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

				<Footer />
			</div>
		</>
	);
};

export default HomePage;
