import LandingAiTools from "./LandingAiTools";
import LandingPromptDir from "./LandingPromptDir";
import LandingDesignDir from "./LandingDesignDir";
import LandingInspireDir from "./LandingInspireDir";
import LandingResourceDir from "./LandingResourceDir";
import LandingIconsDir from "./LandingIconsDir";
import LandingComponentsDir from "./LandingComponentsDir";

/**
 * Map preset.landingTemplate (or preset.id) → home landing component.
 * Add a new file under landings/ and register it here.
 */
export const LANDING_MAP = {
	"ai-tools": LandingAiTools,
	"prompt-library": LandingPromptDir,
	"design-resources": LandingDesignDir,
	"ui-inspiration": LandingInspireDir,
	resources: LandingResourceDir,
	"icons-library": LandingIconsDir,
	"components-library": LandingComponentsDir,
};

export function getLandingComponent(preset) {
	const key = preset?.landingTemplate || preset?.id || "ai-tools";
	return LANDING_MAP[key] || LandingAiTools;
}

export {
	LandingAiTools,
	LandingPromptDir,
	LandingDesignDir,
	LandingInspireDir,
	LandingResourceDir,
	LandingIconsDir,
	LandingComponentsDir,
};
