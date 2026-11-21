#!/usr/bin/env bash
# Builds the marketing site on its own as static files in ./out, for GitHub Pages.
# The app routes (dashboard, builder, public forms, API) need a server and the
# database, so they are set aside for the build and put back afterwards.
#
#   BASE_PATH=/formloom scripts/build-static.sh
set -euo pipefail
cd "$(dirname "$0")/.."

STASH=".static-stash"
SERVER_ONLY=(src/app/api src/app/forms src/app/f src/app/preview src/app/account src/app/login src/app/signup src/proxy.ts)

restore() {
  for p in "${SERVER_ONLY[@]}"; do
    if [ -e "$STASH/$p" ]; then mkdir -p "$(dirname "$p")" && mv "$STASH/$p" "$p"; fi
  done
  rm -rf "$STASH"
}
trap restore EXIT

for p in "${SERVER_ONLY[@]}"; do
  if [ -e "$p" ]; then mkdir -p "$STASH/$(dirname "$p")" && mv "$p" "$STASH/$p"; fi
done

rm -rf out
STATIC_EXPORT=1 BASE_PATH="${BASE_PATH:-}" npx next build
touch out/.nojekyll
echo "Static site written to ./out"
