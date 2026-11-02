#!/usr/bin/env bash
# Render niches listed in build/queue.txt one after another; waits for more until a line "END".
cd "$(dirname "$0")/.."
touch build/queue.txt build/done.txt
while true; do
  next=$(grep -vxF -f build/done.txt build/queue.txt | head -1)
  if [ -z "$next" ]; then sleep 30; continue; fi
  [ "$next" = END ] && { echo "QUEUE END $(date -u +%H:%M)"; exit 0; }
  echo "=== $next start $(date -u +%H:%M)"
  if bash scripts/render_niche.sh $next 750; then echo $next >> build/done.txt; else echo "=== $next FAILED"; echo $next >> build/done.txt; echo $next >> build/failed.txt; fi
done
