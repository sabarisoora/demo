"""Homepage VSL audio: voice (Kokoro) + real word timings (faster-whisper) + bright score + sfx on word cues.
Writes home/timeline.json, home/cues.json, home/mix.wav, home/subtitles.srt/.vtt.
Usage: python3 -I home/home_audio.py <kokoro dir>"""
import difflib, json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import lfilter, resample_poly

BASE = os.path.dirname(os.path.abspath(__file__))
MODEL = sys.argv[1]
HERE = os.path.join(BASE, sys.argv[2]) if len(sys.argv) > 2 else BASE  # variant dir (e.g. home/short) with its own spec.json
SPEC = json.load(open(f"{HERE}/spec.json"))["lines"]
VOICE, SPEED = "af_heart", 1.05
START, GAP, SCENE_GAP, TAIL = 0.9, 0.42, 1.05, 4.5
LEAD = 0.15  # picture + sfx land this much before the spoken word

from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel
k = Kokoro(os.path.join(MODEL, "kokoro-v1.0.onnx"), os.path.join(MODEL, "voices-v1.0.bin"))
ASR = WhisperModel("base.en", device="cpu", compute_type="int8")
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())

def trim(a, sr, thr=0.008):
    i = np.where(np.abs(a) > thr)[0]
    return a if len(i) == 0 else a[max(0, i[0] - int(0.02 * sr)): i[-1] + int(0.06 * sr)]

def align(sub, say, a, sr, t0, d):
    words = sub.split()
    x = resample_poly(a, 2, 3).astype(np.float32)
    segs, _ = ASR.transcribe(x, word_timestamps=True, beam_size=1, language="en", initial_prompt=say, condition_on_previous_text=False, vad_filter=False)
    hw = [(norm(w.word), w.start) for sg in segs for w in sg.words]
    st = [None] * len(words)
    if hw:
        A_ = [norm(w) for w in words]; B_ = [h[0] for h in hw]
        for blk in difflib.SequenceMatcher(None, A_, B_, autojunk=False).get_matching_blocks():
            for q in range(blk.size): st[blk.a + q] = hw[blk.b + q][1]
    st[0] = 0.0 if st[0] is None else min(st[0], 0.15)
    known = [(q, v) for q, v in enumerate(st) if v is not None]
    out = []
    for q in range(len(words)):
        if st[q] is not None: out.append(st[q]); continue
        lo = max((kv for kv in known if kv[0] < q), key=lambda kv: kv[0], default=(0, 0.0))
        hi = min((kv for kv in known if kv[0] > q), key=lambda kv: kv[0], default=(len(words), d))
        out.append(lo[1] + (hi[1] - lo[1]) * (q - lo[0]) / max(1, hi[0] - lo[0]))
    for q in range(1, len(out)): out[q] = max(out[q], out[q - 1] + 0.03)
    return [{"w": w, "s": round(t0 + min(v, d - 0.05), 3)} for w, v in zip(words, out)]

# ---------- voice + timeline (cached: home/_vo.npz holds per-line audio keyed by the spoken text) ----------
CACHE = f"{BASE}/_vo.npz"
cache = dict(np.load(CACHE, allow_pickle=True)) if os.path.exists(CACHE) else {}
lines, t, prev = [], START, None
for scene, sub, say, cues in SPEC:
    say = say or sub
    key = f"{VOICE}|{SPEED}|{say}"
    if key in cache: a, sr = cache[key], 24000
    else: a, sr = k.create(say, voice=VOICE, speed=SPEED, lang="en-us"); a = trim(a, sr); cache[key] = a
    if prev is not None: t += SCENE_GAP if scene != prev else GAP
    d = len(a) / sr
    lines.append({"scene": scene, "sub": sub, "start": round(t, 3), "end": round(t + d, 3), "words": align(sub, say, a, sr, t, d), "cues": cues, "audio": a})
    t += d; prev = scene
    print(f"{scene:7} {lines[-1]['start']:7.2f} {sub[:60]}", flush=True)
np.savez(CACHE, **cache)
TOTAL = t + TAIL
VSR = 24000
vo = np.zeros(int(TOTAL * VSR) + 1, np.float32)
for c in lines:
    s = int(c["start"] * VSR); vo[s:s + len(c["audio"])] += c["audio"]
vo = vo / max(1e-6, np.abs(vo).max()) * 0.9

