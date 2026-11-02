"""Voice + timeline + cues + mix for a generic niche VSL (spec at script/n/<slug>.json).
Writes build/<slug>/{timeline,cues}.json, assets/<slug>/mix.wav, deliverables/<slug>/{subtitles.srt,.vtt,script.txt,audio/}.
Usage: python3 -I scripts/gen_audio.py <slug> <kokoro dir>"""
import json, os, re, sys, subprocess
import numpy as np, soundfile as sf
from scipy.signal import lfilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUG, MODEL = sys.argv[1], sys.argv[2]
SPEC = json.load(open(f"{ROOT}/script/n/{SLUG}.json"))
BUILD = f"{ROOT}/build/{SLUG}"; os.makedirs(BUILD, exist_ok=True)
D = os.path.join(ROOT, "deliverables", SLUG); os.makedirs(D + "/audio", exist_ok=True)
VOICE, SPEED = "af_heart", 1.04
START, GAP, SCENE_GAP, TAIL = 0.35, 0.28, 0.7, 5.0
rows = SPEC["lines"]
from kokoro_onnx import Kokoro
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
    say = r[2] if len(r) > 2 and r[2] else re.sub(r"[\[\]™]", "", sub)
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
VO_SR = sr; VO = out
json.dump({"duration": round(total, 3), "lines": [{k2: v for k2, v in c.items() if k2 != "audio"} for c in lines]}, open(f"{BUILD}/timeline.json", "w"), indent=1)

clean = lambda s: re.sub(r"[\[\]]", "", s)
def ts(x, sep):
    return f"{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d}{sep}{int(round((x%1)*1000))%1000:03d}"
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

# ---------- cues derived from the visuals: [line, frac, kind] ----------
TL = [{k2: v for k2, v in c.items() if k2 != "audio"} for c in lines]
def where(i, j, p):
    t = TL[i]["start"] + (TL[j]["end"] - TL[i]["start"]) * p
    for q in range(i, j + 1):
        if TL[q]["start"] - 0.2 <= t <= TL[q]["end"] + 0.3:
            return q, max(0, min(1, (t - TL[q]["start"]) / max(0.01, TL[q]["end"] - TL[q]["start"])))
    return j, 1.0
CUES = []
def cue(i, j, p, kind): q, fr_ = where(i, j, p); CUES.append([q, round(fr_, 3), kind])
blocks = []
for idx, r in enumerate(rows):
    v = r[3] if len(r) > 3 else None
    if idx == 0 or v or r[0] != rows[idx - 1][0]: blocks.append([idx, idx, v or {"t": "slam"}, r[0]])
    else: blocks[-1][1] = idx
FIXED = {"reveal", "who", "guide", "offer", "cta", "end"}
seen = set()
for i, j, v, sc in blocks:
    if sc in FIXED: continue
    t = v.get("t"); n = lambda key: len(v.get(key, []))
    if v.get("impact"): cue(i, j, v.get("fxAt", 0), "impact")
    if t == "slam": cue(i, j, 0.02, "pop")
    elif t == "notifs": [cue(i, j, 0.08 + k_ * 0.62 / max(1, n("items") - 1), "notif") for k_ in range(n("items"))]
    elif t == "counter": cue(i, j, 0.0, "type"); cue(i, j, 0.3, "pop")
    elif t == "bars": [cue(i, j, 0.05 + k_ * 0.6 / (n("bars") + 1), "pop") for k_ in range(n("bars"))]
    elif t == "cards": [cue(i, j, 0.25 + k_ * 0.6 / max(1, n("cards")), "pop") for k_ in range(n("cards"))]
    elif t == "rows": [cue(i, j, 0.1 + k_ * 0.7 / n("rows"), "error" if v["rows"][k_][2] == "red" else "pop") for k_ in range(n("rows"))]
    elif t == "zero": cue(i, j, 0.2, "stamp")
    elif t in ("months", "ring"): cue(i, j, 0.0, "clock")
    elif t == "calendar": cue(i, j, 0.0, "clock"); cue(i, j, 0.5, "error")
    elif t == "strike": cue(i, j, 0.3, "hit"); cue(i, j, 0.7, "swish")
    elif t == "converge": cue(i, j, 0.45, "swish"); cue(i, j, 0.75, "ding")
    elif t == "split": cue(i, j, 0.08, "pop"); cue(i, j, v.get("rightAt", 0.5), "ding")
    elif t == "checklist": [cue(i, j, 0.12 + k_ * 0.78 / n("items"), "tick") for k_ in range(n("items"))]
    elif t == "papers": [cue(i, j, p, "shutter") for p in (0.3, 0.5)]
    elif t == "phone": cue(i, j, 0.1, "notif")
    elif t == "qa": cue(i, j, 0.0, "pop"); [cue(i, j, 0.35 + k_ * 0.5 / max(1, n("chips")), "pop") for k_ in range(n("chips"))]
    elif t == "cover": cue(i, j, v.get("nAt", 0.6), "hit")
    elif t == "wall": cue(i, j, 0.0, "swish"); cue(i, j, v.get("inAt", 0.35), "pop"); cue(i, j, v.get("autoAt", 0.68), "pop")
    elif t == "grid": cue(i, j, 0.0, "swish"); [cue(i, j, 0.02 + k_ * 0.85 / n("tabs"), "pop") for k_ in range(n("tabs"))]
    elif t in ("sheet", "hero"):
        cue(i, j, 0.0, "swish")
        h = v.get("hi", []); m = len(h)
        for k_, hh in enumerate(h): cue(i, j, hh[4] if len(hh) > 4 else 0.28 + (k_ * 0.55 / (m - 1) if m > 1 else 0.1), "pop")
    elif t == "mini": [cue(i, j, 0.04 + k_ * 0.6 / n("items"), "swish") for k_ in range(n("items"))]
