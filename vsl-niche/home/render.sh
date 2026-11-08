#!/usr/bin/env bash
# Render the homepage VSL in chunks (resumable via .ok markers), then encode with the mastered audio.
set -euo pipefail
cd "$(dirname "$0")/.."
V=${1:-full}                          # full | short
SRC=home; [ "$V" = short ] && SRC=home/short
ENTRY=${ENTRY:-src/pure/index.ts}; NAME=ProfitIQS-Home-VSL$([ "$V" = short ] && echo -Short || true)
if [ "$V" = aff ]; then SRC=home/aff2; ENTRY=src/paff/index.ts; NAME=ProfitIQS-Affiliate-VSL; fi
B=build/home-bundle-$V; O=build/home-chunks-$V; mkdir -p $O out home/cur
exec 9>/tmp/home-bundle.lock; flock 9
cp $SRC/timeline.json $SRC/cues.json home/cur/
cp $SRC/mix.wav home/public/mix.wav
rm -rf $B && npx remotion bundle $ENTRY --public-dir home/public --out-dir $B --log=error >/dev/null
flock -u 9
TOTAL=$(python3 -c "import json,math;print(math.ceil(json.load(open('$SRC/timeline.json'))['duration']*30))")
STEP=750; rm -f $O/list.txt
for ((A=0; A<TOTAL; A+=STEP)); do
  E=$(( A + STEP - 1 )); (( E >= TOTAL )) && E=$(( TOTAL - 1 ))
  F=$O/c$A.mp4
  if [ -s $F ] && [ -f $F.ok ]; then echo "file 'c$A.mp4'" >> $O/list.txt; continue; fi
  for try in 1 2 3; do
    if npx remotion render $B Home $F --frames=$A-$E --muted --props='{"audio":false}' --timeout=120000 --concurrency=4 --scale=2 --image-format=png --crf=12 --x264-preset=veryfast --browser-executable=/opt/pw-browsers/chromium > $O/c$A.log 2>&1; then touch $F.ok; break; fi
    echo "chunk $A failed (try $try)"; [ $try = 3 ] && exit 1
  done
  echo "chunk $A-$E done $(date -u +%H:%M)"; echo "file 'c$A.mp4'" >> $O/list.txt
done
# audio: AAC, verify true peak after encoding, step gain down if needed
G=4.6
for try in 1 2 3 4; do
  ffmpeg -y -hide_banner -loglevel error -i $SRC/mix.wav -af "volume=${G}dB,aresample=192000,alimiter=limit=0.74:attack=1:release=60:level=false,alimiter=limit=0.74:attack=0.1:release=20:level=false,aresample=48000" -c:a aac -b:a 256k build/home-audio-$V.m4a
  TP=$(ffmpeg -hide_banner -i build/home-audio-$V.m4a -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+Peak:" | tail -1 | awk '{print $2}')
  echo "audio try $try gain $G tp $TP"
  [ "$(python3 -c "print(1 if $TP <= -1.2 else 0)")" = 1 ] && break
  G=$(python3 -c "print(round($G - ($TP + 1.4), 2))")
done
ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $O/list.txt -i build/home-audio-$V.m4a -map 0:v:0 -map 1:a:0 -vf scale=1920:1080:flags=lanczos -c:v libx264 -crf 14 -preset slow -tune animation -pix_fmt yuv420p -c:a copy -shortest -movflags +faststart out/$NAME.mp4
ffmpeg -hide_banner -i out/$NAME.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2 | tr -s ' ' | tr '\n' ' '
echo; echo "HOME $V RENDERED $(date -u +%H:%M)"
