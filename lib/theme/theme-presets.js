/**
 * Theme presets — each preset defines HSL values for light & dark modes.
 * The ThemeProvider applies these as CSS variables on :root / .dark
 */

export const THEME_PRESETS = {
	default: {
		label: "Default",
		swatches: ["#18181b", "#3f3f46", "#0070f3", "#fafafa"],
		light: {
			background: "0 0% 100%",
			foreground: "240 10% 3.9%",
			card: "0 0% 100%",
			"card-foreground": "240 10% 3.9%",
			popover: "0 0% 100%",
			"popover-foreground": "240 10% 3.9%",
			primary: "211 100% 48%",
			"primary-foreground": "0 0% 100%",
			secondary: "240 4.8% 95.9%",
			"secondary-foreground": "240 5.9% 10%",
			muted: "240 4.8% 95.9%",
			"muted-foreground": "240 3.8% 46.1%",
			accent: "240 4.8% 95.9%",
			"accent-foreground": "240 5.9% 10%",
			destructive: "0 84.2% 60.2%",
			"destructive-foreground": "0 0% 98%",
			border: "240 5.9% 90%",
			input: "240 5.9% 90%",
			ring: "211 100% 48%",
		},
		dark: {
			background: "240 10% 3.9%",
			foreground: "0 0% 98%",
			card: "240 10% 3.9%",
			"card-foreground": "0 0% 98%",
			popover: "240 10% 3.9%",
			"popover-foreground": "0 0% 98%",
			primary: "211 100% 48%",
			"primary-foreground": "0 0% 100%",
			secondary: "240 3.7% 15.9%",
			"secondary-foreground": "0 0% 98%",
			muted: "240 3.7% 15.9%",
			"muted-foreground": "240 5% 64.9%",
			accent: "240 3.7% 15.9%",
			"accent-foreground": "0 0% 98%",
			destructive: "0 62.8% 30.6%",
			"destructive-foreground": "0 0% 98%",
			border: "240 3.7% 15.9%",
			input: "240 3.7% 15.9%",
			ring: "211 100% 48%",
		},
	},
	claude: {
		label: "Claude",
		swatches: ["#1a1a1a", "#2d2a26", "#d97706", "#faf8f5"],
		light: {
			background: "40 33% 98%",
			foreground: "30 10% 10%",
			card: "40 33% 98%",
			"card-foreground": "30 10% 10%",
			popover: "40 33% 98%",
			"popover-foreground": "30 10% 10%",
			primary: "25 95% 43%",
			"primary-foreground": "0 0% 100%",
			secondary: "30 15% 93%",
			"secondary-foreground": "30 10% 10%",
			muted: "30 15% 93%",
			"muted-foreground": "30 8% 45%",
			accent: "30 15% 93%",
			"accent-foreground": "30 10% 10%",
			destructive: "0 84.2% 60.2%",
			"destructive-foreground": "0 0% 98%",
			border: "30 15% 88%",
			input: "30 15% 88%",
			ring: "25 95% 43%",
		},
		dark: {
			background: "30 10% 8%",
			foreground: "40 20% 95%",
			card: "30 10% 10%",
			"card-foreground": "40 20% 95%",
			popover: "30 10% 10%",
			"popover-foreground": "40 20% 95%",
			primary: "25 95% 53%",
			"primary-foreground": "0 0% 100%",
			secondary: "30 8% 18%",
			"secondary-foreground": "40 20% 95%",
			muted: "30 8% 18%",
			"muted-foreground": "30 8% 60%",
			accent: "30 8% 18%",
			"accent-foreground": "40 20% 95%",
			destructive: "0 62.8% 30.6%",
			"destructive-foreground": "0 0% 98%",
			border: "30 8% 20%",
			input: "30 8% 20%",
			ring: "25 95% 53%",
		},
	},
	ocean: {
		label: "Ocean",
		swatches: ["#0c4a6e", "#0369a1", "#0ea5e9", "#f0f9ff"],
		light: {
			background: "204 100% 97%",
			foreground: "200 80% 10%",
			card: "0 0% 100%",
			"card-foreground": "200 80% 10%",
			popover: "0 0% 100%",
			"popover-foreground": "200 80% 10%",
			primary: "199 89% 48%",
			"primary-foreground": "0 0% 100%",
			secondary: "204 80% 92%",
			"secondary-foreground": "200 80% 10%",
			muted: "204 80% 92%",
			"muted-foreground": "200 20% 45%",
			accent: "204 80% 92%",
			"accent-foreground": "200 80% 10%",
			destructive: "0 84.2% 60.2%",
			"destructive-foreground": "0 0% 98%",
			border: "204 60% 88%",
			input: "204 60% 88%",
			ring: "199 89% 48%",
		},
		dark: {
			background: "200 80% 6%",
			foreground: "204 100% 97%",
			card: "200 70% 8%",
			"card-foreground": "204 100% 97%",
			popover: "200 70% 8%",
			"popover-foreground": "204 100% 97%",
			primary: "199 89% 48%",
			"primary-foreground": "0 0% 100%",
			secondary: "200 50% 15%",
			"secondary-foreground": "204 100% 97%",
			muted: "200 50% 15%",
			"muted-foreground": "200 20% 60%",
			accent: "200 50% 15%",
			"accent-foreground": "204 100% 97%",
			destructive: "0 62.8% 30.6%",
			"destructive-foreground": "0 0% 98%",
			border: "200 50% 18%",
			input: "200 50% 18%",
			ring: "199 89% 48%",
		},
	},
	forest: {
		label: "Forest",
		swatches: ["#14532d", "#166534", "#22c55e", "#f0fdf4"],
		light: {
			background: "138 76% 97%",
			foreground: "140 80% 8%",
			card: "0 0% 100%",
			"card-foreground": "140 80% 8%",
			popover: "0 0% 100%",
			"popover-foreground": "140 80% 8%",
			primary: "142 71% 45%",
			"primary-foreground": "0 0% 100%",
			secondary: "138 60% 92%",
			"secondary-foreground": "140 80% 8%",
			muted: "138 60% 92%",
			"muted-foreground": "140 20% 45%",
			accent: "138 60% 92%",
			"accent-foreground": "140 80% 8%",
			destructive: "0 84.2% 60.2%",
			"destructive-foreground": "0 0% 98%",
			border: "138 40% 88%",
			input: "138 40% 88%",
			ring: "142 71% 45%",
		},
		dark: {
			background: "140 80% 5%",
			foreground: "138 76% 97%",
			card: "140 60% 7%",
			"card-foreground": "138 76% 97%",
			popover: "140 60% 7%",
			"popover-foreground": "138 76% 97%",
			primary: "142 71% 45%",
			"primary-foreground": "0 0% 100%",
			secondary: "140 40% 14%",
			"secondary-foreground": "138 76% 97%",
			muted: "140 40% 14%",
			"muted-foreground": "140 20% 60%",
			accent: "140 40% 14%",
			"accent-foreground": "138 76% 97%",
			destructive: "0 62.8% 30.6%",
			"destructive-foreground": "0 0% 98%",
			border: "140 40% 16%",
			input: "140 40% 16%",
			ring: "142 71% 45%",
		},
	},
};

