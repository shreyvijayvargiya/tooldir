import React from "react";
import Link from "next/link";
import {
	PenLine,
	Image,
	Code2,
	Zap,
	Megaphone,
	BarChart3,
	Github,
	Clapperboard,
	Bot,
	Workflow,
	Layers,
	Sparkles,
	Palette,
	FileText,
	Layout,
} from "lucide-react";
import { usePreset } from "@/lib/presets/PresetContext";
import { cn } from "@/lib/utils";

const ICONS = {
	PenLine,
	Image,
	Code2,
	Zap,
	Megaphone,
	BarChart3,
	Github,
	Clapperboard,
	Bot,
	Workflow,
	Layers,
	Sparkles,
	Palette,
	FileText,
	Layout,
};

const CategoryChips = ({ className = "", activeSlug = null }) => {
	const { preset } = usePreset();
	const categories = preset.categoryMeta || [];

	return (
		<div
			className={cn(
				"flex flex-row flex-wrap items-center gap-2 sm:gap-2.5",
				className
			)}
		>
			{categories.map((cat) => {
				const Icon = ICONS[cat.icon] || Zap;
				const active = activeSlug === cat.slug;
				return (
					<Link
						key={cat.slug}
						href={`/categories/${cat.slug}`}
						className={cn(
							"inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-md",
							cat.bg,
							cat.border,
							cat.color,
							active && "ring-2 ring-primary/40 shadow-sm"
						)}
					>
						<Icon className="h-4 w-4 shrink-0" />
						<span className="whitespace-nowrap">{cat.name}</span>
					</Link>
				);
			})}
		</div>
	);
};

export default CategoryChips;
