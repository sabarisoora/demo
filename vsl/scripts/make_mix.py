"""Music bed + sound design, mixed under the voiceover.
Writes public/mix.wav and deliverables/audio/{voiceover,music,sfx}.wav.  Usage: python3 -I scripts/make_mix.py"""
import json, os, subprocess
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
tl = json.load(open(os.path.join(ROOT, "src/timeline.json")))
vo, vsr = sf.read(os.path.join(ROOT, "public/vo.wav"))
vo = np.interp(np.arange(int(len(vo) * SR / vsr)) / SR, np.arange(len(vo)) / vsr, vo)
N = len(vo); t = np.arange(N) / SR
rng = np.random.default_rng(7)
lines = tl["lines"]
by = lambda sc: [l for l in lines if l["scene"] == sc]
sstart = {}
for l in lines: sstart.setdefault(l["scene"], l["start"])

def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- music: 100 bpm, Am - F - C - G ----------
BPM = 100; beat = 60 / BPM; bar = beat * 4
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 67]]
pad = np.zeros(N); pl = np.zeros(N); kick = np.zeros(N); hat = np.zeros(N); bass = np.zeros(N)
nb = int(N / SR / bar) + 1
for b in range(nb):
    s0 = int(b * bar * SR); ch = chords[b % 4]
    L = min(int((bar + 0.8) * SR), N - s0)
    if L <= 0: break
    tt = np.arange(L) / SR
    env = np.minimum(1, tt / 0.6) * np.exp(-np.maximum(0, tt - bar) / 0.4)
    for m in ch:
        for d in (-0.06, 0.06):
            ph = 2 * np.pi * mtof(m + d) * tt
            pad[s0:s0 + L] += (np.sin(ph) + 0.25 * np.sin(2 * ph)) * env * 0.04
    for k in range(8):  # plucks on eighths
        p0 = s0 + int(k * beat / 2 * SR); Lp = min(int(0.35 * SR), N - p0)
        if Lp <= 0: continue
        pt = np.arange(Lp) / SR; note = ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12
        pl[p0:p0 + Lp] += np.sign(np.sin(2 * np.pi * mtof(note) * pt)) * 0.3 * np.exp(-pt * 14) * 0.05 + np.sin(2 * np.pi * mtof(note) * pt) * np.exp(-pt * 9) * 0.04
    for k in range(4):
        p0 = s0 + int(k * beat * SR)
        Lk = min(int(0.3 * SR), N - p0)
        if Lk > 0:
            kt = np.arange(Lk) / SR
            kick[p0:p0 + Lk] += np.sin(2 * np.pi * (48 + 90 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 9) * 0.5
        bl = min(int(beat * SR), N - p0)
        if bl > 0:
            bt = np.arange(bl) / SR
            bass[p0:p0 + bl] += np.tanh(2 * np.sin(2 * np.pi * mtof(ch[0] - 24) * bt)) * np.exp(-bt * 3) * 0.12
        h0 = p0 + int(beat / 2 * SR); Lh = min(int(0.06 * SR), N - h0)
        if Lh > 0: hat[h0:h0 + Lh] += rng.standard_normal(Lh) * np.exp(-np.arange(Lh) / SR * 70) * 0.05
hat = hp(hat, 0.5); pl = lp(pl, 0.35)

def env_points(pts):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return np.interp(t, xs, ys)
T = t[-1]
S = sstart
# intensity of the beat (kick/hat/bass) and of the pad, per section
beat_lvl = env_points([(0, 0), (S["pain"] - 1, 0.35), (S["pain"], 0), (S["turn"] - 0.5, 0), (S["intro"] - 0.4, 0), (S["intro"], 1), (S["niche"], 1), (S["obj1"] - 1, 1), (S["obj1"], 0.25), (S["pricing"] - 1, 0.25), (S["pricing"], 1), (S["end"], 1), (T - 4, 0.6), (T, 0)])
pad_lvl = env_points([(0, 0), (1.5, 0.8), (S["intro"], 1), (T - 3, 1), (T, 0)])
pluck_lvl = env_points([(0, 0.5), (S["pain"], 0.15), (S["turn"], 0.6), (S["intro"], 1), (S["obj1"], 0.5), (S["pricing"], 1), (T - 3, 0.8), (T, 0)])
music = pad * pad_lvl + pl * pluck_lvl + (kick * 0.55 + hat + bass) * beat_lvl

# riser before the brand reveal
def riser(d):
    n = int(d * SR); tt = np.arange(n) / SR
    nz = hp(rng.standard_normal(n), 0.2) * (tt / d) ** 2 * 0.25
    sw = np.sin(2 * np.pi * (200 * tt + 400 * tt ** 2 / d)) * (tt / d) ** 2 * 0.06
    return nz + sw
def put(buf, x, at):
    s = int(at * SR); e = min(N, s + len(x))
    if 0 <= s < N: buf[s:e] += x[: e - s]
put(music, riser(3.0), S["intro"] - 3.4)
put(music, riser(2.0), S["leak"] - 2.4)
put(music, riser(2.0), S["pricing"] - 2.4)

speech = np.zeros(N)
for l in lines: speech[int(l["start"] * SR):int(l["end"] * SR)] = 1
duck = lp(lp(speech, 1 / (0.12 * SR)), 1 / (0.12 * SR))
music *= 0.5 - 0.27 * duck

# ---------- sfx ----------
sfx = np.zeros(N)
def whoosh(d=0.6, g=0.5):
    n = int(d * SR); e = np.sin(np.pi * np.arange(n) / n) ** 2
    return lp(rng.standard_normal(n), 0.08) * e * g
def tick(f0=1800, g=0.12):
    n = int(0.08 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 60) * g
def pop_(g=0.22):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (300 + 900 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 35) * g
def impact(g=0.6):
    n = int(1.8 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * (45 + 70 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.5) + lp(rng.standard_normal(n), 0.05) * np.exp(-tt * 6) * 0.6) * g
def chime(f0=880, g=0.12):
    n = int(2.2 * SR); tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f0 * r * tt) * a for r, a in ((1, 1), (1.5, 0.5), (2, 0.3), (3, 0.12))) * np.exp(-tt * 2.6) * g
