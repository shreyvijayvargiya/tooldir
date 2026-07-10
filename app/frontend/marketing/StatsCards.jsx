import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, Wrench, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_STATS } from "@/lib/data/tools";

const STAT_ITEMS = [
	{
		key: "monthlyVisitors",
		label: "Monthly Visitors",
		value: SITE_STATS.monthlyVisitors,
		icon: Users,
	},
	{
		key: "toolsSubmitted",
		label: "Tools Submitted",
		value: SITE_STATS.toolsSubmitted,
		icon: Wrench,
	},
	{
		key: "githubStars",
		label: "Open Source GitHub Stars",
		value: SITE_STATS.githubStars,
		icon: Star,
	},
];

const GlowCard = ({ stat, index }) => {
	const cardRef = useRef(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isHovered, setIsHovered] = useState(false);
	const Icon = stat.icon;

	const handleMouseMove = (e) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		setPosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	return (
		<motion.div
			initial={false}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			whileHover={{ scale: 1.05 }}
			transition={{ delay: index * 0.1 }}
		>
			<Card
				ref={cardRef}
				className="relative overflow-hidden border"
				onMouseMove={handleMouseMove}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{isHovered && (
					<div
						className="pointer-events-none absolute -inset-px opacity-40 transition-opacity duration-300"
						style={{
							background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, hsl(var(--primary) / 0.25), transparent 40%)`,
						}}
					/>
				)}
				<CardContent className="relative p-6">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
							<p className="text-3xl font-bold text-foreground">{stat.value}</p>
						</div>
						<div className="rounded-xl bg-primary/10 p-3">
							<Icon className="h-5 w-5 text-primary" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

const StatsCards = ({ className = "" }) => (
	<div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
		{STAT_ITEMS.map((stat, index) => (
			<GlowCard key={stat.key} stat={stat} index={index} />
		))}
	</div>
);

export default StatsCards;