# cue times (absolute seconds)
CUES = []
for i, c in enumerate(lines):
    ws = c["words"]; used = set()
    for kind, anchor in c["cues"]:
        q = next((j for j, w in enumerate(ws) if norm(w["w"]) == norm(anchor) and j not in used), None)
        if q is None: raise SystemExit(f"anchor {anchor!r} not found in {c['sub']!r}")
        used.add(q)
        CUES.append({"line": i, "kind": kind, "t": round(max(0.0, ws[q]["s"] - LEAD), 3), "word": q})
json.dump({"duration": round(TOTAL, 3), "lead": LEAD, "lines": [{k2: v for k2, v in c.items() if k2 != "audio"} for c in lines]}, open(f"{HERE}/timeline.json", "w"), indent=1)
json.dump(CUES, open(f"{HERE}/cues.json", "w"))

def ts(x, sep): return f"{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d}{sep}{int(round((x%1)*1000))%1000:03d}"
with open(f"{HERE}/subtitles.srt", "w") as f:
    for i, c in enumerate(lines, 1): f.write(f"{i}\n{ts(c['start'], ',')} --> {ts(c['end'] + .15, ',')}\n{c['sub']}\n\n")
with open(f"{HERE}/subtitles.vtt", "w") as f:
    f.write("WEBVTT\n\n")
    for c in lines: f.write(f"{ts(c['start'], '.')} --> {ts(c['end'] + .15, '.')}\n{c['sub']}\n\n")

# ---------- score: bright pop, 118 bpm, C G Am F ----------
SR = 48000
vo = np.interp(np.arange(int(len(vo) * SR / VSR)) / SR, np.arange(len(vo)) / VSR, vo)
N = len(vo); tt_all = np.arange(N) / SR; T = tt_all[-1]
rng = np.random.default_rng(7)
lp = lambda x, a: lfilter([a], [1, a - 1], x)
hp = lambda x, a: x - lp(x, a)
mt = lambda m: 440 * 2 ** ((m - 69) / 12)
TT = lambda d: np.arange(int(d * SR)) / SR
def put(b, x, at):
    s = int(at * SR); e = min(N, s + len(x))
    if s < 0: x = x[-s:]; s = 0
    if s < N and e > s: b[s:e] += x[: e - s]
S = {}
for l in lines: S.setdefault(l["scene"], l["start"])
BPM = 118; b = 60 / BPM; bar = 4 * b
prog = [[48, 55, 60, 64, 67], [43, 55, 59, 62, 67], [45, 57, 60, 64, 69], [41, 53, 57, 60, 65]]  # C G Am F
pad = np.zeros(N); pluck = np.zeros(N); bell = np.zeros(N); kick = np.zeros(N); clap = np.zeros(N); shk = np.zeros(N); bass = np.zeros(N)
tri = lambda ph: 2 / np.pi * np.arcsin(np.sin(ph))
for kb in range(int(T / bar) + 2):
    s0 = kb * bar; ch = prog[kb % 4]
    d = bar + 0.8; tt = TT(d); env = np.minimum(1, tt / 0.25) * np.exp(-np.maximum(0, tt - bar) / 0.3)
    for m in ch[1:4]:
        for det in (-0.06, 0.06):
            put(pad, tri(2 * np.pi * mt(m + 12 + det) * tt) * env * 0.016, s0)
    for j in range(8):  # 8th-note pluck arp, bright register
        tj = s0 + j * b / 2; t2 = TT(0.3); n = ch[[1, 2, 3, 4, 3, 2, 4, 3][j]] + 12
        put(pluck, (tri(2 * np.pi * mt(n) * t2) + 0.35 * np.sin(4 * np.pi * mt(n) * t2)) * np.exp(-t2 * 13) * 0.06, tj)
    t3 = TT(1.6); put(bell, sum(np.sin(2 * np.pi * mt(ch[4] + 24) * r * t3) * a_ for r, a_ in ((1, 1), (2.76, 0.25), (5.4, 0.08))) * np.exp(-t3 * 2.6) * 0.028, s0)
    for j in range(4):
        tj = s0 + j * b
        kt = TT(0.3); put(kick, np.sin(2 * np.pi * (52 + 110 * np.exp(-kt * 40)) * kt) * np.exp(-kt * 10) * 0.55, tj)
        if j % 2 == 1:
            ct = TT(0.22)
            put(clap, sum(hp(rng.standard_normal(len(ct)), 0.35) * np.exp(-np.maximum(0, ct - o) * 30) * (ct >= o) for o in (0, 0.012, 0.024)) * 0.12, tj)
        for h in range(4):
            ht = TT(0.04); put(shk, hp(rng.standard_normal(len(ht)), 0.7) * np.exp(-ht * 90) * (0.05 if h % 2 else 0.028), tj + h * b / 4)
        bt = TT(b * 0.85); put(bass, (np.sin(2 * np.pi * mt(ch[0] - 12) * bt) + 0.3 * tri(2 * np.pi * mt(ch[0]) * bt)) * np.minimum(1, bt / 0.01) * np.exp(-bt * 2.2) * 0.17, tj + b / 2 * 0)
