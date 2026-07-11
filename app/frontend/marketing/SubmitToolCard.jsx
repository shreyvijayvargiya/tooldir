import React from "react";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SubmitToolCard = ({ className = "", compact = false }) => {
	const { preset } = usePreset();

	return (
		<motion.div
			initial={false}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className={className}
		>
			<Card
				className={cn(
					"relative overflow-hidden border-2 border-dashed border-primary/30 bg-primary/5",
					compact && "border-dashed"
				)}
			>
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.12),_transparent_55%)]" />
				<CardContent
					className={cn(
						"relative flex flex-col md:flex-row items-center justify-between gap-6",
						compact ? "p-6" : "p-8"
					)}
				>
					<div className="flex items-start gap-4">
						<div className="rounded-2xl border bg-background p-3 shadow-sm shrink-0">
							<motion.div
								animate={{
									y: [0, -5, 0],
									rotate: [0, -10, 10, 0],
								}}
								transition={{
									duration: 2.4,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								<Rocket className="w-6 h-6 text-primary" />
							</motion.div>
						</div>
						<div>
							<h3 className="text-xl font-bold text-foreground mb-1">
								{preset.landing.submitCardTitle}
							</h3>
							<p className="text-muted-foreground text-sm max-w-md">
								{preset.landing.submitCardBody}
							</p>
						</div>
					</div>
					<Button asChild size="lg" className="shrink-0">
						<Link href="/submit">
							{preset.landing.primaryCta}
							<ArrowRight className="w-4 h-4" />
						</Link>
					</Button>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default SubmitToolCard;