# fixed scenes
first = {}
for idx, r in enumerate(rows): first.setdefault(r[0], idx)
sc_lines = lambda sc: [k_ for k_, r in enumerate(rows) if r[0] == sc]
if "reveal" in first: cue(first["reveal"], first["reveal"], 0.0, "impact")
for k_ in sc_lines("who"): cue(k_, k_, 0.0, "pop")
for k_ in sc_lines("guide"): cue(k_, k_, 0.0, "swish")
ol = sc_lines("offer")
for k_ in ol[1:4]: cue(k_, k_, 0.12, "cash")
if len(ol) > 4: cue(ol[4], ol[4], 0.5, "impact")
cl_ = sc_lines("cta")
for k_, p in ((1, 0.0), (2, 0.05), (2, 0.6)):
    if k_ < len(cl_): cue(cl_[k_], cl_[k_], p, "pop")
el = sc_lines("end")
if len(el) > 1: cue(el[1], el[1], 0.08, "hit")
json.dump(CUES, open(f"{BUILD}/cues.json", "w"))
print(len(CUES), "cues,", sum(1 for c in CUES if c[2] == "impact"), "impacts")

# ---------- score + sfx + mix ----------
SR = 48000
L = TL
cues = CUES
vo, vsr = VO, VO_SR
vo = np.interp(np.arange(int(len(vo) * SR / vsr)) / SR, np.arange(len(vo)) / vsr, vo)
N = len(vo); t = np.arange(N) / SR; T = t[-1]
rng = np.random.default_rng(11)
lp = lambda x, a: lfilter([a], [1, a - 1], x)
hp = lambda x, a: x - lp(x, a)
mt = lambda m: 440 * 2 ** ((m - 69) / 12)
TT = lambda d: np.arange(int(d * SR)) / SR
def put(b, x, at):
    s = int(at * SR); e = min(N, s + len(x))
    if 0 <= s < N and e > s: b[s:e] += x[: e - s]
S = {}
for l in L: S.setdefault(l["scene"], l["start"])
fr = lambda sec: round(sec * 30) / 30