export const STYLE_PRESETS = {
	lyra: { label: "Lyra" },
	vega: { label: "Vega" },
	mira: { label: "Mira" },
};

export const BASE_COLORS = {
	stone: { label: "Stone" },
	zinc: { label: "Zinc" },
	slate: { label: "Slate" },
	neutral: { label: "Neutral" },
	gray: { label: "Gray" },
};

export const ACCENT_COLORS = {
	orange: { label: "Orange", hue: 25 },
	blue: { label: "Blue", hue: 211 },
	green: { label: "Green", hue: 142 },
	purple: { label: "Purple", hue: 270 },
	red: { label: "Red", hue: 0 },
	teal: { label: "Teal", hue: 175 },
};

export const CHART_COLORS = {
	orange: { label: "Orange", colors: ["25 95% 53%", "45 93% 47%", "0 84% 60%", "142 71% 45%"] },
	blue: { label: "Blue", colors: ["211 100% 48%", "199 89% 48%", "0 84% 60%", "142 71% 45%"] },
	green: { label: "Green", colors: ["142 71% 45%", "45 93% 47%", "0 84% 60%", "211 100% 48%"] },
};

export const FONT_OPTIONS = {
	outfit: { label: "Outfit", value: "'Outfit', sans-serif" },
	inter: { label: "Inter", value: "'Inter', sans-serif" },
	geist: { label: "Geist", value: "'Geist', sans-serif" },
	system: { label: "System", value: "system-ui, sans-serif" },
};

