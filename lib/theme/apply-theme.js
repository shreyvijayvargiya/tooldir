import { THEME_PRESETS, ACCENT_COLORS, CHART_COLORS, FONT_OPTIONS, FONT_SIZE_OPTIONS, LINE_HEIGHT_OPTIONS, LETTER_SPACING_OPTIONS, UI_DENSITY_OPTIONS, SPACING_SCALE_OPTIONS, CORNER_RADIUS_OPTIONS, BORDER_STYLE_OPTIONS, BORDER_WIDTH_OPTIONS, SHADOW_OPTIONS, BACKDROP_BLUR_OPTIONS, FOCUS_RING_OPTIONS } from "./theme-presets";

/**
 * Apply theme configuration as CSS custom properties on the document root.
 * All shadcn components read from these variables — one file controls the entire UI.
 */
export function applyThemeConfig(config, colorMode = "light") {
	if (typeof document === "undefined") return;

	const root = document.documentElement;
	const preset = THEME_PRESETS[config.theme] || THEME_PRESETS.default;
	const modeColors = colorMode === "dark" ? preset.dark : preset.light;

	// Color tokens from preset
	Object.entries(modeColors).forEach(([key, value]) => {
		root.style.setProperty(`--${key}`, value);
	});

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

	root.style.setProperty("--line-height", LINE_HEIGHT_OPTIONS[config.lineHeight]?.value || "1.5");
	root.style.setProperty("--letter-spacing", LETTER_SPACING_OPTIONS[config.letterSpacing]?.value || "0em");

	// Layout
	root.style.setProperty("--density-scale", UI_DENSITY_OPTIONS[config.uiDensity]?.scale || "1");
	root.style.setProperty("--spacing-scale", SPACING_SCALE_OPTIONS[config.spacingScale]?.value || "1");
	root.style.setProperty("--radius", CORNER_RADIUS_OPTIONS[config.cornerRadius]?.value || "0.75rem");

	// Borders & effects
	root.style.setProperty("--border-style", BORDER_STYLE_OPTIONS[config.borderStyle]?.value || "solid");
	root.style.setProperty("--border-width", BORDER_WIDTH_OPTIONS[config.borderWidth]?.value || "1px");
	root.style.setProperty("--shadow", SHADOW_OPTIONS[config.shadow]?.value || SHADOW_OPTIONS.sm.value);
	root.style.setProperty("--backdrop-blur", BACKDROP_BLUR_OPTIONS[config.backdropBlur]?.value || "0px");
	root.style.setProperty("--focus-ring-width", FOCUS_RING_OPTIONS[config.focusRingWidth]?.value || "2px");
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