def env(points):
    pts = sorted(points, key=lambda p: p[0])
    xs, ys = [], []
    for x_, y_ in pts:
        if xs and x_ <= xs[-1]: x_ = xs[-1] + 1e-3
        xs.append(x_); ys.append(y_)
    return np.interp(tt_all, xs, ys)
def E(k_):
    if k_ in S: return S[k_]
    nxt = {"blind": "reveal", "how": "cta"}.get(k_)
    return S.get(nxt, T * 0.5) if nxt else T * 0.5
drums = env([(0, 0), (E("hook"), 0), (E("blind") - 0.3, 0.0), (E("blind"), 0.45), (E("reveal") - 0.2, 0.45), (E("reveal") + 0.3, 1), (E("how") - 0.3, 1), (E("how"), 0.55), (E("cta") - 0.3, 0.55), (E("cta"), 1), (T - 3.5, 1), (T - 1.0, 0), (T, 0)])
plucks = env([(0, 0.55), (E("blind"), 0.7), (E("reveal"), 1), (T - 2, 1), (T, 0)])
pads = env([(0, 0), (0.4, 1), (T - 1, 1), (T, 0)])
music = pad * pads + pluck * plucks + bell * pads + (kick + clap + shk + bass) * drums
# soft clock tick bed under the hook
tick_bed = np.zeros(N)
for kq in range(int((E("blind") - 0.5) / (b))):
    t4 = TT(0.03); put(tick_bed, hp(rng.standard_normal(len(t4)), 0.6) * np.exp(-t4 * 140) * (0.05 if kq % 2 else 0.03), 0.4 + kq * b)
music += tick_bed
speech = np.zeros(N)
for l in lines: speech[int(l["start"] * SR):int(l["end"] * SR)] = 1
duck = lp(lp(speech, 1 / (0.08 * SR)), 1 / (0.08 * SR))
music *= 0.5 - 0.28 * duck

# ---------- sfx ----------
def whoosh(d=0.5, g=0.32):
    n = int(d * SR); e = np.sin(np.pi * np.arange(n) / n) ** 2
    x = rng.standard_normal(n); out = np.zeros(n); a_ = np.linspace(0.04, 0.25, n)
    y = 0.0
    for i in range(0, n, 64):  # swept low-pass
        seg = x[i:i + 64]; out[i:i + 64] = lfilter([a_[i]], [1, a_[i] - 1], seg, zi=[y])[0]; y = out[min(n, i + 64) - 1] * (1 - a_[i])
    return out * e * g * 2.2
def swish(g=0.26): n = int(0.26 * SR); e = np.sin(np.pi * np.arange(n) / n) ** 3; return hp(rng.standard_normal(n), 0.35) * e * g
def pop(g=0.24, f0=950): tt = TT(0.11); return np.sin(2 * np.pi * (f0 * 0.45 + f0 * np.exp(-tt * 42)) * tt) * np.exp(-tt * 34) * g
def ding(f0=1568, g=0.17): tt = TT(1.1); return sum(np.sin(2 * np.pi * f0 * r * tt) * a_ for r, a_ in ((1, 1), (2.0, 0.35), (3.0, 0.12))) * np.exp(-tt * 3.8) * g
def tick(g=0.2): tt = TT(0.05); return hp(rng.standard_normal(len(tt)), 0.55) * np.exp(-tt * 120) * g + np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 160) * g * 0.6
def hit(g=0.45): tt = TT(0.6); return (np.sin(2 * np.pi * (70 + 130 * np.exp(-tt * 28)) * tt) * np.exp(-tt * 8) + hp(rng.standard_normal(len(tt)), 0.4) * np.exp(-tt * 45) * 0.35) * g
def addl(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[: len(x)] += x
    return out
def soft(g=0.4): tt = TT(1.2); return addl(np.sin(2 * np.pi * (48 + 60 * np.exp(-tt * 12)) * tt) * np.exp(-tt * 3.5) * g, ding(784, 0.08))
def strike(g=0.3): tt = TT(0.32); return hp(rng.standard_normal(len(tt)), 0.25) * np.sin(np.pi * np.minimum(1, tt / 0.32)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 34 * tt))) * g
def glitch(g=0.16):
    tt = TT(0.3); x = np.sin(2 * np.pi * 660 * tt * (1 + 0.5 * (rng.random(len(tt)) > 0.96))) * (rng.random(len(tt)) > 0.45)
    return hp(x.astype(float), 0.2) * np.exp(-tt * 7) * g
