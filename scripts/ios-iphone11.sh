#!/usr/bin/env bash
# Rebuild the player app in Release and install it on the physical iPhone 11.
#
# Release config loads .env -> the TEST server (pocketpair.be), so this is a
# real "preview" build that runs standalone (JS bundled in, no Metro needed).
#
# Usage:
#   npm run ios:iphone11           # build + install
#   npm run ios:iphone11 -- --clean  # regenerate ios/ first (fixes stale native paths)
#
# The --clean pass runs `expo prebuild --clean`, which is safe because ios/ is
# CNG (gitignored). Use it if a build fails on stale paths (e.g. a leftover
# absolute path from a previous project name) or after changing native config.
set -euo pipefail

# iPhone 11 (UDID). Override with IPHONE_UDID=... if it ever changes.
DEVICE_UDID="${IPHONE_UDID:-00008030-00066D362213802E}"

cd "$(dirname "$0")/.."

CLEAN=0
for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN=1 ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [[ "$CLEAN" == "1" ]]; then
  echo "==> Regenerating ios/ (expo prebuild --clean)…"
  CI=1 npx expo prebuild --clean --platform ios
fi

echo "==> Building Release + installing on iPhone 11 ($DEVICE_UDID)…"
npx expo run:ios --device "$DEVICE_UDID" --configuration Release
