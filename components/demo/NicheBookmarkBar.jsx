import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
	Sparkles,
	Terminal,
	Palette,
	LayoutTemplate,
	Package,
	Shapes,
	Blocks,
	Home,
	Paintbrush,
	Lock,
	ChevronsLeft,
	ChevronsRight,
	ChevronUp,
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
	Grid2X2,
} from "lucide-react";
import { usePreset } from "@/lib/presets/PresetContext";
import { useThemeConfig } from "@/lib/theme/ThemeConfigContext";
import { PRESET_LIST, isPresetSwitcherEnabled } from "@/lib/presets";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const GUMROAD_URL =
	"https://shreyvijayvargiya.gumroad.com/l/nextjs-supabase-directory-boilerplate?layout=profile";

const COLLAPSE_KEY = "tooldir-niche-dock-collapsed";

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

const DockIconButton = ({
	label,
	sublabel,
	onClick,
	active,
	href,
	children,
}) => {
	const className = cn(
		"relative flex size-10 items-center justify-center rounded-xl transition-colors",
		"hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		active && "bg-primary text-primary-foreground hover:bg-primary/90"
	);

	const inner = (
		<>
			<motion.span
				whileHover={{ y: -3, scale: 1.08 }}
				whileTap={{ scale: 0.94 }}
				transition={{ type: "spring", stiffness: 500, damping: 22 }}
				className="flex items-center justify-center"
			>
				{children}
			</motion.span>
			{active ? (
				<motion.span
					layoutId="niche-bookmark-dot"
					className="absolute bottom-1 size-1 rounded-full bg-primary-foreground/90"
				/>
			) : null}
		</>
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{href ? (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={label}
						className={className}
					>
						{inner}
					</a>
				) : (
					<button
						type="button"
						aria-label={label}
						aria-pressed={active}
						onClick={onClick}
						className={className}
					>
						{inner}
					</button>
				)}
			</TooltipTrigger>
			<TooltipContent side="top" sideOffset={10} className="px-3 py-2 text-center">
				<motion.div
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.18 }}
				>
					<p className="text-sm font-semibold">{label}</p>
					{sublabel ? (
						<p className="text-[11px] text-muted-foreground max-w-[160px]">
							{sublabel}
						</p>
					) : null}
				</motion.div>
			</TooltipContent>
		</Tooltip>
	);
};

/**
 * DEMO ONLY — fixed bottom bookmark dock.
 * Templates live in an upward-opening dropdown (avoids crowding the bar).
 */
