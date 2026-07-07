import React from "react";
import { X, RotateCcw } from "lucide-react";
import { useThemeConfig } from "@/lib/theme/ThemeConfigContext";
import {
	THEME_PRESETS,
	STYLE_PRESETS,
	BASE_COLORS,
	ACCENT_COLORS,
	CHART_COLORS,
	FONT_OPTIONS,
	FONT_SIZE_OPTIONS,
	LINE_HEIGHT_OPTIONS,
	LETTER_SPACING_OPTIONS,
	UI_DENSITY_OPTIONS,
	SPACING_SCALE_OPTIONS,
	CORNER_RADIUS_OPTIONS,
	BORDER_STYLE_OPTIONS,
	BORDER_WIDTH_OPTIONS,
	SHADOW_OPTIONS,
	BACKDROP_BLUR_OPTIONS,
	FOCUS_RING_OPTIONS,
} from "@/lib/theme/theme-presets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function ThemeSelect({ label, value, options, onChange, renderOption }) {
	const entries = Object.entries(options);
	return (
		<div className="space-y-1.5">
			<Label className="text-xs text-muted-foreground">{label}</Label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="h-9 bg-background/50">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{entries.map(([key, opt]) => (
						<SelectItem key={key} value={key}>
							{renderOption ? renderOption(key, opt) : opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function SectionTitle({ children }) {
	return (
		<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-4 mb-2">
			{children}
		</p>
	);
}

export function ThemeCustomizer() {
	const { config, updateConfig, resetConfig, customizerOpen, setCustomizerOpen } =
		useThemeConfig();

	if (!customizerOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
				onClick={() => setCustomizerOpen(false)}
			/>
			<div
				className={cn(
					"fixed right-0 top-0 z-[101] h-full w-[340px] overflow-y-auto",
					"border-l border-border/50 shadow-2xl",
					"bg-background/70 backdrop-blur-xl",
					"animate-in slide-in-from-right duration-300"
				)}
				style={{ backdropFilter: `blur(var(--backdrop-blur, 16px))` }}
			>
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/60 backdrop-blur-md px-5 py-4 z-50">
					<div>
						<h2 className="text-base font-semibold text-foreground">Theme Customizer</h2>
						<p className="text-xs text-muted-foreground">Customize your theme</p>
					</div>
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" onClick={resetConfig} className="text-xs h-8">
							<RotateCcw className="w-3 h-3 mr-1" />
							Reset
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setCustomizerOpen(false)}
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-5 py-4 space-y-1">
					<SectionTitle>Colors</SectionTitle>

					<ThemeSelect
						label="Theme"
						value={config.theme}
						options={THEME_PRESETS}
						onChange={(v) => updateConfig({ theme: v })}
						renderOption={(key, opt) => (
							<div className="flex items-center gap-2">
								<div className="flex gap-0.5">
									{opt.swatches?.map((c, i) => (
										<div
											key={i}
											className="w-3 h-3 rounded-full border border-border"
											style={{ backgroundColor: c }}
										/>
									))}
								</div>
								{opt.label}
							</div>
						)}
					/>

					<ThemeSelect
						label="Style preset"
						value={config.stylePreset}
						options={STYLE_PRESETS}
						onChange={(v) => updateConfig({ stylePreset: v })}
					/>

					<ThemeSelect
						label="Base color"
						value={config.baseColor}
						options={BASE_COLORS}
						onChange={(v) => updateConfig({ baseColor: v })}
					/>

					<ThemeSelect
						label="Accent"
						value={config.accent}
						options={ACCENT_COLORS}
						onChange={(v) => updateConfig({ accent: v })}
					/>

					<ThemeSelect
						label="Chart color"
						value={config.chartColor}
						options={CHART_COLORS}
						onChange={(v) => updateConfig({ chartColor: v })}
					/>

					<SectionTitle>Typography</SectionTitle>

					<ThemeSelect
						label="Heading font"
						value={config.headingFont}
						options={FONT_OPTIONS}
						onChange={(v) => updateConfig({ headingFont: v })}
					/>

					<ThemeSelect
						label="Body font"
						value={config.bodyFont}
						options={FONT_OPTIONS}
						onChange={(v) => updateConfig({ bodyFont: v })}
					/>

					<ThemeSelect
						label="Font size"
						value={config.fontSize}
						options={FONT_SIZE_OPTIONS}
						onChange={(v) => updateConfig({ fontSize: v })}
					/>

					<ThemeSelect
						label="Line height"
						value={config.lineHeight}
						options={LINE_HEIGHT_OPTIONS}
						onChange={(v) => updateConfig({ lineHeight: v })}
					/>

					<ThemeSelect
						label="Letter spacing"
						value={config.letterSpacing}
						options={LETTER_SPACING_OPTIONS}
						onChange={(v) => updateConfig({ letterSpacing: v })}
					/>

					<SectionTitle>Layout</SectionTitle>

					<ThemeSelect
						label="UI density"
						value={config.uiDensity}
						options={UI_DENSITY_OPTIONS}
						onChange={(v) => updateConfig({ uiDensity: v })}
					/>

					<ThemeSelect
						label="Spacing scale"
						value={config.spacingScale}
						options={SPACING_SCALE_OPTIONS}
						onChange={(v) => updateConfig({ spacingScale: v })}
					/>

					<ThemeSelect
						label="Corner radius"
						value={config.cornerRadius}
						options={CORNER_RADIUS_OPTIONS}
						onChange={(v) => updateConfig({ cornerRadius: v })}
					/>

					<SectionTitle>Borders &amp; Effects</SectionTitle>

					<ThemeSelect
						label="Border style"
						value={config.borderStyle}
						options={BORDER_STYLE_OPTIONS}
						onChange={(v) => updateConfig({ borderStyle: v })}
					/>

					<ThemeSelect
						label="Border width"
						value={config.borderWidth}
						options={BORDER_WIDTH_OPTIONS}
						onChange={(v) => updateConfig({ borderWidth: v })}
					/>

					<ThemeSelect
						label="Shadow / elevation"
						value={config.shadow}
						options={SHADOW_OPTIONS}
						onChange={(v) => updateConfig({ shadow: v })}
					/>

					<ThemeSelect
						label="Backdrop blur"
						value={config.backdropBlur}
						options={BACKDROP_BLUR_OPTIONS}
						onChange={(v) => updateConfig({ backdropBlur: v })}
					/>

					<ThemeSelect
						label="Focus ring width"
						value={config.focusRingWidth}
						options={FOCUS_RING_OPTIONS}
						onChange={(v) => updateConfig({ focusRingWidth: v })}
					/>

					<Separator className="my-6" />
					<p className="text-xs text-muted-foreground text-center pb-4">
						Changes apply instantly across the entire app.
					</p>
				</div>
			</div>
		</>
	);
}

export function ThemeCustomizerButton() {
	const { setCustomizerOpen } = useThemeConfig();
	return (
		<Button
			variant="ghost"
			size="icon"
			className="w-9 h-9"
			onClick={() => setCustomizerOpen(true)}
			title="Theme Customizer"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="13.5" cy="6.5" r="2.5" />
				<circle cx="17.5" cy="10.5" r="2.5" />
				<circle cx="8.5" cy="7.5" r="2.5" />
				<circle cx="6.5" cy="12.5" r="2.5" />
				<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2" />
			</svg>
		</Button>
	);
}