export const FONT_SIZE_OPTIONS = {
	sm: { label: "Small", value: "14px" },
	default: { label: "Default", value: "16px" },
	lg: { label: "Large", value: "18px" },
};

export const LINE_HEIGHT_OPTIONS = {
	tight: { label: "Tight", value: "1.25" },
	normal: { label: "Normal", value: "1.5" },
	relaxed: { label: "Relaxed", value: "1.75" },
};

export const LETTER_SPACING_OPTIONS = {
	tight: { label: "Tight", value: "-0.025em" },
	normal: { label: "Normal", value: "0em" },
	wide: { label: "Wide", value: "0.05em" },
};

export const UI_DENSITY_OPTIONS = {
	compact: { label: "Compact", scale: "0.875" },
	default: { label: "Default", scale: "1" },
	comfortable: { label: "Comfortable", scale: "1.125" },
};

export const SPACING_SCALE_OPTIONS = {
	tight: { label: "Tight", value: "0.875" },
	default: { label: "Default", value: "1" },
	loose: { label: "Loose", value: "1.25" },
};

export const CORNER_RADIUS_OPTIONS = {
	none: { label: "None", value: "0rem" },
	sm: { label: "Small", value: "0.375rem" },
	default: { label: "Default", value: "0.5rem" },
	lg: { label: "Large", value: "0.75rem" },
	xl: { label: "Extra Large", value: "1rem" },
	full: { label: "Full", value: "9999px" },
};

export const BORDER_STYLE_OPTIONS = {
	solid: { label: "Solid", value: "solid" },
	dashed: { label: "Dashed", value: "dashed" },
	dotted: { label: "Dotted", value: "dotted" },
};

export const BORDER_WIDTH_OPTIONS = {
	none: { label: "None", value: "0px" },
	thin: { label: "Thin", value: "1px" },
	default: { label: "Default", value: "1px" },
	thick: { label: "Thick", value: "2px" },
};

export const SHADOW_OPTIONS = {
	none: { label: "None", value: "none" },
	sm: { label: "Small", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
	default: { label: "Default", value: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" },
	md: { label: "Medium", value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
	lg: { label: "Large", value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
};

export const BACKDROP_BLUR_OPTIONS = {
	none: { label: "None", value: "0px" },
	sm: { label: "Small", value: "4px" },
	default: { label: "Default", value: "8px" },
	lg: { label: "Large", value: "16px" },
	xl: { label: "Extra Large", value: "24px" },
};

export const FOCUS_RING_OPTIONS = {
	none: { label: "None", value: "0px" },
	thin: { label: "Thin", value: "1px" },
	default: { label: "Default", value: "2px" },
	thick: { label: "Thick", value: "3px" },
};

export const DEFAULT_THEME_CONFIG = {
	theme: "default",
	stylePreset: "lyra",
	baseColor: "zinc",
	accent: "blue",
	chartColor: "blue",
	headingFont: "inter",
	bodyFont: "inter",
	fontSize: "default",
	lineHeight: "normal",
	letterSpacing: "normal",
	uiDensity: "default",
	spacingScale: "default",
	cornerRadius: "lg",
	borderStyle: "solid",
	borderWidth: "thin",
	shadow: "sm",
	backdropBlur: "none",
	focusRingWidth: "default",
};