def stamp(g=0.7):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    return (lp(rng.standard_normal(n), 0.15) * np.exp(-tt * 25) + np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 12)) * g
def zip_(g=0.25):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 0.4) * np.sin(np.pi * tt / tt[-1]) * g
def key():
    n = int(0.04 * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 0.5) * np.exp(-tt * 120) * 0.12
def paper(g=0.12):
    n = int(0.3 * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 0.3) * np.exp(-tt * 14) * g

LEAD = 0.5
for sc, st in list(S.items())[1:]: put(sfx, whoosh(), st - LEAD - 0.3)
for sc in ["setup", "entry", "dashboard", "health", "elite", "pricing", "cta", "plan", "niche"]:
    for l in by(sc): put(sfx, pop_(0.14), l["start"])
put(sfx, zip_(), by("hook")[2]["start"] + (by("hook")[2]["end"] - by("hook")[2]["start"]) * 0.3)
put(sfx, impact(0.35), by("hook")[2]["start"] + (by("hook")[2]["end"] - by("hook")[2]["start"]) * 0.5)
for k in range(3): put(sfx, tick(1400 + k * 300, 0.18), by("pain")[1]["start"] + (by("pain")[1]["end"] - by("pain")[1]["start"]) * k * 0.33)
for k in range(8): put(sfx, paper(), by("pain")[3]["start"] + k * 4 / 30)
for l in by("pain")[6:10]: put(sfx, tick(500, 0.2), l["start"])
put(sfx, stamp(), by("pain")[10]["start"])
for k in range(14): put(sfx, paper(0.08), by("pain")[11]["start"] + k * 0.1)
for k in range(2): put(sfx, zip_(0.2), by("turn")[0]["start"] + k * (by("turn")[0]["end"] - by("turn")[0]["start"]) * 0.5 + 0.47)
put(sfx, impact(0.7), S["intro"]); put(sfx, chime(660, 0.14), S["intro"] + 0.1)
for k in range(12): put(sfx, paper(0.05), by("intro")[3]["start"] + k * 0.07)
put(sfx, whoosh(1.2, 0.5), by("intro")[4]["start"])
for i, l in enumerate(by("leak")[1:2]):
    for k in range(4): put(sfx, tick(600, 0.2), l["start"] + (l["end"] - l["start"]) * k * 0.22)
put(sfx, impact(0.5), S["leak"])
put(sfx, chime(990, 0.12), by("leak")[3]["start"] + 0.5)
counts = [6, 4, 4, 4, 3]
for li, l in enumerate(by("niches")):
    for k in range(counts[li]): put(sfx, tick(1200 + 120 * k, 0.1), l["start"] + (l["end"] - l["start"]) * k / counts[li])
for sc in ["obj1", "obj2", "obj3"]: put(sfx, impact(0.3), by(sc)[0 if sc != "obj1" else 1]["start"])
put(sfx, impact(0.45), by("obj2")[1]["start"])
put(sfx, chime(784, 0.12), by("obj3")[3]["start"] + 0.2)
for l in by("pricing")[1:6:2]: put(sfx, chime(1046, 0.07), l["start"] + (l["end"] - l["start"]) * 0.5)
cta1 = by("cta")[1]["start"]
for k in range(13): put(sfx, key(), cta1 + 2 / 30 + k * (28 / 30) / 13)
put(sfx, impact(0.6), S["end"] - 0.4); put(sfx, chime(880, 0.15), S["end"] - 0.3)

mix = vo + music + sfx * 0.7
os.makedirs(os.path.join(ROOT, "deliverables/audio"), exist_ok=True)
tmp = os.path.join(ROOT, "public/_raw.wav")
sf.write(tmp, mix / max(1, np.abs(mix).max()), SR, subtype="PCM_24")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(ROOT, "public/mix.wav")], check=True)
os.remove(tmp)
sf.write(os.path.join(ROOT, "deliverables/audio/voiceover.wav"), vo, SR, subtype="PCM_24")
sf.write(os.path.join(ROOT, "deliverables/audio/music.wav"), music, SR, subtype="PCM_24")
sf.write(os.path.join(ROOT, "deliverables/audio/sfx.wav"), sfx * 0.7, SR, subtype="PCM_24")
print("mix", round(N / SR, 1), "s")
