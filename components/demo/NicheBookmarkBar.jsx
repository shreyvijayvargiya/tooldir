import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
	Sparkles,
	Terminal,
	Palette,
	LayoutTemplate,
	Package,
	Bookmark,
	Paintbrush,
	Lock,
	ChevronsLeft,
	ChevronsRight,
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
 * DEMO ONLY — fixed bottom bookmark dock to switch niche templates.
 * Collapsible: collapsed shows only the expand toggle.
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
						"ring-1 ring-border/60 overflow-hidden"
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
								className="flex items-center gap-1 overflow-hidden"
							>
								<div className="hidden sm:flex items-center gap-1.5 px-2 text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
									<Bookmark className="size-3" />
									<span>Demo</span>
								</div>

								<div className="flex items-center gap-0.5">
									{PRESET_LIST.map((p) => {
										const Icon = PRESET_ICONS[p.id] || LayoutTemplate;
										const active = presetId === p.id;
										return (
											<DockIconButton
												key={p.id}
												label={p.brand}
												sublabel={p.tagline}
												active={active}
												onClick={() => setPresetId(p.id)}
											>
												<Icon className="size-4" />
											</DockIconButton>
										);
									})}

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

					{/* Always visible — collapse / expand */}
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
