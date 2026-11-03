#!/usr/bin/env bash
# spec -> check -> voice/mix -> bundle -> storyboard contact sheets. Usage: scripts/pipeline.sh <slug>
set -e
cd "$(dirname "$0")/.."
S=$1; SP=/tmp/claude-0/-home-user/79cdc2d5-92ff-5c6b-ba90-85f62602d77a/scratchpad
[ -f script/src/$S.py ] && python3 -I scripts/mkspec.py $S
python3 $SP/check.py $S | grep -E "NO |BAD" 
python3 $SP/check.py $S | grep -q "BAD 0" || { echo "$S CHECK FAILED"; exit 1; }
H=$(python3 -c "import json,hashlib,sys;s=json.load(open('script/n/$S.json'));print(hashlib.sha1(json.dumps([[l[0],l[1],l[2]] for l in s['lines']]).encode()).hexdigest())")
if [ -f build/$S/spec.sha ] && [ "$(cat build/$S/spec.sha)" = "$H" ] && [ -f assets/$S/mix.wav ]; then echo "$S audio up to date"; else
python3 -I scripts/gen_audio.py $S $SP/tts > build/$S.audio.log 2>&1 || { echo "$S AUDIO FAILED"; exit 1; }
echo $H > build/$S/spec.sha; fi
tail -4 build/$S.audio.log
bash scripts/render_niche.sh $S bundle
rm -rf build/$S/board; node scripts/board_gen.mjs $S 2>&1 | grep -E "ERR|done"
python3 - $S <<'PY'
import sys,glob
from PIL import Image, ImageDraw
s=sys.argv[1]; fs=sorted(glob.glob(f'build/{s}/board/[0-9]*.png'))
for part in range(0,len(fs),30):
  sub=fs[part:part+30];W,H=576,324;cols=5;rows=(len(sub)+cols-1)//cols
  sh=Image.new('RGB',(cols*W,rows*H),'black');d=ImageDraw.Draw(sh)
  for i,f in enumerate(sub):
    im=Image.open(f).convert('RGB').resize((W-4,H-4));x,y=(i%cols)*W,(i//cols)*H
    sh.paste(im,(x+2,y+2));d.text((x+6,y+4),f.split('/')[-1][:-4],fill='yellow')
  sh.save(f'build/{s}/sheet{part//30}.png')
W,H=320,180;cols=10;rows=(len(fs)+cols-1)//cols
sh=Image.new('RGB',(cols*W,rows*H),'black');d=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((W-2,H-2));x,y=(i%cols)*W,(i//cols)*H
  sh.paste(im,(x+1,y+1));d.text((x+4,y+2),f.split('/')[-1][:-4],fill='yellow')
sh.save(f'build/{s}/all.png')
PY
echo "$S PIPELINE OK"
echo $S >> build/queue.txt
