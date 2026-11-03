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
LEAD = 0.2  # seconds the picture leads the voice (must match VIS_LEAD frames in src/gen/lib.ts)
rows = SPEC["lines"]
from kokoro_onnx import Kokoro
k = Kokoro(os.path.join(MODEL, "kokoro-v1.0.onnx"), os.path.join(MODEL, "voices-v1.0.bin"))
import difflib
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
ASR = WhisperModel("base.en", device="cpu", compute_type="int8")
def norm(w): return re.sub(r"[^a-z0-9]", "", w.lower())
def align(sub, say, a, sr, t0, d):
    """Real word start times for the subtitle words: whisper word timestamps on the spoken audio, matched to the
    subtitle text; words it can't match are interpolated between their matched neighbours."""
    words = sub.split()
    try:
        x = resample_poly(a, 2, 3).astype(np.float32) if sr == 24000 else a.astype(np.float32)
        segs, _ = ASR.transcribe(x, word_timestamps=True, beam_size=1, language="en", initial_prompt=say, condition_on_previous_text=False, vad_filter=False)
        hw = [(norm(w.word), w.start) for sg in segs for w in sg.words]
    except Exception as e:
        print("align failed:", e); hw = []
    st = [None] * len(words)
    if hw:
        A_ = [norm(w) for w in words]; B_ = [h[0] for h in hw]
        for blk in difflib.SequenceMatcher(None, A_, B_, autojunk=False).get_matching_blocks():
            for q in range(blk.size): st[blk.a + q] = hw[blk.b + q][1]
    st[0] = 0.0 if st[0] is None else min(st[0], 0.15)
    # monotonic + interpolate gaps
    known = [(q, v) for q, v in enumerate(st) if v is not None]
    out = []
    for q in range(len(words)):
        if st[q] is not None: out.append(st[q]); continue
        lo = max((kv for kv in known if kv[0] < q), key=lambda kv: kv[0], default=(0, 0.0))
        hi = min((kv for kv in known if kv[0] > q), key=lambda kv: kv[0], default=(len(words), d))
        out.append(lo[1] + (hi[1] - lo[1]) * (q - lo[0]) / max(1, hi[0] - lo[0]))
    for q in range(1, len(out)): out[q] = max(out[q], out[q - 1] + 0.03)
    return [{"w": w, "s": round(t0 + min(v, d - 0.05), 3)} for w, v in zip(words, out)]

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
    wt = align(sub, say, a, sr, t, d)
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

# ---------- word sync: when a highlighted label / item is spoken, as a fraction of its block ----------
STOP = set("the a an and of for to in on your you with by at as is it its every each per vs versus".split())
def toks(q): return [norm(x) for x in re.sub(r"\([^)]*\)", " ", q).replace("/", " ").split() if norm(x) and norm(x) not in STOP]
def spoken(i, j, q, after=-1.0):
    """block fraction where the words of q are first spoken in lines i..j (after a given time), else None"""
    tq = toks(q)
    if not tq: return None
    W = [(norm(w["w"]), w["s"]) for r in range(i, j + 1) for w in lines[r]["words"]]
    best = None
    for p0, (w, t0) in enumerate(W):
        if t0 <= after: continue
        if not (w == tq[0] or (len(tq[0]) >= 5 and (w.startswith(tq[0][:5]) or tq[0].startswith(w[:5]) and len(w) >= 5))): continue
        sc = 1 + sum(1 for a_, b_ in zip(tq[1:], [x[0] for x in W[p0 + 1:p0 + len(tq)]]) if a_ == b_ or a_[:4] == b_[:4])
        if best is None or sc > best[0]: best = (sc, t0)
        if sc == len(tq): break
    if not best: return None
    T0, T1 = lines[i]["start"], lines[j]["end"]
    return round(max(0.0, min(0.97, (best[1] - T0) / max(0.1, T1 - T0))), 3)
blocks0 = []
for idx, r in enumerate(rows):
    v = r[3] if len(r) > 3 else None
    if idx == 0 or v or r[0] != rows[idx - 1][0]: blocks0.append([idx, idx, v])
    else: blocks0[-1][1] = idx
