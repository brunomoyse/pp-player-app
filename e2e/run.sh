#!/usr/bin/env bash
#
# e2e/run.sh — reseed the harness, then run the player-app flows.
#
# The flows mutate real state (they register for tournaments), and several
# assert on a specific fixture — so a run that fails part-way leaves the account
# registered and the next run trips on it. Always reseed first; that is what
# this wrapper is for.
#
# Usage:
#   ./e2e/run.sh                          # whole suite
#   ./e2e/run.sh registration-flow.yaml   # one flow
#
# Requires the stack from the monorepo root:
#   REBUILD=1 NO_WEB=1 ./e2e-harness.sh up
# and the app installed on a booted simulator:
#   npx expo run:ios
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(cd "$APP_DIR/.." && pwd)"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"

if ! curl -fsS http://localhost:8080/health >/dev/null 2>&1; then
  echo "✗ Backend not reachable on :8080. Start it with:" >&2
  echo "    REBUILD=1 NO_WEB=1 ./e2e-harness.sh up" >&2
  exit 1
fi

echo "→ Reseeding fixtures ..."
"$ROOT/e2e-harness.sh" seed >/dev/null

TARGET="${1:-}"
if [[ -n "$TARGET" ]]; then
  exec "$MAESTRO" test "$APP_DIR/e2e/$TARGET"
fi
exec "$MAESTRO" test "$APP_DIR/e2e/"
