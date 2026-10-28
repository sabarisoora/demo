"""Synthesizes a quiet ambient bed + restrained SFX and mixes them under the voiceover.
Writes public/mix.wav (what the video plays) and deliverables/audio/{voiceover,music,sfx}.wav stems.
Usage: python3 -I scripts/make_mix.py"""
import json, os, subprocess
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
tl = json.load(open(os.path.join(ROOT, "src/timeline.json")))
vo, vsr = sf.read(os.path.join(ROOT, "public/vo.wav"))
vo = np.interp(np.arange(int(len(vo) * SR / vsr)) / SR, np.arange(len(vo)) / vsr, vo)
N = len(vo)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def lp(x, a):  # one-pole low-pass
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y

# --- music bed: slow chord pads, soft pulse, 4 chords x 4.8 s ---
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 67]]  # Am7 Fmaj7 C G
seg = 4.8
bed = np.zeros(N)
for k in range(int(N / SR / seg) + 1):
    s0 = int(k * seg * SR); s1 = min(N, int((k + 1) * seg * SR + 1.5 * SR))
    if s0 >= N: break
    tt = np.arange(s1 - s0) / SR
    env = np.minimum(1, tt / 1.2) * np.exp(-np.maximum(0, tt - seg) / 0.6)
    ch = chords[k % 4]
    for m in ch:
        for det in (-0.07, 0.07):
            bed[s0:s1] += np.sin(2 * np.pi * mtof(m + det) * tt) * env * 0.05
    bed[s0:s1] += np.sin(2 * np.pi * mtof(ch[0] - 12) * tt) * env * 0.09
    # soft plucked arpeggio on eighths
    for j in range(8):
        p0 = s0 + int(j * seg / 8 * SR)
        if p0 >= N: break
        L = min(int(0.5 * SR), N - p0); pt = np.arange(L) / SR
        bed[p0:p0 + L] += np.sin(2 * np.pi * mtof(ch[[0, 2, 1, 3][j % 4]] + 12) * pt) * np.exp(-pt * 7) * 0.035
bed = np.tanh(bed * 1.2)

# fade in/out, and lift slightly at the end card
end_start = [l for l in tl["lines"] if l["scene"] == "end"][0]["start"]
bed *= np.clip(t / 2.0, 0, 1) * np.clip((t[-1] - t) / 3.0, 0, 1)

# duck under voice
speech = np.zeros(N)
for l in tl["lines"]:
    speech[int(l["start"] * SR):int(l["end"] * SR)] = 1
duck = lp(speech, 1 / (0.15 * SR))
bed *= (0.55 - 0.3 * duck) * (1 + 0.5 * np.clip((t - end_start) / 1.5, 0, 1) * (1 - duck))

# --- sfx: whoosh at each scene change, soft chime on logo reveals, ticks on prices ---
sfx = np.zeros(N)
def add(x, at):
    s = int(at * SR); e = min(N, s + len(x))
    if 0 <= s < N: sfx[s:e] += x[: e - s]
def whoosh(d=0.7):
    n = int(d * SR); nz = rng.standard_normal(n)
    env = np.sin(np.pi * np.arange(n) / n) ** 2
    return lp(nz, 0.06) * env * 0.5
def chime(f0=880):
    n = int(1.8 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * tt) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * tt) + 0.25 * np.sin(2 * np.pi * f0 * 2 * tt)) * np.exp(-tt * 3) * 0.12
def tick():
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 1600 * tt) * np.exp(-tt * 45) * 0.16
def low():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (55 + 30 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 2.2) * 0.35

scenes, seen = [], set()
for l in tl["lines"]:
    if l["scene"] not in seen: seen.add(l["scene"]); scenes.append((l["scene"], l["start"]))
for name, st in scenes[1:]:
    add(whoosh(), st - 0.5 - 0.35)
by = lambda sc: [l for l in tl["lines"] if l["scene"] == sc]
add(chime(660), by("realize")[-1]["start"] + 0.1); add(low(), by("realize")[-1]["start"] + 0.1)
add(chime(880), by("intro")[0]["start"] - 0.4); add(low(), by("intro")[0]["start"] - 0.4)
for l in by("pricing")[1:4]: add(tick(), l["start"] + (l["end"] - l["start"]) * 0.55 / 1.0)
for l in by("editions")[:1]:
    d = l["end"] - l["start"]
    for fr in (0.42, 0.66, 0.84): add(tick(), l["start"] + d * fr)
add(chime(990), by("end")[0]["start"] - 0.4); add(low(), by("end")[0]["start"] - 0.4)

mix = vo * 1.0 + bed * 0.5 + sfx * 0.6
os.makedirs(os.path.join(ROOT, "deliverables/audio"), exist_ok=True)
tmp = os.path.join(ROOT, "public/_raw.wav")
sf.write(tmp, mix / max(1, np.abs(mix).max()), SR, subtype="PCM_24")
# web-standard loudness: -16 LUFS integrated, -1.5 dBTP
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(ROOT, "public/mix.wav")], check=True)
os.remove(tmp)
sf.write(os.path.join(ROOT, "deliverables/audio/voiceover.wav"), vo, SR, subtype="PCM_24")
sf.write(os.path.join(ROOT, "deliverables/audio/music.wav"), bed * 0.5, SR, subtype="PCM_24")
sf.write(os.path.join(ROOT, "deliverables/audio/sfx.wav"), sfx * 0.6, SR, subtype="PCM_24")
print("mix done", N / SR)
