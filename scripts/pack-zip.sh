#!/usr/bin/env bash
# Pack a single niche buyer zip (one landing + one preset, no demo switcher).
#
# Usage:
#   bash scripts/pack-zip.sh                 # default: ai-tools → dist/tooldir.zip
#   bash scripts/pack-zip.sh ai-tools
#   bash scripts/pack-zip.sh prompt-library
#   bash scripts/pack-zip.sh design-resources
#   bash scripts/pack-zip.sh ui-inspiration
#   bash scripts/pack-zip.sh resources
#   bash scripts/pack-zip.sh all             # all five buyer niche zips
#
# Aliases: tooldir | promptdir | designdir | inspiredir | resourcedir
#
# Demo-only (NOT packed into buyer zips):
#   - Product marketing home (ProductHome.jsx)
#   - /demo template gallery page
#   - IconDir / CompDir niches + their catalog UIs
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
ARG="${1:-ai-tools}"

resolve_preset() {
	case "$1" in
		ai-tools|tooldir|ToolDir) echo "ai-tools" ;;
		prompt-library|promptdir|PromptDir) echo "prompt-library" ;;
		design-resources|designdir|DesignDir) echo "design-resources" ;;
		ui-inspiration|inspiredir|InspireDir) echo "ui-inspiration" ;;
		resources|resourcedir|ResourceDir) echo "resources" ;;
		icons-library|icondir|IconDir|components-library|compdir|CompDir)
			echo "ERROR: $1 is demo-only and is not sold as a buyer zip." >&2
			echo "Buyer niches: ai-tools | prompt-library | design-resources | ui-inspiration | resources | all" >&2
			exit 1
			;;
		all) echo "all" ;;
		*)
			echo "Unknown preset: $1" >&2
			echo "Use: ai-tools | prompt-library | design-resources | ui-inspiration | resources | all" >&2
			exit 1
			;;
	esac
}

preset_meta() {
	# sets: BRAND ZIP_NAME LANDING_FILE PRESET_FILE IMPORT_NAME
	case "$1" in
		ai-tools)
			BRAND="ToolDir"
			ZIP_NAME="tooldir.zip"
			LANDING_FILE="LandingAiTools.jsx"
			PRESET_FILE="ai-tools.js"
			IMPORT_NAME="aiToolsPreset"
			;;
		prompt-library)
			BRAND="PromptDir"
			ZIP_NAME="promptdir.zip"
			LANDING_FILE="LandingPromptDir.jsx"
			PRESET_FILE="prompt-library.js"
			IMPORT_NAME="promptLibraryPreset"
			;;
		design-resources)
			BRAND="DesignDir"
			ZIP_NAME="designdir.zip"
			LANDING_FILE="LandingDesignDir.jsx"
			PRESET_FILE="design-resources.js"
			IMPORT_NAME="designResourcesPreset"
			;;
		ui-inspiration)
			BRAND="InspireDir"
			ZIP_NAME="inspiredir.zip"
			LANDING_FILE="LandingInspireDir.jsx"
			PRESET_FILE="ui-inspiration.js"
			IMPORT_NAME="uiInspirationPreset"
			;;
		resources)
			BRAND="ResourceDir"
			ZIP_NAME="resourcedir.zip"
			LANDING_FILE="LandingResourceDir.jsx"
			PRESET_FILE="resources.js"
			IMPORT_NAME="resourcesPreset"
			;;
	esac
}

