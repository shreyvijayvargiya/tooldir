import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	ExternalLink,
	LayoutTemplate,
	Search,
	Sparkles,
	Terminal,
	Palette,
	Package,
	Shapes,
	Blocks,
	Ticket,
	FileText,
	Briefcase,
	Mail,
	GraduationCap,
	Mic,
	Puzzle,
	Users,
	BookOpen,
	Percent,
	Rocket,
} from "lucide-react";
import { PRESET_LIST } from "@/lib/presets";
import { usePreset } from "@/lib/presets/PresetContext";
import { getLandingComponent } from "@/app/frontend/landings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GUMROAD_TEMPLATE_URL } from "./ProductHome";

const PRESET_ICONS = {
	"ai-tools": Sparkles,
	"prompt-library": Terminal,
	"design-resources": Palette,
	"ui-inspiration": LayoutTemplate,
	resources: Package,
	"icons-library": Shapes,
	"components-library": Blocks,
	"coupons-deals": Ticket,
	"notion-templates": FileText,
	"job-board": Briefcase,
	"newsletter-directory": Mail,
	"course-directory": GraduationCap,
	"podcast-directory": Mic,
	"chrome-extensions": Puzzle,
	"no-code-tools": Blocks,
	communities: Users,
	"ebook-directory": BookOpen,
	"affiliate-offers": Percent,
	"indie-products": Rocket,
};

/**
 * Demo-only gallery: search + group chips + live niche preview + Gumroad CTA.
 */
export default function TemplatesBrowse() {
	const { presetId, setPresetId, preset } = usePreset();
	const [query, setQuery] = useState("");
	const [group, setGroup] = useState("All");

	const groups = useMemo(() => {
		const set = new Set(PRESET_LIST.map((p) => p.group || "Directories"));
		return ["All", ...[...set].sort()];
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return PRESET_LIST.filter((p) => {
			const g = p.group || "Directories";
			if (group !== "All" && g !== group) return false;
			if (!q) return true;
			return (
				p.brand.toLowerCase().includes(q) ||
				p.tagline.toLowerCase().includes(q) ||
				p.id.includes(q) ||
				g.toLowerCase().includes(q)
			);
		});
	}, [query, group]);

	const Landing = getLandingComponent(preset);

	const select = (id) => {
		setPresetId(id);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<div className="sticky top-0 z-[60] border-b bg-background/95 backdrop-blur-md">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
					<div className="flex flex-wrap items-center gap-3">
						<Button asChild variant="ghost" size="sm" className="shrink-0">
							<Link href="/">
								<ArrowLeft className="size-4" />
								Product
							</Link>
						</Button>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-semibold">Browse templates</p>
							<p className="truncate text-xs text-muted-foreground">
								{PRESET_LIST.length} niche landings — click to preview
							</p>
						</div>
						<div className="ml-auto flex shrink-0 items-center gap-2">
							<Button asChild variant="outline" size="sm">
								<Link href="/demo">
									Full preview
									<ExternalLink className="size-3.5" />
								</Link>
							</Button>
							<Button asChild size="sm">
								<a
									href={GUMROAD_TEMPLATE_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									Buy access
								</a>
							</Button>
						</div>
					</div>

					<div className="relative max-w-xl">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search templates by name…"
							className="pl-9"
							aria-label="Search templates"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{groups.map((g) => (
							<button
								key={g}
								type="button"
								onClick={() => setGroup(g)}
								className={cn(
									"rounded-full border px-3 py-1 text-xs font-medium transition-colors",
									group === g
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background hover:bg-muted"
								)}
							>
								{g}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="mx-auto grid w-full max-w-7xl flex-1 gap-0 lg:grid-cols-[280px_1fr]">
				<aside className="border-b lg:border-b-0 lg:border-r">
					<div className="sticky top-[9.5rem] max-h-[calc(100vh-10rem)] space-y-1 overflow-y-auto p-3">
						{filtered.length === 0 ? (
							<p className="px-2 py-6 text-center text-sm text-muted-foreground">
								No templates match.
							</p>
						) : (
							filtered.map((p) => {
								const Icon = PRESET_ICONS[p.id] || LayoutTemplate;
								const active = presetId === p.id;
								return (
									<button
										key={p.id}
										type="button"
										onClick={() => select(p.id)}
										className={cn(
											"flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
											active
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted"
										)}
									>
										<Icon className="mt-0.5 size-4 shrink-0 opacity-90" />
										<span className="min-w-0">
											<span className="block truncate text-sm font-semibold">
												{p.brand}
											</span>
											<span
												className={cn(
													"block truncate text-[11px]",
													active
														? "text-primary-foreground/80"
														: "text-muted-foreground"
												)}
											>
												{p.tagline}
											</span>
										</span>
									</button>
								);
							})
						)}
					</div>
				</aside>

				<section className="min-w-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 sm:px-6">
						<Badge variant="secondary">{preset.brand}</Badge>
						<span className="text-sm text-muted-foreground">{preset.tagline}</span>
						<span className="ml-auto text-xs text-muted-foreground">
							Live preview
						</span>
					</div>
					<motion.div
						key={preset.id}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						className="pb-24"
					>
						<Landing />
					</motion.div>
				</section>
			</div>
		</div>
	);
}
