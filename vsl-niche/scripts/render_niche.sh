#!/usr/bin/env bash
# Render one niche VSL end to end (assets + audio must exist): bundle, chunked render, clean encode + loudness pass.
# Usage: scripts/render_niche.sh <slug> [chunk frames] [from-frame to-frame (preview)]
set -euo pipefail
SLUG=$1; STEP=${2:-1500}
cd "$(dirname "$0")/.."
ROOT=$PWD
exec 9>/tmp/vsl-bundle.lock; flock 9
cat > src/gen/cur.ts <<EOF
import SPEC from "../../script/n/$SLUG.json";
import TL from "../../build/$SLUG/timeline.json";
import CUES from "../../build/$SLUG/cues.json";
import SYNC from "../../build/$SLUG/sync.json";
import META from "../../assets/$SLUG/meta.json";
export { CUES, META, SPEC, SYNC, TL };
EOF
rm -rf assets/$SLUG/photos && cp -r public/photos assets/$SLUG/photos
B=build/$SLUG/bundle; O=build/$SLUG/chunks; mkdir -p $O
rm -rf $B && npx remotion bundle src/gen/Main.tsx --public-dir assets/$SLUG --out-dir $B --log=error >/dev/null
flock -u 9
[ "$STEP" = bundle ] && exit 0
TOTAL=$(python3 -c "import json,math;print(math.ceil(json.load(open('build/$SLUG/timeline.json'))['duration']*30))")
if [ -n "${3:-}" ]; then
  npx remotion render $B VSL build/$SLUG/preview.mp4 --frames=$3-$4 --muted --concurrency=4 --browser-executable=/opt/pw-browsers/chromium --log=error
  exit 0
fi
rm -f $O/list.txt
for ((A=0; A<TOTAL; A+=STEP)); do
  E=$(( A + STEP - 1 )); (( E >= TOTAL )) && E=$(( TOTAL - 1 ))
  F=$O/c$A.mp4
  if [ -s $F ] && [ -f $F.ok ]; then echo "file 'c$A.mp4'" >> $O/list.txt; continue; fi
  for try in 1 2 3; do
    if npx remotion render $B VSL $F --frames=$A-$E --muted --timeout=120000 --concurrency=4 --crf=16 --browser-executable=/opt/pw-browsers/chromium > $O/c$A.log 2>&1; then touch $F.ok; break; fi
    echo "$SLUG chunk $A failed (try $try)"; [ $try = 3 ] && exit 1
  done
  echo "$SLUG chunk $A-$E done $(date -u +%H:%M)"; echo "file 'c$A.mp4'" >> $O/list.txt
done
# loudness: -14 LUFS, true peak checked after AAC encoding (see master_audio.sh)
mkdir -p out
bash scripts/master_audio.sh $SLUG build/$SLUG/master.m4a
ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $O/list.txt -i build/$SLUG/master.m4a -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p \
  -c:a copy -shortest -movflags +faststart out/ProfitIQS-$SLUG-VSL.mp4
ffmpeg -hide_banner -i out/ProfitIQS-$SLUG-VSL.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2 | tr -s ' ' | tr '\n' ' '
echo; echo "$SLUG RENDERED $(date -u +%H:%M)"