SYNC = {}
def ordered(ps, base):
    out, last = [], -1
    for p_, b_ in zip(ps, base):
        x = p_ if p_ is not None and p_ > last + 0.02 else max(b_, last + 0.06)
        out.append(round(min(0.97, x), 3)); last = out[-1]
    return out
for i, j, v in blocks0:
    if not v: continue
    t = v.get("t")
    if t in ("sheet", "hero") and v.get("hi"):
        h = v["hi"]; m = len(h)
        base = [hh[4] if len(hh) > 4 and hh[4] is not None else 0.28 + (k_ * 0.55 / (m - 1) if m > 1 else 0.1) for k_, hh in enumerate(h)]
        ps = [spoken(i, j, hh[1]) if len(hh) > 1 and hh[1] else None for hh in h]
        ps = [p_ if p_ is not None else spoken(i, j, hh[0]) for p_, hh in zip(ps, h)]
        SYNC[i] = {"hi": ordered(ps, base)}
    elif t == "mini":
        it = v["items"]; n_ = len(it)
        base = [0.04 + k_ * 0.6 / n_ for k_ in range(n_)]
        SYNC[i] = {"at": ordered([spoken(i, j, x.get("label", "")) for x in it], base)}
    elif t == "checklist":
        it = v["items"]; n_ = len(it)
        base = [0.12 + k_ * 0.78 / n_ for k_ in range(n_)]
        SYNC[i] = {"at": ordered([spoken(i, j, x) for x in it], base)}
    elif t == "fixes":
        SYNC[i] = {"flip": [spoken(i, j, sh, after=lines[min(i + 1 + k_, j)]["start"] - 0.01) or ((lines[min(i + 1 + k_, j)]["start"] + lines[min(i + 1 + k_, j)]["end"]) / 2 - lines[i]["start"]) / max(0.1, lines[j]["end"] - lines[i]["start"]) for k_, (_, sh) in enumerate(v["items"])]}
    elif t == "qa" and v.get("chips"):
        ch = v["chips"]; n_ = len(ch)
        base = [0.35 + k_ * 0.5 / max(1, n_) for k_ in range(n_)]
        SYNC[i] = {"at": ordered([spoken(i, j, x) for x in ch], base)}
json.dump(SYNC, open(f"{BUILD}/sync.json", "w"))
print("synced blocks", len(SYNC), "items", sum(len(x.get("hi", x.get("at", []))) for x in SYNC.values()))

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
    elif t == "fixes":
        cue(i, i, 0.02, "pop")
        for k_ in range(n("items")): cue(i, i, 0.25 + 0.6 * k_ / n("items"), "error")
        for p_ in SYNC[i]["flip"]: cue(i, j, p_, "tick")
    elif t == "checklist": [cue(i, j, p_, "tick") for p_ in SYNC[i]["at"]]
    elif t == "papers": [cue(i, j, p, "shutter") for p in (0.3, 0.5)]
    elif t == "phone": cue(i, j, 0.1, "notif")
    elif t == "qa": cue(i, j, 0.0, "pop"); [cue(i, j, p_, "pop") for p_ in SYNC.get(i, {}).get("at", [])]
    elif t == "cover": cue(i, j, v.get("nAt", 0.6), "hit")
    elif t == "wall": cue(i, j, 0.0, "swish"); cue(i, j, v.get("inAt", 0.35), "pop"); cue(i, j, v.get("autoAt", 0.68), "pop")
    elif t == "grid": cue(i, j, 0.0, "swish"); [cue(i, j, 0.02 + k_ * 0.85 / n("tabs"), "pop") for k_ in range(n("tabs"))]
    elif t in ("sheet", "hero"):
        cue(i, j, 0.0, "swish")
        for p_ in SYNC.get(i, {}).get("hi", []): cue(i, j, p_, "pop")
    elif t == "mini": [cue(i, j, p_, "swish") for p_ in SYNC[i]["at"]]
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
    l = L[i]; at = fr(l["start"] + (l["end"] - l["start"]) * p) - LEAD  # visuals lead the voice by LEAD; sfx follow the visuals
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
