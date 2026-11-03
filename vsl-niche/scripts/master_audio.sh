#!/usr/bin/env bash
# Master assets/<slug>/mix.wav to AAC at ~-14 LUFS with true peak <= -1.2 dBTP (measured AFTER encoding;
# gain steps down until the encoded file passes). Usage: scripts/master_audio.sh <slug> <out.m4a>
set -euo pipefail
SLUG=$1; OUT=$2
I=$(ffmpeg -hide_banner -i assets/$SLUG/mix.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14.0-($I)+2.7,2))")
for try in 1 2 3 4; do
  ffmpeg -y -hide_banner -loglevel error -i assets/$SLUG/mix.wav \
    -af "aresample=192000,volume=${G}dB,alimiter=limit=0.62:attack=1:release=50:level=false,alimiter=limit=0.62:attack=0.1:release=20:level=false,aresample=48000" \
    -c:a aac -b:a 224k $OUT
  TP=$(ffmpeg -hide_banner -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+Peak:" | tail -1 | awk '{print $2}')
  echo "master try $try gain ${G}dB true peak ${TP}" >&2
  ok=$(python3 -c "print(1 if $TP <= -1.2 else 0)"); [ $ok = 1 ] && exit 0
  G=$(python3 -c "print(round($G - ($TP + 1.4), 2))")
done
echo "master: true peak still $TP" >&2
