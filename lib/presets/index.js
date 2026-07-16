import { aiToolsPreset } from "./ai-tools";
import { promptLibraryPreset } from "./prompt-library";
import { designResourcesPreset } from "./design-resources";
import { uiInspirationPreset } from "./ui-inspiration";
import { resourcesPreset } from "./resources";
import { iconsLibraryPreset } from "./icons-library";
import { componentsLibraryPreset } from "./components-library";
import { EXTRA_NICHE_PRESETS } from "./extra-niches";

/** Core niches (original 7) */
export const CORE_PRESETS = [
	aiToolsPreset,
	promptLibraryPreset,
	designResourcesPreset,
	uiInspirationPreset,
	resourcesPreset,
	iconsLibraryPreset,
	componentsLibraryPreset,
];

/** All niche presets shipped with the demo */
export const PRESET_LIST = [...CORE_PRESETS, ...EXTRA_NICHE_PRESETS];

export const PRESETS = Object.fromEntries(PRESET_LIST.map((p) => [p.id, p]));

/** Niches sold as buyer zips (excludes IconDir / CompDir demo packs) */
export const PACKABLE_PRESET_IDS = PRESET_LIST.filter(
	(p) => p.packable !== false && !["icons-library", "components-library"].includes(p.id)
).map((p) => p.id);

export const DEFAULT_PRESET_ID = "ai-tools";

export const getPreset = (id) => PRESETS[id] || PRESETS[DEFAULT_PRESET_ID];

/**
 * Locked preset for production / buyer installs.
 * Priority: NEXT_PUBLIC_DIRECTORY_PRESET → directory.config.js → ai-tools
 * Demo switcher (when enabled) can override this in the browser only.
 */
export const getConfiguredPresetId = () => {
	const fromEnv = process.env.NEXT_PUBLIC_DIRECTORY_PRESET;
	if (fromEnv && PRESETS[fromEnv]) return fromEnv;
	try {
		// eslint-disable-next-line global-require
		const { DIRECTORY_CONFIG } = require("../../directory.config");
		if (DIRECTORY_CONFIG?.preset && PRESETS[DIRECTORY_CONFIG.preset]) {
			return DIRECTORY_CONFIG.preset;
		}
	} catch {
		/* ignore */
	}
	return DEFAULT_PRESET_ID;
};

/** Demo-only: show niche dropdown in navbar when true */
export const isPresetSwitcherEnabled = () =>
	process.env.NEXT_PUBLIC_PRESET_SWITCHER === "true";

export {
	aiToolsPreset,
	promptLibraryPreset,
	designResourcesPreset,
	uiInspirationPreset,
	resourcesPreset,
	iconsLibraryPreset,
	componentsLibraryPreset,
	EXTRA_NICHE_PRESETS,
};
