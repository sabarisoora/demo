"""Builds the voiceover: one Kokoro TTS clip per line, laid on a timeline.
Writes public/vo.wav, src/timeline.json and deliverables/subtitles.{srt,vtt}, script.txt.
Usage: python3 -I scripts/make_vo.py <kokoro-model-dir>"""
import json, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = sys.argv[1]
VOICE, SPEED = "af_heart", 0.95
START, GAP, SCENE_GAP, TAIL = 0.5, 0.42, 1.05, 6.0

lines = json.load(open(os.path.join(ROOT, "script/lines.json")))
k = Kokoro(os.path.join(MODEL, "kokoro-v1.0.onnx"), os.path.join(MODEL, "voices-v1.0.bin"))

def trim(a, sr, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    s, e = max(0, idx[0] - int(0.02 * sr)), min(len(a), idx[-1] + int(0.06 * sr))
    return a[s:e]

clips, t, prev, sr = [], START, None, 24000
for ln in lines:
    a, sr = k.create(ln["say"], voice=VOICE, speed=SPEED, lang="en-us")
    a = trim(a, sr)
    if prev is not None: t += SCENE_GAP if ln["scene"] != prev else GAP
    dur = len(a) / sr
    clips.append({**ln, "start": round(t, 3), "end": round(t + dur, 3), "audio": a})
    t += dur; prev = ln["scene"]
total = t + TAIL

out = np.zeros(int(total * sr) + 1, dtype=np.float32)
for c in clips:
    s = int(c["start"] * sr); out[s:s + len(c["audio"])] += c["audio"]
out = out / max(1e-6, np.abs(out).max()) * 0.89
sf.write(os.path.join(ROOT, "public/vo.wav"), out, sr)

timeline = {"duration": round(total, 3), "lines": [{k2: v for k2, v in c.items() if k2 != "audio"} for c in clips]}
json.dump(timeline, open(os.path.join(ROOT, "src/timeline.json"), "w"), indent=1)

def ts(x, sep):
    h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s % 1) * 1000)) % 1000:03d}"
os.makedirs(os.path.join(ROOT, "deliverables"), exist_ok=True)
with open(os.path.join(ROOT, "deliverables/subtitles.srt"), "w") as f:
    for i, c in enumerate(clips, 1):
        f.write(f"{i}\n{ts(c['start'], ',')} --> {ts(c['end'] + 0.15, ',')}\n{c['sub']}\n\n")
with open(os.path.join(ROOT, "deliverables/subtitles.vtt"), "w") as f:
    f.write("WEBVTT\n\n")
    for c in clips:
        f.write(f"{ts(c['start'], '.')} --> {ts(c['end'] + 0.15, '.')}\n{c['sub']}\n\n")
with open(os.path.join(ROOT, "deliverables/voiceover-script.txt"), "w") as f:
    prev = None
    for c in clips:
        if c["scene"] != prev: f.write(f"\n[{c['scene'].upper()}]\n"); prev = c["scene"]
        f.write(c["sub"] + "\n")
print(f"{len(clips)} lines, {total:.1f}s")
