"""Beat + SFX track for the reel (voice comes from the footage in Remotion; this is music+fx only).
Writes public/sfx.wav. Usage: python3 -I scripts/make_sfx.py"""
import json, os
import numpy as np, soundfile as sf
from scipy.signal import lfilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = json.load(open(os.path.join(ROOT, "src/edit.json")))
SR = 48000; FPS = 30
segs = E["segments"]; ev = E["events"]
outs, t = [], 0.0
for g in segs: outs.append(t); t += g["e"] - g["s"]
SPEECH_END = t; TOTAL = t + E["sting"]
def out(src):
    for i, g in enumerate(segs):
        if g["s"] - 1e-3 <= src <= g["e"] + 1e-3: return outs[i] + src - g["s"]
    for i, g in enumerate(segs):
        if src < g["s"]: return outs[i]
    return SPEECH_END
fr = lambda sec: round(sec * FPS) / FPS  # snap to the video frame grid
N = int(TOTAL * SR) + SR // 2
rng = np.random.default_rng(3)
lp = lambda x, a: lfilter([a], [1, a - 1], x)
hp = lambda x, a: x - lp(x, a)
def put(buf, x, at):
    s = int(at * SR); e = min(N, s + len(x))
    if 0 <= s < N: buf[s:e] += x[: e - s]
T = lambda d: np.arange(int(d * SR)) / SR

# ---- beat: 140 bpm trap-ish, quiet under the voice ----
mus = np.zeros(N); BPM = 140; b = 60 / BPM
notes = [45, 45, 48, 43]
for i in range(int(TOTAL / b) + 1):
    t0 = i * b
    if i % 4 in (0,) or (i % 8 == 6):
        tt = T(0.35); put(mus, np.sin(2*np.pi*(45 + 120*np.exp(-tt*35))*tt) * np.exp(-tt*7) * 0.55, t0)
    if i % 4 == 2:
        tt = T(0.18); put(mus, hp(rng.standard_normal(len(tt)), 0.35) * np.exp(-tt*22) * 0.25 + np.sin(2*np.pi*190*tt)*np.exp(-tt*30)*0.15, t0)
    for k in range(2 if i % 4 != 3 else 4):
        tt = T(0.05); put(mus, hp(rng.standard_normal(len(tt)), 0.6) * np.exp(-tt*90) * 0.07, t0 + k * b / (2 if i % 4 != 3 else 4))
    m = notes[(i // 8) % 4]; tt = T(b * 0.95)
    put(mus, np.tanh(3*np.sin(2*np.pi*440*2**((m-12-69)/12)*tt)) * np.exp(-tt*2.5) * 0.10, t0)
    if i % 2 == 0:
        tt = T(0.25); f0 = 440*2**((m+12+[0,3,7,10][(i//2)%4]-69)/12)
        put(mus, np.sin(2*np.pi*f0*tt) * np.exp(-tt*12) * 0.06, t0)
t = np.arange(N) / SR
mus *= np.clip(t / 0.3, 0, 1) * np.where(t > SPEECH_END, 1.6, 1.0) * np.clip((TOTAL + 0.3 - t) / 0.6, 0, 1)
mus *= 0.32

# ---- sfx ----
fx = np.zeros(N)
def whoosh(d=0.32, g=0.35):
    n = int(d*SR); e = np.sin(np.pi*np.arange(n)/n)**2; return lp(rng.standard_normal(n), 0.12) * e * g
def pop(g=0.35, f=900):
    tt = T(0.1); return np.sin(2*np.pi*(f*0.4 + f*np.exp(-tt*40))*tt) * np.exp(-tt*38) * g
def impact(g=0.8):
    tt = T(1.2); return (np.sin(2*np.pi*(40 + 80*np.exp(-tt*10))*tt)*np.exp(-tt*3) + lp(rng.standard_normal(len(tt)),0.08)*np.exp(-tt*8)*0.7) * g
def stamp(g=0.9):
    tt = T(0.4); return (lp(rng.standard_normal(len(tt)),0.2)*np.exp(-tt*28) + np.sin(2*np.pi*70*tt)*np.exp(-tt*10)) * g
def ding(f=1320, g=0.25):
    tt = T(1.0); return sum(np.sin(2*np.pi*f*r*tt)*a for r,a in ((1,1),(2,.4),(3,.15)))*np.exp(-tt*4)*g
def buzz(g=0.3):
    tt = T(0.35); return np.sign(np.sin(2*np.pi*110*tt)) * np.exp(-tt*6) * g * 0.6
def key(g=0.12):
    tt = T(0.03); return hp(rng.standard_normal(len(tt)), 0.5) * np.exp(-tt*150) * g
def riser(d=0.8, g=0.3):
    tt = T(d); return (hp(rng.standard_normal(len(tt)),0.3)*(tt/d)**2*0.5 + np.sin(2*np.pi*(300*tt + 900*tt**2/d))*(tt/d)**2*0.2) * g
def boing(g=0.25):
    tt = T(0.3); return np.sin(2*np.pi*(300+200*np.sin(tt*40))*tt)*np.exp(-tt*9)*g

for o in outs[1:]: put(fx, whoosh(), fr(o) - 0.16)
for g in segs:
    for k in range(2, len(g["z"]), 2): put(fx, whoosh(0.22, 0.22), fr(out(g["z"][k])) - 0.1)
O = {k: fr(out(v)) for k, v in ev.items()}
put(fx, impact(), O["approved"]); put(fx, stamp(), O["approved"]); put(fx, ding(1568, 0.2), O["approved"] + 0.05)
put(fx, impact(0.5), O["tough"]); put(fx, buzz(0.25), O["tough"])
put(fx, ding(1320, 0.22), O["approved2"]); put(fx, pop(0.3), O["approved2"])
put(fx, buzz(0.35), O["notAll"]); put(fx, pop(0.3, 600), O["notAll"])
put(fx, pop(0.3), O["structure"]); put(fx, boing(), O["watch"])
put(fx, pop(0.3), O["research"])
for k in range(28): put(fx, key(), O["research"] + 0.2 + k * (1.0 / 28) + rng.random() * 0.01)
for i in range(4): put(fx, pop(0.28, 700 + i*150), O["question"] + i * 5 / FPS)
put(fx, riser(0.8), O["digital"] - 0.8); put(fx, impact(0.9), O["digital"]); put(fx, whoosh(0.4, 0.5), O["digital"])
for i in range(5): put(fx, pop(0.22, 500 + i*120), O["digital"] + (8 + i*3) / FPS)
put(fx, whoosh(0.3, 0.4), O["digital"] + 41 / FPS)
put(fx, pop(0.3), O["whatIs"]); put(fx, pop(0.3, 1200), O["twoTypes"])
put(fx, whoosh(0.3, 0.45), O["versus"]); put(fx, whoosh(0.3, 0.45), O["versus"] + 4 / FPS); put(fx, impact(0.6), O["versus"] + 8 / FPS)
put(fx, riser(0.5, 0.25), SPEECH_END - 0.5); put(fx, impact(0.9), SPEECH_END); put(fx, ding(1046, 0.25), SPEECH_END + 0.15)

mix = mus + fx * 0.75
mix = mix / max(1.0, np.abs(mix).max() / 0.9)
sf.write(os.path.join(ROOT, "public/sfx.wav"), np.stack([mix, mix], 1), SR, subtype="PCM_24")
print(f"sfx {TOTAL:.2f}s, speech {SPEECH_END:.2f}s")
