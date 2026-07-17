import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
	ArrowRight,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
 * Demo-only template gallery — searchable grid.
 * Selecting a card opens the live niche preview on /demo.
 */
export default function TemplatesBrowse() {
	const router = useRouter();
	const { setPresetId } = usePreset();
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

	const openPreview = (id) => {
		setPresetId(id);
		router.push("/demo");
	};

	return (
		<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
			<div className="mb-10 max-w-2xl">
				<Badge variant="secondary" className="mb-3 gap-1">
					<LayoutTemplate className="size-3" />
					{PRESET_LIST.length} templates included
				</Badge>
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Browse niche templates
				</h1>
				<p className="mt-3 text-muted-foreground">
					Pick a niche, open a live preview, then buy ToolDir to lock it as your
					product. One codebase — many directory shapes.
				</p>
				<div className="mt-5 flex flex-wrap gap-2">
					<Button asChild variant="outline" size="sm">
						<Link href="/">Back to product</Link>
					</Button>
					<Button asChild size="sm">
						<a
							href={GUMROAD_TEMPLATE_URL}
							target="_blank"
							rel="noopener noreferrer"
						>
							Buy on Gumroad
							<ExternalLink className="size-3.5 opacity-80" />
						</a>
					</Button>
				</div>
			</div>

			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full max-w-md">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search by name or niche…"
						className="pl-9"
						aria-label="Search templates"
					/>
				</div>
				<p className="text-sm text-muted-foreground">
					{filtered.length} of {PRESET_LIST.length}
				</p>
			</div>

			<div className="mb-8 flex flex-wrap gap-2">
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

			{filtered.length === 0 ? (
				<p className="py-16 text-center text-sm text-muted-foreground">
					No templates match your search.
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((p, index) => {
						const Icon = PRESET_ICONS[p.id] || LayoutTemplate;
						return (
							<motion.div
								key={p.id}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: Math.min(index * 0.03, 0.3),
									duration: 0.35,
								}}
							>
								<button
									type="button"
									onClick={() => openPreview(p.id)}
									className="group h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/20">
										<CardContent className="flex h-full flex-col gap-4 p-5">
											<div className="flex items-start justify-between gap-3">
												<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
													<Icon className="size-5 text-primary" />
												</div>
												<Badge variant="outline" className="shrink-0 text-[10px]">
													{p.group || "Directories"}
												</Badge>
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-lg font-semibold tracking-tight">
													{p.brand}
												</p>
												<p className="mt-1 text-sm text-muted-foreground">
													{p.tagline}
												</p>
												<p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
													{p.seoDescription}
												</p>
											</div>
											<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
												Preview live
												<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
											</span>
										</CardContent>
									</Card>
								</button>
							</motion.div>
						);
					})}
				</div>
			)}
		</div>
	);
}
