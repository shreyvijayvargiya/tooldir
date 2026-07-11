import React from "react";
import { LayoutTemplate, Check } from "lucide-react";
import { usePreset } from "@/lib/presets/PresetContext";
import { PRESET_LIST } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * DEMO ONLY — rendered when NEXT_PUBLIC_PRESET_SWITCHER=true.
 * Excluded from buyer zip via scripts/pack-zip.sh.
 */
export default function NichePresetSwitcher({ className }) {
	const { preset, presetId, setPresetId, switcherEnabled } = usePreset();

	if (!switcherEnabled) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={cn("h-9 gap-1.5 max-w-[160px]", className)}
					title="Switch niche template (demo)"
				>
					<LayoutTemplate className="size-3.5 shrink-0" />
					<span className="truncate">{preset.brand}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 z-[120]">
				<DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
					Demo niche templates
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{PRESET_LIST.map((p) => (
					<DropdownMenuItem
						key={p.id}
						onClick={() => setPresetId(p.id)}
						className="flex items-center justify-between gap-2"
					>
						<span className="flex flex-col items-start gap-0.5">
							<span className="font-medium">{p.brand}</span>
							<span className="text-[11px] text-muted-foreground">
								{p.tagline}
							</span>
						</span>
						{presetId === p.id ? (
							<Check className="size-4 shrink-0 text-primary" />
						) : null}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
