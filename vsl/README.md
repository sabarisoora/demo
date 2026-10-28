# ProfitIQS VSL (editable project)

A 3:09 video sales letter at 1920×1080 and 30 fps, built in Remotion (React). It follows the supplied script, with the
pacing structure from the `hormozi-vsl` skill.

## Files
- `out/ProfitIQS-VSL.mp4`: final video with burned-in subtitles.
- `out/ProfitIQS-VSL-thumbnail.png`: landing-page thumbnail.
- `deliverables/subtitles.srt` and `.vtt`: subtitles for players that support captions.
- `deliverables/voiceover-script.txt`: the narration, grouped by scene.
- `deliverables/audio/`: stems for voiceover, music and SFX. `public/mix.wav` is the final mix at -16 LUFS.
- `deliverables/ASSETS-AND-CLAIMS.md`: missing assets, unverified features and claims to sign off.

## Edit and re-render
```bash
npm install
python3 -I scripts/make_vo.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # only if lines.json changed
python3 -I scripts/make_mix.py
npm run studio      # live preview and editing
npm run render      # out/ProfitIQS-VSL.mp4
npm run thumbnail
```
- Narration text and on-screen subtitles: `script/lines.json`. `sub` is what's displayed and `say` is what's spoken.
- Real product footage: put files in `public/` and set them in `src/assets.ts`. The "Illustrative visual" labels disappear automatically.
- Version without subtitles: render the `VSL-NoCaptions` composition.
- Scenes: `src/scenes/opening.tsx` (hook, problem, realization), `middle.tsx` (intro, product, editions, niche fit), `closing.tsx` (21 niches, pricing, CTA, end card).
