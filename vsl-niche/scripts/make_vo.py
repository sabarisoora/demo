"""Voiceover for a niche VSL: one Kokoro clip per line, laid on a timeline.
Writes public/vo-<niche>.wav, src/timeline-<niche>.json, deliverables/<niche>/subtitles.{srt,vtt}, script.txt.
Word times inside a line are estimated from syllable-ish weights (good enough for word-highlight captions).
Usage: python3 -I scripts/make_vo.py <niche> <kokoro-dir>"""
import json, os, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NICHE, MODEL = sys.argv[1], sys.argv[2]
VOICE, SPEED = "af_heart", 1.04
START, GAP, SCENE_GAP, TAIL = 0.35, 0.28, 0.7, 5.0
rows = json.load(open(os.path.join(ROOT, f"script/{NICHE}.json")))
k = Kokoro(os.path.join(MODEL, "kokoro-v1.0.onnx"), os.path.join(MODEL, "voices-v1.0.bin"))

def trim(a, sr, thr=0.008):
    i = np.where(np.abs(a) > thr)[0]
    return a if len(i) == 0 else a[max(0, i[0] - int(0.02 * sr)): i[-1] + int(0.05 * sr)]

def weight(w):
    w = re.sub(r"[^a-z0-9$]", "", w.lower())
    if not w: return 0.3
    if re.match(r"^\$?\d", w): return 2.5
    return max(1, len(re.findall(r"[aeiouy]+", w))) + 0.15 * len(w) / 4

lines, t, prev, sr = [], START, None, 24000
for r in rows:
    scene, sub = r[0], r[1]
    say = r[2] if len(r) > 2 else re.sub(r"[\[\]™]", "", sub)
    a, sr = k.create(say, voice=VOICE, speed=SPEED, lang="en-us")
    a = trim(a, sr)
    if prev is not None: t += SCENE_GAP if scene != prev else GAP
    d = len(a) / sr
    words = sub.split()
    ws = [weight(w) for w in words]; tot = sum(ws); acc = 0; wt = []
    for w, x in zip(words, ws):
        wt.append({"w": w, "s": round(t + d * acc / tot, 3)}); acc += x
    lines.append({"scene": scene, "sub": sub, "say": say, "start": round(t, 3), "end": round(t + d, 3), "words": wt, "audio": a})
    t += d; prev = scene
total = t + TAIL
out = np.zeros(int(total * sr) + 1, dtype=np.float32)
for c in lines:
    s = int(c["start"] * sr); out[s:s + len(c["audio"])] += c["audio"]
out = out / max(1e-6, np.abs(out).max()) * 0.89
sf.write(os.path.join(ROOT, f"public/vo-{NICHE}.wav"), out, sr)
json.dump({"duration": round(total, 3), "lines": [{k2: v for k2, v in c.items() if k2 != "audio"} for c in lines]}, open(os.path.join(ROOT, f"src/timeline-{NICHE}.json"), "w"), indent=1)

clean = lambda s: re.sub(r"[\[\]]", "", s)
def ts(x, sep):
    return f"{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d}{sep}{int(round((x%1)*1000))%1000:03d}"
D = os.path.join(ROOT, "deliverables", NICHE); os.makedirs(D, exist_ok=True)
with open(f"{D}/subtitles.srt", "w") as f:
    for i, c in enumerate(lines, 1): f.write(f"{i}\n{ts(c['start'], ',')} --> {ts(c['end'] + .15, ',')}\n{clean(c['sub'])}\n\n")
with open(f"{D}/subtitles.vtt", "w") as f:
    f.write("WEBVTT\n\n")
    for c in lines: f.write(f"{ts(c['start'], '.')} --> {ts(c['end'] + .15, '.')}\n{clean(c['sub'])}\n\n")
with open(f"{D}/script.txt", "w") as f:
    p = None
    for c in lines:
        if c["scene"] != p: f.write(f"\n[{c['scene'].upper()}]\n"); p = c["scene"]
        f.write(clean(c["sub"]) + "\n")
p = None
for c in lines:
    if c["scene"] != p: print(f"{c['scene']:8} {c['start']:7.2f}"); p = c["scene"]
print(f"{len(lines)} lines, {total:.1f}s")