def riser(d=1.0, g=0.22): tt = TT(d); return (hp(rng.standard_normal(len(tt)), 0.3) * (tt / d) ** 2 * 0.5 + np.sin(2 * np.pi * (300 * tt + 700 * tt ** 2 / d)) * (tt / d) ** 2 * 0.3) * g
def sparkle(g=0.1):
    out = np.zeros(int(0.9 * SR))
    for j, f0 in enumerate((2637, 3136, 3951, 4699, 5274)):
        x = ding(f0, g)[: int(0.5 * SR)]; s = int(j * 0.045 * SR); out[s:s + len(x)] += x[: len(out) - s]
    return out
def impact(g=0.5):
    tt = TT(1.5); return (np.sin(2 * np.pi * (44 + 90 * np.exp(-tt * 10)) * tt) * np.exp(-tt * 3) + lp(rng.standard_normal(len(tt)), 0.08) * np.exp(-tt * 9) * 0.5) * g
def chime(g=0.14):
    out = np.zeros(int(1.6 * SR))
    for j, f0 in enumerate((1047, 1319, 1568, 2093)):
        x = ding(f0, g); s = int(j * 0.09 * SR); out[s:s + len(x)] += x[: len(out) - s]
    return out
def stamp(g=0.45): tt = TT(0.4); return (lp(rng.standard_normal(len(tt)), 0.2) * np.exp(-tt * 28) + np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 12)) * g
def cash(g=0.24): return np.concatenate([ding(2637, g * 0.7)[: int(0.05 * SR)], ding(3136, g)])
def click(g=0.3): tt = TT(0.04); return (np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 200) + hp(rng.standard_normal(len(tt)), 0.6) * np.exp(-tt * 180) * 0.5) * g
def typing(g=0.16):
    out = np.zeros(int(1.2 * SR))
    for j in range(11):
        x = click(g * (0.7 + 0.5 * rng.random())); s = int((j * 0.1 + rng.random() * 0.03) * SR); out[s:s + len(x)] += x
    return out
def box(g=0.4): return addl(lp(rng.standard_normal(int(0.25 * SR)), 0.12) * np.exp(-TT(0.25) * 18) * g * 2, swish(0.15))
def drop(g=0.3): tt = TT(0.5); return np.sin(2 * np.pi * (1400 * np.exp(-tt * 5) + 200) * tt) * np.exp(-tt * 6) * g * 0.5
def doors(g=0.3): return addl(whoosh(0.7, g), np.concatenate([np.zeros(int(0.25 * SR)), stamp(0.2)]))

fx = np.zeros(N)
up_i = 0
for c in CUES:
    kd, at = c["kind"], c["t"]
    if kd == "up":  # rising pentatonic pops as the wall lights up
        scale = [0, 2, 4, 7, 9]; st_ = 72 + scale[up_i % 5] + 12 * (up_i // 5); up_i += 1
        put(fx, pop(0.2, mt(st_) * 1.0), at); put(fx, ding(mt(st_ + 12), 0.05)[: int(0.4 * SR)], at); continue
    if kd == "count":
        for j in range(14): put(fx, tick(0.12), at + j * 0.045)
        continue
    if kd == "riser": put(fx, riser(1.0), at - 0.3); continue
    if kd == "impact": put(fx, impact(), at); put(fx, sparkle(0.09), at + 0.02); put(fx, whoosh(0.5, 0.2), at - 0.4); continue
    F = {"tick": tick, "ding": ding, "whoosh": lambda: whoosh(), "swish": swish, "pop": pop, "hit": hit, "soft": soft, "strike": strike, "glitch": glitch,
         "sparkle": sparkle, "chime": chime, "stamp": stamp, "cash": cash, "click": click, "type": typing, "box": box, "drop": drop, "doors": doors}[kd]
    put(fx, F(), at - (0.25 if kd in ("whoosh", "doors") else 0))
# a light whoosh into every scene
for sc, st in list(S.items())[1:]: put(fx, swish(0.18), st - SCENE_GAP * 0.6)

mix = vo * 1.0 + music + fx * 0.55
raw = f"{HERE}/_raw.wav"
sf.write(raw, mix / max(1, np.abs(mix).max()), SR, subtype="PCM_24")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), f"{HERE}/mix.wav"], check=True)
os.remove(raw)
print("done", round(TOTAL, 1), "s,", len(CUES), "cues")
