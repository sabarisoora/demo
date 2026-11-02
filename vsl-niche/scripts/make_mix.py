"""Score + SFX for a niche VSL, mixed under the voiceover and loudness-normalized.
Writes public/mix-<niche>.wav and deliverables/<niche>/audio/{voiceover,music,sfx}.wav
Usage: python3 -I scripts/make_mix.py <niche>"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import lfilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N_ = sys.argv[1]
SR = 48000
tl = json.load(open(f"{ROOT}/src/timeline-{N_}.json")); L = tl["lines"]
cues = json.load(open(f"{ROOT}/script/{N_}-cues.json"))
vo, vsr = sf.read(f"{ROOT}/public/vo-{N_}.wav")
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
os.makedirs(f"{ROOT}/deliverables/{N_}/audio", exist_ok=True)
tmp = f"{ROOT}/public/_raw.wav"
sf.write(tmp, mix / max(1, np.abs(mix).max()), SR, subtype="PCM_24")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.2:LRA=11", "-ar", str(SR), f"{ROOT}/public/mix-{N_}.wav"], check=True)
os.remove(tmp)
for name, x in (("voiceover", vo), ("music", music), ("sfx", fx * 0.4)): sf.write(f"{ROOT}/deliverables/{N_}/audio/{name}.wav", x, SR, subtype="PCM_24")
print("mix", round(N / SR, 1), "s")
