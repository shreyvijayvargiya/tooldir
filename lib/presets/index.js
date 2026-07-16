import { aiToolsPreset } from "./ai-tools";
import { promptLibraryPreset } from "./prompt-library";
import { designResourcesPreset } from "./design-resources";
import { uiInspirationPreset } from "./ui-inspiration";
import { resourcesPreset } from "./resources";
import { iconsLibraryPreset } from "./icons-library";
import { componentsLibraryPreset } from "./components-library";

/** All niche presets shipped with the template */
export const PRESETS = {
	"ai-tools": aiToolsPreset,
	"prompt-library": promptLibraryPreset,
	"design-resources": designResourcesPreset,
	"ui-inspiration": uiInspirationPreset,
	resources: resourcesPreset,
	"icons-library": iconsLibraryPreset,
	"components-library": componentsLibraryPreset,
};

export const PRESET_LIST = [
	aiToolsPreset,
	promptLibraryPreset,
	designResourcesPreset,
	uiInspirationPreset,
	resourcesPreset,
	iconsLibraryPreset,
	componentsLibraryPreset,
];

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
};
