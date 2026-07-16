/**
 * Buyer-facing directory config.
 * Lock your niche here (or via NEXT_PUBLIC_DIRECTORY_PRESET in .env.local).
 *
 * Core:
 *   "ai-tools" | "prompt-library" | "design-resources" | "ui-inspiration" | "resources"
 * Libraries (demo packs often excluded from zip):
 *   "icons-library" | "components-library"
 * Catalog niches:
 *   "coupons-deals" | "notion-templates" | "job-board" | "newsletter-directory"
 *   "course-directory" | "podcast-directory" | "chrome-extensions" | "no-code-tools"
 *   "communities" | "ebook-directory" | "affiliate-offers" | "indie-products"
 *
 * The navbar niche dropdown is DEMO-ONLY and only appears when
 * NEXT_PUBLIC_PRESET_SWITCHER=true (not for client zips).
 */
export const DIRECTORY_CONFIG = {
	/** Active niche when the demo switcher is off */
	preset: "ai-tools",
};
