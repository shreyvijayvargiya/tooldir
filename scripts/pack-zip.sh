#!/usr/bin/env bash
# Pack ToolDir as a clean buyer zip (no secrets, deps, or build artifacts).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
OUT="${1:-$DIST/tooldir.zip}"

mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"

cd "$ROOT"

echo "Creating $OUT …"

# Include source + lockfile + .env.example + SQL migrations.
# Never ship real env files, deps, git, IDE, or build output.
zip -r "$OUT" . \
  -x "node_modules/*" \
  -x "node_modules/**" \
  -x ".next/*" \
  -x ".next/**" \
  -x ".git/*" \
  -x ".git/**" \
  -x ".cursor/*" \
  -x ".cursor/**" \
  -x ".vercel/*" \
  -x ".vercel/**" \
  -x ".swc/*" \
  -x ".swc/**" \
  -x "dist/*" \
  -x "dist/**" \
  -x "coverage/*" \
  -x ".turbo/*" \
  -x "*.zip" \
  -x "*.DS_Store" \
  -x "*/*.DS_Store" \
  -x "yarn.lock" \
  -x "yarn-error.log" \
  -x ".env" \
  -x ".env.*" \
  -x "**/.env" \
  -x "**/.env.*" \
  -x "!.env.example" \
  > /dev/null

# Strip any accidental real env files from the archive (ignore if absent).
ENV_HITS="$(unzip -Z1 "$OUT" 2>/dev/null | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$' || true)"
if [[ -n "$ENV_HITS" ]]; then
  echo "$ENV_HITS" | while IFS= read -r path; do
    [[ -n "$path" ]] && zip -d "$OUT" "$path" > /dev/null || true
  done
fi

if [[ -f "$ROOT/.env.example" ]]; then
  zip -u "$OUT" ".env.example" > /dev/null || true
fi

# --- Safety checks ---
fail=0

if unzip -l "$OUT" | grep -E '(^|[[:space:]])(\.env|\.env\.(local|development|production|test)(\.local)?)($|[[:space:]])' >/dev/null 2>&1; then
  # Allow only .env.example
  bad="$(unzip -l "$OUT" | awk '{print $4}' | grep -E '(^|/)\.env' | grep -v '\.env\.example$' || true)"
  if [[ -n "$bad" ]]; then
    echo "ERROR: secret env file(s) found in zip:"
    echo "$bad"
    fail=1
  fi
fi

REQUIRED=(
  ".env.example"
  "package.json"
  "package-lock.json"
  "next.config.js"
  "tailwind.config.js"
  "styles/globals.css"
  "pages/_app.js"
  "pages/index.js"
  "pages/admin/index.js"
  "pages/api/stripe/checkout.js"
  "pages/api/stripe/webhook.js"
  "pages/api/storage/upload-image.js"
  "lib/api/storage.js"
  "lib/config/supabase.js"
  "lib/hooks/use-mobile.jsx"
  "components/ui/sidebar.jsx"
  "components/ui/tooltip.jsx"
  "components/ui/sheet.jsx"
  "components/ui/skeleton.jsx"
  "app/admin/index.jsx"
  "app/admin/components/HomeTab.jsx"
  "app/admin/components/Sidebar.jsx"
  "app/admin/components/BlogTiptapEditor.jsx"
  "supabase-migrations.sql"
  "scripts/pack-zip.sh"
  "LLM.txt"
)

# README may be README.md or readme.md (case-insensitive FS)
if ! unzip -l "$OUT" | awk '{print $4}' | grep -qiE '(^|/)readme\.md$'; then
  echo "ERROR: missing README.md"
  fail=1
fi

for f in "${REQUIRED[@]}"; do
  if ! unzip -l "$OUT" | awk '{print $4}' | grep -qx "$f"; then
    echo "ERROR: missing required file: $f"
    fail=1
  fi
done

# Must not include cancelled subscription API or node_modules
if unzip -l "$OUT" | grep -q 'cancel-subscription'; then
  echo "ERROR: cancel-subscription should not be in buyer zip"
  fail=1
fi
if unzip -l "$OUT" | grep -q 'node_modules/'; then
  echo "ERROR: node_modules leaked into zip"
  fail=1
fi

SIZE="$(du -h "$OUT" | awk '{print $1}')"
COUNT="$(unzip -l "$OUT" | tail -1 | awk '{print $2}')"

if [[ "$fail" -ne 0 ]]; then
  echo "Pack failed verification. Removing $OUT"
  rm -f "$OUT"
  exit 1
fi

echo "Done: $OUT ($SIZE, $COUNT files)"
echo "Included: source, package-lock, .env.example, SQL migrations, shadcn sidebar"
echo "Excluded: .env*, node_modules, .next, .git, .cursor, .vercel, dist, *.zip"
