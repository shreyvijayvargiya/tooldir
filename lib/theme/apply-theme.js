import {
	THEME_PRESETS,
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
	STYLE_PRESETS,
	BASE_COLORS,
} from "./theme-presets";

/** Neutral hue per base color — drives muted / border / secondary surfaces */
const BASE_COLOR_HUES = {
	stone: 30,
	zinc: 240,
	slate: 215,
	neutral: 0,
	gray: 220,
};

/**
 * Style presets tweak radius + default elevation feel on top of theme colors.
 */
const STYLE_PRESET_OVERRIDES = {
	lyra: {},
	vega: { cornerRadiusHint: "sm", shadowHint: "none" },
	mira: { cornerRadiusHint: "xl", shadowHint: "md", blurHint: "lg" },
};

/**
 * Apply theme configuration as CSS custom properties on the document root.
 * All shadcn / Tailwind theme tokens read from these variables.
 */
export function applyThemeConfig(config, colorMode = "light") {
	if (typeof document === "undefined") return;

	const root = document.documentElement;
	const preset = THEME_PRESETS[config.theme] || THEME_PRESETS.default;
	const modeColors = colorMode === "dark" ? preset.dark : preset.light;
	const isDark = colorMode === "dark";

	// Color tokens from preset
	Object.entries(modeColors).forEach(([key, value]) => {
		root.style.setProperty(`--${key}`, value);
	});

	// Base color (neutral surfaces) — was stored but never applied
	const baseKey = BASE_COLORS[config.baseColor] ? config.baseColor : "zinc";
	const hue = BASE_COLOR_HUES[baseKey] ?? 240;
	if (isDark) {
		root.style.setProperty("--secondary", `${hue} 4% 16%`);
		root.style.setProperty("--muted", `${hue} 4% 16%`);
		root.style.setProperty("--accent", `${hue} 4% 16%`);
		root.style.setProperty("--border", `${hue} 4% 18%`);
		root.style.setProperty("--input", `${hue} 4% 18%`);
		root.style.setProperty("--muted-foreground", `${hue} 5% 65%`);
	} else {
		root.style.setProperty("--secondary", `${hue} 5% 96%`);
		root.style.setProperty("--muted", `${hue} 5% 96%`);
		root.style.setProperty("--accent", `${hue} 5% 96%`);
		root.style.setProperty("--border", `${hue} 6% 90%`);
		root.style.setProperty("--input", `${hue} 6% 90%`);
		root.style.setProperty("--muted-foreground", `${hue} 4% 46%`);
	}

	// Override primary with accent color if set
	const accent = ACCENT_COLORS[config.accent];
	if (accent) {
		root.style.setProperty("--primary", `${accent.hue} 90% 48%`);
		root.style.setProperty("--ring", `${accent.hue} 90% 48%`);
	}

	// Chart colors
	const chart = CHART_COLORS[config.chartColor];
	if (chart) {
		chart.colors.forEach((color, i) => {
			root.style.setProperty(`--chart-${i + 1}`, color);
		});
	}

	// Typography
	const headingFont = FONT_OPTIONS[config.headingFont]?.value || FONT_OPTIONS.inter.value;
	const bodyFont = FONT_OPTIONS[config.bodyFont]?.value || FONT_OPTIONS.inter.value;
	root.style.setProperty("--font-heading", headingFont);
	root.style.setProperty("--font-body", bodyFont);
	root.style.fontFamily = bodyFont;

	const fontSize = FONT_SIZE_OPTIONS[config.fontSize]?.value || "16px";
	root.style.setProperty("--font-size-base", fontSize);
	root.style.fontSize = fontSize;

	root.style.setProperty(
		"--line-height",
		LINE_HEIGHT_OPTIONS[config.lineHeight]?.value || "1.5"
	);
	root.style.setProperty(
		"--letter-spacing",
		LETTER_SPACING_OPTIONS[config.letterSpacing]?.value || "0em"
	);

	// Layout
	const density = UI_DENSITY_OPTIONS[config.uiDensity]?.scale || "1";
	const spacing = SPACING_SCALE_OPTIONS[config.spacingScale]?.value || "1";
	root.style.setProperty("--density-scale", density);
	root.style.setProperty("--spacing-scale", spacing);

	// Style preset can nudge radius / shadow / blur when user hasn't customized heavily
	const styleKey = STYLE_PRESETS[config.stylePreset] ? config.stylePreset : "lyra";
	const styleHints = STYLE_PRESET_OVERRIDES[styleKey] || {};

	const radiusKey = config.cornerRadius || styleHints.cornerRadiusHint || "lg";
	root.style.setProperty(
		"--radius",
		CORNER_RADIUS_OPTIONS[radiusKey]?.value || "0.75rem"
	);

	// Borders & effects — written as CSS vars consumed by Tailwind + globals
	root.style.setProperty(
		"--border-style",
		BORDER_STYLE_OPTIONS[config.borderStyle]?.value || "solid"
	);
	root.style.setProperty(
		"--border-width",
		BORDER_WIDTH_OPTIONS[config.borderWidth]?.value || "1px"
	);

	const shadowKey = config.shadow || styleHints.shadowHint || "sm";
	root.style.setProperty(
		"--shadow",
		SHADOW_OPTIONS[shadowKey]?.value || SHADOW_OPTIONS.sm.value
	);

	const blurKey = config.backdropBlur || styleHints.blurHint || "none";
	root.style.setProperty(
		"--backdrop-blur",
		BACKDROP_BLUR_OPTIONS[blurKey]?.value || "0px"
	);

	root.style.setProperty(
		"--focus-ring-width",
		FOCUS_RING_OPTIONS[config.focusRingWidth]?.value || "2px"
	);

	// Density: scale root rem so padding/spacing utilities feel tighter/looser
	const densityNum = Number.parseFloat(density) || 1;
	const spacingNum = Number.parseFloat(spacing) || 1;
	const combined = densityNum * spacingNum;
	if (combined !== 1) {
		const basePx = Number.parseFloat(fontSize) || 16;
		root.style.fontSize = `${basePx * combined}px`;
	}
}

export const THEME_STORAGE_KEY = "buildsaas-theme-config";

export function loadThemeConfig() {
	if (typeof window === "undefined") return null;
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored ? JSON.parse(stored) : null;
	} catch {
		return null;
	}
}

export function saveThemeConfig(config) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
	} catch {
		// ignore
	}
}
