#!/usr/bin/env bash
# bundle the affiliate VSL (under the shared lock) and render one still per line -> build/aff-board + contact sheets
set -euo pipefail
cd "$(dirname "$0")/.."
( flock 9; cp home/aff/timeline.json home/aff/cues.json home/cur/; cp home/aff/mix.wav home/public/mix.wav; rm -rf build/aff-sb && npx remotion bundle src/aff/index.ts --public-dir home/public --out-dir build/aff-sb --log=error >/dev/null ) 9>/tmp/home-bundle.lock
node aff/stills.mjs "${1:-build/aff-board}" "${2:-}"
