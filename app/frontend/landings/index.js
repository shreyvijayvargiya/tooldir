import LandingAiTools from "./LandingAiTools";
import LandingPromptDir from "./LandingPromptDir";
import LandingDesignDir from "./LandingDesignDir";
import LandingInspireDir from "./LandingInspireDir";
import LandingResourceDir from "./LandingResourceDir";
import LandingIconsDir from "./LandingIconsDir";
import LandingComponentsDir from "./LandingComponentsDir";
import LandingCatalogDir from "./LandingCatalogDir";
import { EXTRA_NICHE_PRESETS } from "@/lib/presets/extra-niches";

/**
 * Map preset.landingTemplate (or preset.id) → home landing component.
 * Extra niches share LandingCatalogDir with unique heroVariant.
 */
export const LANDING_MAP = {
	"ai-tools": LandingAiTools,
	"prompt-library": LandingPromptDir,
	"design-resources": LandingDesignDir,
	"ui-inspiration": LandingInspireDir,
	resources: LandingResourceDir,
	"icons-library": LandingIconsDir,
	"components-library": LandingComponentsDir,
	...Object.fromEntries(
		EXTRA_NICHE_PRESETS.map((p) => [p.id, LandingCatalogDir])
	),
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
	LandingCatalogDir,
};
