/**
 * Buyer-facing directory config.
 * Lock your niche here (or via NEXT_PUBLIC_DIRECTORY_PRESET in .env.local).
 *
 * Options:
 *   "ai-tools"          → ToolDir (default)
 *   "prompt-library"    → PromptDir
 *   "design-resources"  → DesignDir
 *   "ui-inspiration"    → InspireDir
 *   "resources"         → ResourceDir
 *
 * The navbar niche dropdown is DEMO-ONLY and only appears when
 * NEXT_PUBLIC_PRESET_SWITCHER=true (not for client zips).
 */
export const DIRECTORY_CONFIG = {
	/** Active niche when the demo switcher is off */
	preset: "ai-tools",
};
