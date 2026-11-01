#!/usr/bin/env bash
# Render a composition in N chunks (fresh browser each), then join and attach the mix.
# Usage: scripts/render_chunks.sh <comp> <total frames> <mix wav> <out mp4> [chunks]
set -euo pipefail
COMP=$1; TOTAL=$2; MIX=$3; OUT=$4; N=${5:-6}
cd "$(dirname "$0")/.."
mkdir -p out/chunks; rm -f out/chunks/*.mp4 out/chunks/list.txt
STEP=$(( (TOTAL + N - 1) / N ))
for ((i=0; i<N; i++)); do
  A=$(( i * STEP )); B=$(( (i + 1) * STEP - 1 )); (( B >= TOTAL )) && B=$(( TOTAL - 1 ))
  F=out/chunks/c$i.mp4
  for try in 1 2; do
    if npx remotion render src/index.ts "$COMP" "$F" --frames=$A-$B --muted --timeout=120000 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium > out/chunks/c$i.log 2>&1; then break; fi
    echo "chunk $i failed (try $try)"; [ $try = 2 ] && exit 1
  done
  echo "chunk $i done ($A-$B)"; echo "file 'c$i.mp4'" >> out/chunks/list.txt
done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -i "$MIX" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo "joined $OUT"
