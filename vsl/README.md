# ProfitIQS VSL (editable project)

A 5:49 video sales letter at 1920×1080 and 30 fps, built in Remotion (React). It uses Hormozi's structure: hook → pain →
proof → plan → the product, shown step by step → niche fit → three honest objections → offer → CTA → P.S. Every product
shot is the real Auto Repair Shop workbook (sample data).

## Deliverables
- `out/ProfitIQS-VSL.mp4`: final video with burned-in subtitles. Render `VSL-NoCaptions` for a clean version.
- `out/ProfitIQS-VSL-thumbnail.png`: landing-page thumbnail.
- `deliverables/subtitles.srt` and `.vtt`, plus `deliverables/voiceover-script.txt`.
- `deliverables/audio/`: voiceover, music and SFX stems (regenerate with `make_mix.py`; not committed).
- `deliverables/ASSETS-AND-CLAIMS.md`: the source for every claim, plus open items.

## Edit and re-render
```bash
npm install
python3 -I scripts/make_vo.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # after editing script/lines.json
python3 -I scripts/make_mix.py                                                # music + SFX + loudness
npm run studio
npm run render
npm run thumbnail
```
- Narration: `script/lines.json`. `sub` is what's displayed and `say` is what's spoken.
- Scenes: `src/scenes/s1.tsx` (hook, pain, turn, intro, plan), `s2.tsx` (setup, entry, dashboard, health, elite, leak), `s3.tsx` (niche, 21 industries, objections, pricing, CTA, end).
- Real sheets: `public/sheets/*.png` and `public/docs/` are **not committed** (paid product). Regenerate them from the product zip with `scripts/render_sheets.sh <unzipped Complete folder>`. Camera and highlight boxes are set as fractions of each image in the scene files.
- Covers: `public/site/covers/` (all 63, from profitiqs.com). Product facts: `script/products.json`.