export default function NicheBookmarkBar() {
	const router = useRouter();
	const { presetId, setPresetId, switcherEnabled } = usePreset();
	const { setCustomizerOpen } = useThemeConfig();
	const [collapsed, setCollapsed] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		try {
			setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
		} catch {
			/* ignore */
		}
		setReady(true);
	}, []);

	const grouped = useMemo(() => {
		const map = new Map();
		for (const p of PRESET_LIST) {
			const g = p.group || "Directories";
			if (!map.has(g)) map.set(g, []);
			map.get(g).push(p);
		}
		return [...map.entries()];
	}, []);

	const activePreset = PRESET_LIST.find((p) => p.id === presetId);
	const ActiveIcon = PRESET_ICONS[presetId] || LayoutTemplate;
	const onDemo =
		router.pathname === "/demo" || router.pathname === "/templates";

	const selectTemplate = (id) => {
		setPresetId(id);
		if (router.pathname !== "/demo" && router.pathname !== "/templates") {
			router.push("/demo");
		}
	};

	const toggleCollapsed = () => {
		setCollapsed((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
			} catch {
				/* ignore */
			}
			return next;
		});
	};

	if (!switcherEnabled && !isPresetSwitcherEnabled()) return null;
	if (!switcherEnabled) return null;
	if (router.pathname.startsWith("/admin")) return null;
	if (!ready) return null;

	return (
		<TooltipProvider delayDuration={80}>
			<div className="fixed bottom-4 left-1/2 z-[95] -translate-x-1/2 pointer-events-none">
				<motion.div
					layout
					initial={{ y: 40, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ type: "spring", stiffness: 380, damping: 28 }}
					className={cn(
						"pointer-events-auto flex items-center gap-1 rounded-2xl border bg-background/95 p-1.5 shadow-xl backdrop-blur-md",
						"ring-1 ring-border/60 overflow-visible"
					)}
				>
					<AnimatePresence initial={false} mode="popLayout">
						{!collapsed ? (
							<motion.div
								key="dock-expanded"
								layout
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ type: "spring", stiffness: 420, damping: 32 }}
								className="flex items-center gap-1 overflow-visible"
							>
								<div className="flex items-center gap-0.5">
									<DockIconButton
										label="Product home"
										sublabel="What ToolDir is & pricing"
										active={router.pathname === "/"}
										onClick={() => router.push("/")}
									>
										<Home className="size-4" />
									</DockIconButton>

									<span className="mx-0.5 h-6 w-px bg-border shrink-0" aria-hidden />

									<DropdownMenu>
										<Tooltip>
											<TooltipTrigger asChild>
												<DropdownMenuTrigger asChild>
													<button
														type="button"
														aria-label="Templates"
														className={cn(
															"relative flex h-10 items-center gap-1.5 rounded-xl px-2.5 transition-colors",
															"hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
															onDemo &&
																"bg-primary text-primary-foreground hover:bg-primary/90"
														)}
													>
														<ActiveIcon className="size-4 shrink-0" />
														<span className="hidden max-w-[88px] truncate text-xs font-medium sm:inline">
															{activePreset?.brand || "Templates"}
														</span>
														<ChevronUp className="size-3.5 opacity-70" />
													</button>
												</DropdownMenuTrigger>
											</TooltipTrigger>
											<TooltipContent side="top" sideOffset={10}>
												<p className="text-sm font-semibold">Templates</p>
												<p className="text-[11px] text-muted-foreground">
													{PRESET_LIST.length} niche landings
												</p>
											</TooltipContent>
										</Tooltip>
										<DropdownMenuContent
											side="top"
											align="center"
											sideOffset={12}
											className="max-h-[min(70vh,420px)] w-64 overflow-y-auto"
										>
											<DropdownMenuLabel>All templates</DropdownMenuLabel>
											<DropdownMenuSeparator />
											{grouped.map(([group, items], gi) => (
												<React.Fragment key={group}>
													{gi > 0 ? <DropdownMenuSeparator /> : null}
													<DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
														{group}
													</DropdownMenuLabel>
													{items.map((p) => {
														const Icon = PRESET_ICONS[p.id] || LayoutTemplate;
														return (
															<DropdownMenuItem
																key={p.id}
																onSelect={() => selectTemplate(p.id)}
																className={cn(
																	"gap-2",
																	presetId === p.id && "bg-accent"
																)}
															>
																<Icon className="size-4 shrink-0" />
																<span className="truncate font-medium">
																	{p.brand}
																</span>
																<span className="ml-auto truncate text-[10px] text-muted-foreground">
																	{p.tagline.split(" ")[0]}
																</span>
															</DropdownMenuItem>
														);
													})}
												</React.Fragment>
											))}
										</DropdownMenuContent>
									</DropdownMenu>

									<DockIconButton
										label="Browse templates"
										sublabel="Search, filter & preview"
										active={router.pathname === "/templates"}
										onClick={() => router.push("/templates")}
									>
										<Grid2X2 className="size-4" />
									</DockIconButton>

									<span className="mx-0.5 h-6 w-px bg-border shrink-0" aria-hidden />

									<DockIconButton
										label="Theme"
										sublabel="CSS & visual customizer"
										onClick={() => setCustomizerOpen(true)}
									>
										<Paintbrush className="size-4" />
									</DockIconButton>

									<DockIconButton
										label="Buy the template"
										sublabel="Unlock full ToolDir on Gumroad"
										href={GUMROAD_URL}
									>
										<Lock className="size-4" />
									</DockIconButton>

									<span className="mx-0.5 h-6 w-px bg-border shrink-0" aria-hidden />
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>

					<DockIconButton
						label={collapsed ? "Expand dock" : "Collapse dock"}
						sublabel={
							collapsed
								? "Show niches, theme & buy"
								: "Hide bar — keep only this toggle"
						}
						onClick={toggleCollapsed}
					>
						{collapsed ? (
							<ChevronsRight className="size-4" />
						) : (
							<ChevronsLeft className="size-4" />
						)}
					</DockIconButton>
				</motion.div>
			</div>
		</TooltipProvider>
	);
}
