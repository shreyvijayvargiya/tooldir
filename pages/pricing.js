import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Rocket } from "lucide-react";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import StatsCards from "../app/frontend/marketing/StatsCards";
import TestimonialsMarquee from "../app/frontend/marketing/TestimonialsMarquee";
import { PRICING_PLANS } from "@/lib/data/pricing-slots";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PricingPage = () => {
	return (
		<>
			<Head>
				<title>Pricing — ToolDir Launch Slots</title>
				<meta
					name="description"
					content="Choose a launch plan for your AI tool. Standard, Premium, or Weekend Featured on ToolDir."
				/>
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="py-16 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						<motion.div
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
								Launch Pricing
							</h1>
							<p className="text-muted-foreground max-w-xl mx-auto">
								Pick a plan that matches your launch goals. Hover any card for
								quick details — then continue to submit and book your slot.
							</p>
						</motion.div>

						<div className="flex flex-col lg:flex-row gap-6 items-stretch">
							{PRICING_PLANS.map((plan) => (
								<FollowerPointerCard
									key={plan.id}
									className="flex-1 min-w-0"
									title={
										<span className="font-medium">{plan.pointerTitle}</span>
									}
								>
									<Card
										className={cn(
											"h-full flex flex-col transition-shadow duration-200 hover:shadow-lg",
											plan.featured && "border-primary shadow-md ring-1 ring-primary/20"
										)}
									>
										<CardHeader className="space-y-3">
											<div className="flex items-center justify-between gap-2">
												<CardTitle className="text-xl">{plan.name}</CardTitle>
												{plan.featured && (
													<Badge>Popular</Badge>
												)}
											</div>
											<div className="flex items-baseline gap-1">
												<span className="text-4xl font-bold tracking-tight">
													${plan.price}
												</span>
												<span className="text-sm text-muted-foreground">
													/{plan.period}
												</span>
											</div>
											<CardDescription>{plan.description}</CardDescription>
										</CardHeader>

										<CardContent className="flex-1 space-y-4">
											<p className="text-sm text-muted-foreground leading-relaxed">
												{plan.details}
											</p>
											<ul className="space-y-2.5">
												{plan.perks.map((perk) => (
													<li
														key={perk}
														className="flex items-start gap-2 text-sm"
													>
														<Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
														<span>{perk}</span>
													</li>
												))}
											</ul>
										</CardContent>

										<CardFooter>
											<Button
												asChild
												className="w-full"
												variant={plan.featured ? "default" : "outline"}
											>
												<Link href={`/submit?plan=${plan.id}`}>
													{plan.cta}
													<ArrowRight className="w-4 h-4" />
												</Link>
											</Button>
										</CardFooter>
									</Card>
								</FollowerPointerCard>
							))}
						</div>
					</div>
				</section>

				<section className="py-16 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-10">
							<h2 className="text-2xl font-bold text-foreground mb-2">
								Why Launch on ToolDir?
							</h2>
						</div>
						<StatsCards />
					</div>
				</section>

				<section className="py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-8">
							<h2 className="text-2xl font-bold text-foreground mb-2">
								What Founders Say
							</h2>
							<p className="text-muted-foreground text-sm">
								Builders who launched on ToolDir
							</p>
						</div>
						<TestimonialsMarquee />
					</div>
				</section>

				<section className="py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl mx-auto">
						<Card className="relative overflow-hidden border-dashed">
							<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_55%)]" />
							<CardContent className="relative p-8 sm:p-10 text-center">
								<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border bg-background shadow-sm">
									<motion.div
										animate={{
											y: [0, -6, 0],
											rotate: [0, -8, 8, 0],
										}}
										transition={{
											duration: 2.4,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										<Rocket className="h-6 w-6 text-primary" />
									</motion.div>
								</div>
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Ready to launch?
								</h3>
								<p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto leading-relaxed">
									List your AI tool, pick a plan, and go live in one flow —
									badge, slot, and directory listing included.
								</p>
								<Button asChild size="lg">
									<Link href="/submit">
										Submit Your Tool
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default PricingPage;
