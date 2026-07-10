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

zip -r "$OUT" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x ".cursor/*" \
  -x ".vercel/*" \
  -x ".swc/*" \
  -x ".env" \
  -x ".env.local" \
  -x ".env.*.local" \
  -x ".env.development*" \
  -x ".env.production*" \
  -x "*.DS_Store" \
  -x "yarn.lock" \
  -x "yarn-error.log" \
  -x "*.zip" \
  -x "dist/*" \
  > /dev/null

SIZE="$(du -h "$OUT" | awk '{print $1}')"
echo "Done: $OUT ($SIZE)"
echo "Excluded: node_modules, .next, .git, .env*, Cursor/Vercel caches, dist/, *.zip"
