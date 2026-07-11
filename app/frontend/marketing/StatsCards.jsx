import React, { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Wrench, Star } from "lucide-react";
import { usePreset } from "@/lib/presets/PresetContext";
import { Card, CardContent } from "@/components/ui/card";

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

const StatsCards = ({ className = "" }) => {
	const { preset } = usePreset();
	const items = useMemo(
		() => [
			{
				key: "monthlyVisitors",
				label: "Monthly Visitors",
				value: preset.stats.monthlyVisitors,
				icon: Users,
			},
			{
				key: "itemsSubmitted",
				label: preset.stats.itemsSubmittedLabel,
				value: preset.stats.itemsSubmitted,
				icon: Wrench,
			},
			{
				key: "thirdStat",
				label: preset.stats.thirdStatLabel,
				value: preset.stats.thirdStat,
				icon: Star,
			},
		],
		[preset]
	);

	return (
		<div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
			{items.map((stat, index) => (
				<GlowCard key={stat.key} stat={stat} index={index} />
			))}
		</div>
	);
};

export default StatsCards;