pack_one() {
	local PRESET="$1"
	preset_meta "$PRESET"
	local OUT="$DIST/$ZIP_NAME"
	local STAGE
	STAGE="$(mktemp -d "${TMPDIR:-/tmp}/tooldir-pack.XXXXXX")"

	echo ""
	echo "════════════════════════════════════════"
	echo " Packing $BRAND ($PRESET) → $OUT"
	echo "════════════════════════════════════════"

	mkdir -p "$DIST"
	rm -f "$OUT"

	# Copy project into staging (no secrets / deps / git / build)
	rsync -a \
		--exclude 'node_modules' \
		--exclude '.next' \
		--exclude '.git' \
		--exclude '.cursor' \
		--exclude '.vercel' \
		--exclude '.swc' \
		--exclude 'dist' \
		--exclude 'coverage' \
		--exclude '.turbo' \
		--exclude '*.zip' \
		--exclude '.DS_Store' \
		--exclude 'yarn.lock' \
		--exclude 'yarn-error.log' \
		--exclude '.env' \
		--exclude '.env.local' \
		--exclude '.env.*.local' \
		--exclude '.env.development' \
		--exclude '.env.production' \
		--exclude '.env.test' \
		"$ROOT/" "$STAGE/"

	# Always keep .env.example
	if [[ -f "$ROOT/.env.example" ]]; then
		cp "$ROOT/.env.example" "$STAGE/.env.example"
	fi

	# --- Niche lock: only one landing + one preset ---
	local LANDINGS="$STAGE/app/frontend/landings"
	local PRESETS_DIR="$STAGE/lib/presets"
	local MARKETING="$STAGE/app/frontend/marketing"

	# Remove other landing components (keep shared.js + chosen landing)
	find "$LANDINGS" -maxdepth 1 -type f -name 'Landing*.jsx' ! -name "$LANDING_FILE" -delete

	# Slim landings/index.js
	cat > "$LANDINGS/index.js" <<EOF
import Landing from "./${LANDING_FILE%.jsx}";

/** Single-niche buyer pack — ${BRAND} */
export const LANDING_MAP = {
	"${PRESET}": Landing,
};

export function getLandingComponent(preset) {
	return LANDING_MAP[preset?.landingTemplate || preset?.id] || Landing;
}

export default Landing;
EOF

	# Remove other preset data files (keep shared.js, PresetContext, chosen preset)
	find "$PRESETS_DIR" -maxdepth 1 -type f \( -name '*.js' -o -name '*.jsx' \) \
		! -name "$PRESET_FILE" \
		! -name 'shared.js' \
		! -name 'PresetContext.jsx' \
		! -name 'index.js' \
		-delete

	# Slim lib/presets/index.js
	cat > "$PRESETS_DIR/index.js" <<EOF
import { ${IMPORT_NAME} } from "./${PRESET_FILE%.js}";

/** Single-niche buyer pack — ${BRAND} */
export const PRESETS = {
	"${PRESET}": ${IMPORT_NAME},
};

export const PRESET_LIST = [${IMPORT_NAME}];

export const DEFAULT_PRESET_ID = "${PRESET}";

export const getPreset = (id) => PRESETS[id] || PRESETS[DEFAULT_PRESET_ID];

export const getConfiguredPresetId = () => {
	const fromEnv = process.env.NEXT_PUBLIC_DIRECTORY_PRESET;
	if (fromEnv && PRESETS[fromEnv]) return fromEnv;
	try {
		const { DIRECTORY_CONFIG } = require("../../directory.config");
		if (DIRECTORY_CONFIG?.preset && PRESETS[DIRECTORY_CONFIG.preset]) {
			return DIRECTORY_CONFIG.preset;
		}
	} catch {
		/* ignore */
	}
	return DEFAULT_PRESET_ID;
};

/** Demo switcher is never enabled in buyer zips */
export const isPresetSwitcherEnabled = () => false;

export { ${IMPORT_NAME} };
EOF

	# Lock directory.config.js
	cat > "$STAGE/directory.config.js" <<EOF
/**
 * ${BRAND} buyer pack — niche is locked.
 * Do not enable NEXT_PUBLIC_PRESET_SWITCHER (demo-only).
 */
export const DIRECTORY_CONFIG = {
	preset: "${PRESET}",
};
EOF

	# --- Strip demo-only product / IconDir / CompDir / generator surfaces ---
	rm -rf "$STAGE/components/demo"
	rm -f "$STAGE/pages/demo.js"
	rm -f "$STAGE/pages/generate.js"
	rm -f "$MARKETING/ProductHome.jsx"
	rm -f "$MARKETING/IconsDirectoryGrid.jsx"
	rm -f "$MARKETING/ComponentsLibraryExplorer.jsx"
	rm -rf "$MARKETING/component-library"
	rm -rf "$MARKETING/generator"
	rm -rf "$STAGE/lib/generator"
	rm -rf "$STAGE/pages/api/generator"
	rm -f "$STAGE/lib/data/icons-catalog.js"
	rm -f "$STAGE/lib/data/components-catalog.js"
	rm -f "$PRESETS_DIR/icons-library.js"
	rm -f "$PRESETS_DIR/components-library.js"
	rm -f "$LANDINGS/LandingIconsDir.jsx"
	rm -f "$LANDINGS/LandingComponentsDir.jsx"

	# Buyer home is always the locked niche landing (no ProductHome / demo gate)
	cat > "$STAGE/pages/index.js" <<EOF
import React from "react";
import Head from "next/head";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { usePreset } from "@/lib/presets/PresetContext";
import { getLandingComponent } from "../app/frontend/landings";

/** ${BRAND} home — single niche landing (buyer pack) */
const HomePage = () => {
	const { preset } = usePreset();
	const Landing = getLandingComponent(preset);

	return (
		<>
			<Head>
				<title>{preset.seoTitle}</title>
				<meta name="description" content={preset.seoDescription} />
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1">
					<Landing key={preset.id} />
				</main>
				<Footer />
			</div>
		</>
	);
};

export default HomePage;
EOF

	# Ensure _app.js does not reference NicheBookmarkBar
	if [[ -f "$STAGE/pages/_app.js" ]]; then
		perl -i -0pe 's/\nimport \{ isPresetSwitcherEnabled \} from "@\/lib\/presets";\n//g' "$STAGE/pages/_app.js" || true
		perl -i -0pe 's/\nconst NicheBookmarkBar = isPresetSwitcherEnabled\(\)\n\t\? dynamic\(\(\) => import\("@\/components\/demo\/NicheBookmarkBar"\), \{ ssr: false \}\)\n\t: null;\n//g' "$STAGE/pages/_app.js" || true
		perl -i -pe 's/\s*\{NicheBookmarkBar \? <NicheBookmarkBar \/> : null\}\n?//g' "$STAGE/pages/_app.js" || true
		# Drop unused dynamic import if NicheBookmarkBar was the only consumer
		if ! grep -q 'dynamic(' "$STAGE/pages/_app.js"; then
			perl -i -pe 's/^import dynamic from "next\/dynamic";\n//' "$STAGE/pages/_app.js" || true
		fi
	fi

	# Buyer .env.example: lock niche, no demo switcher
	if [[ -f "$STAGE/.env.example" ]]; then
		# Drop old preset comments / switcher lines, append locked niche
		grep -v 'NEXT_PUBLIC_DIRECTORY_PRESET' "$STAGE/.env.example" \
			| grep -v 'NEXT_PUBLIC_PRESET_SWITCHER' \
			| grep -v 'Directory niche' \
			| grep -v 'directory.config.js' \
			| grep -v 'DEMO ONLY' \
			| grep -v 'Options: ai-tools' \
			> "$STAGE/.env.example.tmp" || true
		mv "$STAGE/.env.example.tmp" "$STAGE/.env.example"
		cat >> "$STAGE/.env.example" <<EOF

# ${BRAND} niche (locked in this buyer zip)
NEXT_PUBLIC_DIRECTORY_PRESET=${PRESET}
# Demo niche switcher is NOT included — leave unset
# NEXT_PUBLIC_PRESET_SWITCHER=
EOF
	fi

	# Zip staging tree
	(
		cd "$STAGE"
		zip -r "$OUT" . \
			-x "*.DS_Store" \
			-x "*/*.DS_Store" \
			> /dev/null
	)

	# --- Safety checks ---
	local fail=0

	if unzip -l "$OUT" | awk '{print $4}' | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$' >/dev/null 2>&1; then
		echo "ERROR: secret env file(s) found in zip"
		fail=1
	fi

	if unzip -l "$OUT" | grep -q 'components/demo/'; then
		echo "ERROR: demo niche switcher leaked into buyer zip"
		fail=1
	fi

	# Demo-only product / IconDir / CompDir must not ship
	local FORBIDDEN=(
		'pages/demo.js'
		'pages/generate.js'
		'ProductHome.jsx'
		'IconsDirectoryGrid.jsx'
		'ComponentsLibraryExplorer.jsx'
		'component-library/'
		'marketing/generator/'
		'lib/generator/'
		'pages/api/generator/'
		'icons-catalog.js'
		'components-catalog.js'
		'icons-library.js'
		'components-library.js'
		'LandingIconsDir.jsx'
		'LandingComponentsDir.jsx'
	)
	for pattern in "${FORBIDDEN[@]}"; do
		if unzip -l "$OUT" | grep -q "$pattern"; then
			echo "ERROR: demo-only file leaked into buyer zip: $pattern"
			fail=1
		fi
	done

	if unzip -l "$OUT" | grep -q 'cancel-subscription'; then
		echo "ERROR: cancel-subscription should not be in buyer zip"
		fail=1
	fi

	if unzip -l "$OUT" | grep -q 'node_modules/'; then
		echo "ERROR: node_modules leaked into zip"
		fail=1
	fi

	# Must include chosen landing; must NOT include other Landing*.jsx
	if ! unzip -l "$OUT" | awk '{print $4}' | grep -q "app/frontend/landings/$LANDING_FILE"; then
		echo "ERROR: missing landing $LANDING_FILE"
		fail=1
	fi
	local OTHER_LANDINGS
	OTHER_LANDINGS="$(unzip -l "$OUT" | awk '{print $4}' | grep 'app/frontend/landings/Landing' | grep -v "$LANDING_FILE" || true)"
	if [[ -n "$OTHER_LANDINGS" ]]; then
		echo "ERROR: other landing pages found in zip:"
		echo "$OTHER_LANDINGS"
		fail=1
	fi

	# Buyer index must not import ProductHome
	if unzip -p "$OUT" pages/index.js 2>/dev/null | grep -q 'ProductHome'; then
		echo "ERROR: pages/index.js still references ProductHome"
		fail=1
	fi

	local REQUIRED=(
		".env.example"
		"package.json"
		"package-lock.json"
		"next.config.js"
		"directory.config.js"
		"pages/_app.js"
		"pages/index.js"
		"supabase-migrations.sql"
		"lib/presets/$PRESET_FILE"
		"app/frontend/landings/$LANDING_FILE"
	)

	for f in "${REQUIRED[@]}"; do
		if ! unzip -l "$OUT" | awk '{print $4}' | grep -qx "$f"; then
			echo "ERROR: missing required file: $f"
			fail=1
		fi
	done

	if ! unzip -l "$OUT" | awk '{print $4}' | grep -qiE '(^|/)readme\.md$'; then
		echo "ERROR: missing README.md"
		fail=1
	fi

	local SIZE COUNT
	SIZE="$(du -h "$OUT" | awk '{print $1}')"
	COUNT="$(unzip -l "$OUT" | tail -1 | awk '{print $2}')"

	rm -rf "$STAGE"

	if [[ "$fail" -ne 0 ]]; then
		echo "Pack failed verification. Removing $OUT"
		rm -f "$OUT"
		exit 1
	fi

	echo "Done: $OUT ($SIZE, $COUNT files) — $BRAND only"
	echo "  Landing: $LANDING_FILE"
	echo "  Preset:  $PRESET_FILE"
	echo "  Excluded: ProductHome, /demo, /generate, IconDir, CompDir, demo dock"
}

PRESET="$(resolve_preset "$ARG")"

if [[ "$PRESET" == "all" ]]; then
	for p in ai-tools prompt-library design-resources ui-inspiration resources; do
		pack_one "$p"
	done
	echo ""
	echo "All niche zips ready in $DIST/"
	ls -lh "$DIST"/*.zip 2>/dev/null || true
else
	pack_one "$PRESET"
fi
