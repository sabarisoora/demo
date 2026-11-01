# ProfitIQS niche VSL engine

One Remotion project for all 21 niche VSLs. Per niche you need:
- `script/<niche>.json`: lines `[scene, on-screen text with [accent] words, optional spoken text]`
- `script/<niche>-cues.json`: `[line index, fraction of the line, sfx kind]`. These drive both the sound and the shake/flash.
- `public/sheets/*.png`: real sheets rendered from that niche's workbooks (not committed; they show the paid product)
- `public/covers/`: the niche's 3 covers

```bash
python3 -I scripts/make_vo.py 1099 <kokoro dir>     # voice, timeline, subtitles
python3 -I scripts/make_mix.py 1099                 # score + sfx + loudness
node scripts/board.mjs VSL-1099 timeline-1099.json  # one review frame per line
npx remotion render src/index.ts VSL-1099 out/1099-raw.mp4 --browser-executable=/opt/pw-browsers/chromium
```
Scenes: `src/scenes/a.tsx` (hook, pain, turn), `b.tsx` (reveal, who, Essential, Elite, tax, leak), `c.tsx` (objections, offer, CTA, end).