# ---------- score: 112 bpm, minor key, sections ----------
BPM = 112; b = 60 / BPM; bar = 4 * b
prog = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]]  # Am F C G
pad = np.zeros(N); arp = np.zeros(N); kick = np.zeros(N); snare = np.zeros(N); hat = np.zeros(N); bass = np.zeros(N); sub = np.zeros(N)
for k in range(int(T / bar) + 2):
    s0 = k * bar; ch = prog[k % 4]
    d = bar + 1.0; tt = TT(d); env = np.minimum(1, tt / 0.5) * np.exp(-np.maximum(0, tt - bar) / 0.35)
    for m in ch[1:]:
        for det in (-0.08, 0.0, 0.08):
            ph = 2 * np.pi * mt(m + det) * tt
            put(pad, (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sign(np.sin(ph))) * env * 0.022, s0)
    put(sub, np.sin(2 * np.pi * mt(ch[0] - 12) * tt) * env * 0.12, s0)
    for j in range(16):
        tj = s0 + j * b / 4; tt2 = TT(0.22); n = ch[[1, 2, 3, 2][j % 4]] + (12 if j % 8 >= 4 else 0)
        put(arp, (np.sign(np.sin(2 * np.pi * mt(n) * tt2)) * 0.25 + np.sin(2 * np.pi * mt(n) * tt2)) * np.exp(-tt2 * 16) * 0.05, tj)
    for j in range(4):
        tj = s0 + j * b
        kt = TT(0.35); put(kick, np.sin(2 * np.pi * (46 + 140 * np.exp(-kt * 38)) * kt) * np.exp(-kt * 8) * 0.8, tj)
        if j % 2 == 1:
            st = TT(0.25); put(snare, (hp(rng.standard_normal(len(st)), 0.3) * np.exp(-st * 18) * 0.35 + np.sin(2 * np.pi * 185 * st) * np.exp(-st * 25) * 0.3), tj)
        for h in range(2):
            ht = TT(0.05); put(hat, hp(rng.standard_normal(len(ht)), 0.65) * np.exp(-ht * 85) * 0.09, tj + h * b / 2 + b / 4 * (h == 1) * 0)
        bt = TT(b * 0.9); put(bass, np.tanh(2.5 * np.sin(2 * np.pi * mt(ch[0] - 12) * bt)) * np.exp(-bt * 3) * 0.16, tj)
arp = lp(arp, 0.4)
def env(points):
    return np.interp(t, [p[0] for p in points], [p[1] for p in points])
E = lambda k: S[k]
drums = env([(0, 0), (E("pain") - 0.2, 0.35), (E("pain"), 0), (E("turn") - 0.4, 0), (E("reveal"), 1), (E("obj") - 0.4, 1), (E("obj"), 0.25), (E("offer") - 0.4, 0.25), (E("offer"), 1), (E("end") + 2, 1), (T - 1.5, 0), (T, 0)])
pads = env([(0, 0), (0.5, 0.9), (E("reveal"), 1), (T - 2, 1), (T, 0)])
arps = env([(0, 0.5), (E("pain"), 0.25), (E("turn"), 0.6), (E("reveal"), 1), (E("obj"), 0.5), (E("offer"), 1), (T - 2, 0.8), (T, 0)])
subs = env([(0, 0.6), (E("pain"), 1), (E("reveal"), 1), (T, 0.6)])
music = pad * pads + arp * arps + sub * subs + (kick * 0.6 + snare + hat + bass) * drums
# tension drone + heartbeat under the pain section
dr = np.zeros(N); tt = TT(E("turn") - E("pain"))
put(dr, (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.4 * tt)) * np.minimum(1, tt / 2) * 0.06, E("pain"))
for k in range(int((E("turn") - E("pain")) / 0.9)):
    ht = TT(0.18); x = np.sin(2 * np.pi * 50 * ht) * np.exp(-ht * 22) * 0.35
    put(dr, x, E("pain") + k * 0.9); put(dr, x * 0.6, E("pain") + k * 0.9 + 0.22)
music += dr
speech = np.zeros(N)
for l in L: speech[int(l["start"] * SR):int(l["end"] * SR)] = 1
duck = lp(lp(speech, 1 / (0.1 * SR)), 1 / (0.1 * SR))
music *= 0.42 - 0.24 * duck

# ---------- sfx ----------
fx = np.zeros(N)
def whoosh(d=0.45, g=0.4): n = int(d * SR); e = np.sin(np.pi * np.arange(n) / n) ** 2; return lp(rng.standard_normal(n), 0.1) * e * g
def impact(g=0.6):
    tt = TT(1.6); return (np.sin(2 * np.pi * (38 + 90 * np.exp(-tt * 9)) * tt) * np.exp(-tt * 2.6) + lp(rng.standard_normal(len(tt)), 0.06) * np.exp(-tt * 7) * 0.8 + hp(rng.standard_normal(len(tt)), 0.3) * np.exp(-tt * 30) * 0.4) * g
def hit(g=0.5): tt = TT(0.5); return (np.sin(2 * np.pi * (60 + 120 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 9) + hp(rng.standard_normal(len(tt)), 0.4) * np.exp(-tt * 40) * 0.5) * g
def pop(g=0.22, f0=900): tt = TT(0.1); return np.sin(2 * np.pi * (f0 * 0.4 + f0 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 38) * g
def ding(f0=1320, g=0.2): tt = TT(1.2); return sum(np.sin(2 * np.pi * f0 * r * tt) * a for r, a in ((1, 1), (2.01, 0.4), (3.02, 0.15))) * np.exp(-tt * 3.5) * g
def notif(g=0.18): return np.concatenate([ding(1568, g)[: int(0.09 * SR)], ding(2093, g)])
def stamp(g=0.5): tt = TT(0.45); return (lp(rng.standard_normal(len(tt)), 0.18) * np.exp(-tt * 26) + np.sin(2 * np.pi * 65 * tt) * np.exp(-tt * 9)) * g
def glitch(g=0.3):
    tt = TT(0.35); x = np.sign(np.sin(2 * np.pi * 220 * tt * (1 + 3 * (rng.random(len(tt)) > 0.97)))) * (rng.random(len(tt)) > 0.5)
    return hp(x.astype(float), 0.2) * np.exp(-tt * 6) * g
def shutter(g=0.35): tt = TT(0.12); return hp(rng.standard_normal(len(tt)), 0.4) * (np.exp(-tt * 60) + 0.6 * np.exp(-np.maximum(0, tt - 0.06) * 60) * (tt > 0.06)) * g
def cash(g=0.3): return np.concatenate([ding(2637, g * 0.7)[: int(0.05 * SR)], ding(3136, g)])
def alarm(g=0.15):
    tt = TT(1.0); return np.sign(np.sin(2 * np.pi * (880 + 220 * np.sign(np.sin(2 * np.pi * 6 * tt))) * tt)) * np.exp(-tt * 1.5) * g * 0.4
def swish(g=0.3): n = int(0.28 * SR); e = np.sin(np.pi * np.arange(n) / n) ** 3; return hp(rng.standard_normal(n), 0.35) * e * g
def error(g=0.28): tt = TT(0.3); return np.sign(np.sin(2 * np.pi * 140 * tt)) * np.exp(-tt * 8) * g * 0.6
def typing(g=0.12):
    out = np.zeros(int(0.7 * SR))
    for k in range(9):
        s = int((k * 0.07 + rng.random() * 0.02) * SR); n = int(0.025 * SR); out[s:s + n] += hp(rng.standard_normal(n), 0.5) * np.exp(-np.arange(n) / SR * 160) * g
    return out
def tick(g=0.18): tt = TT(0.06); return np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 70) * g
def clock(g=0.15):
    out = np.zeros(int(1.8 * SR))
    for k in range(6): s = int(k * 0.3 * SR); x = tick(g); out[s:s + len(x)] += x
    return out
def riser(d=1.2, g=0.3): tt = TT(d); return (hp(rng.standard_normal(len(tt)), 0.3) * (tt / d) ** 2 * 0.6 + np.sin(2 * np.pi * (200 * tt + 1000 * tt ** 2 / d)) * (tt / d) ** 2 * 0.25) * g
SFX = {"impact": impact, "hit": hit, "pop": pop, "ding": ding, "notif": notif, "stamp": stamp, "glitch": glitch, "shutter": shutter, "cash": cash, "alarm": alarm, "swish": swish, "error": error, "type": typing, "tick": tick, "clock": clock, "whoosh": whoosh}
for i, p, k in cues:
    l = L[i]; at = fr(l["start"] + (l["end"] - l["start"]) * p)
    if k == "riser": put(fx, riser(), at); continue
    if k == "impact": put(fx, riser(0.7, 0.1), at - 0.7)
    g = 0.55 if l["scene"] == "hook" else 1.0  # the hook stays light: voice first
    put(fx, SFX[k]() * g, at)
# a whoosh into every scene change
for sc, st in list(S.items())[1:]: put(fx, whoosh(0.5, 0.2), st - 0.4 - 0.3)

mix = vo * 1.0 + music + fx * 0.4
tmp = f"{BUILD}/_raw.wav"
sf.write(tmp, mix / max(1, np.abs(mix).max()), SR, subtype="PCM_24")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.2:LRA=11", "-ar", str(SR), f"{ROOT}/assets/{SLUG}/mix.wav"], check=True)
os.remove(tmp)
for name, x in (("voiceover", vo), ("music", music), ("sfx", fx * 0.4)): sf.write(f"{D}/audio/{name}.wav", x, SR, subtype="PCM_24")
print("mix", round(N / SR, 1), "s")
