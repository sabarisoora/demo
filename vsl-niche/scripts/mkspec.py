"""Expand a compact niche definition (script/src/<slug>.py, a dict D) into script/n/<slug>.json.
Shared sections (reveal, Essential/Elite intros, leak, tax, guides, subscription answer, offer, CTA, end) are generated
from the facts in D so every niche stays consistent; hook, pain, tours and objections are written per niche.
Usage: python3 -I scripts/mkspec.py <slug>"""
import json, os, runpy, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = sys.argv[1]
D = runpy.run_path(f"{ROOT}/script/src/{slug}.py")["D"]
META = json.load(open(f"{ROOT}/assets/{slug}/meta.json"))
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def words(n):
    if n < 20: return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("-" + ONES[o] if o else "")
def cap(s): return s[0].upper() + s[1:]
def etab(k):
    hit = [t for t in META["elite"] if k.lower() in t.lower()]
    if not hit: raise SystemExit(f"no elite tab like {k!r}")
    return hit[0]

name = D["name"]; plain = name.replace("™", "")
ne, nx = D["n_ess"], D["n_elite"]
L = []
def add(scene, lines):
    for x in lines:
        sub, v = x[0], x[1] if len(x) > 1 else None
        say = x[2] if len(x) > 2 else None
        L.append([scene, sub, say, v])

add("hook", D["hook"])
add("pain", D["pain"])
add("turn", [
    [D.get("turn1", "That's not a work-ethic problem. It's a visibility problem."), {"t": "strike", "from": D.get("strike", "Work ethic"), "to": "Visibility."}],
    [D["turn2"], {"t": "converge", "text": "You already [have the data.]", "labels": D["labels"], "box": "One place."}],
    ["You just don't have one place that turns it into decisions."],
])
add("reveal", [
    [f"That's why we built the {name}.", None, f"That's why we built the {D.get('say_name', plain)}."],
    [f"A ready-built Excel system, made only for {D['aud']}."],
    ["Formulas, dashboards and reports are already built in. Tax set-aside too."],
    ["And it ships with sample data, so every dashboard works the moment you open it."],
])
add("who", [[w] for w in D["who_lines"]])
# ---- every sheet, in workbook order ----
SPD = "/tmp/claude-0/-home-user/79cdc2d5-92ff-5c6b-ba90-85f62602d77a/scratchpad/facts"
DESC = json.load(open(f"{SPD}/desc.json"))[slug]
INV = json.load(open(f"{SPD}/inv.json"))[slug]
import re
def exact(ed, t):
    tabs = META[ed]
    if t in tabs: return t
    hit = [x for x in tabs if t.lower() in x.lower()]
    if not hit: raise SystemExit(f"no {ed} tab like {t!r}")
    return hit[0]
def nice(tab):
    t = re.sub(r"^\d+\s*-?\s*", "", tab).replace("_", " ").strip()
    if t.isupper(): t = " ".join(w if w in ("&", "P&L", "KPI", "VAT", "ROI", "AR", "ADR", "NOI", "DSCR", "CAPEX") else w.capitalize() for w in t.split())
    return t.replace("Capex", "CapEx").replace("Pnl", "P&L").replace("P&l", "P&L").replace("Revpar", "RevPAR")
def hidden_phrase(names):
    m = {"Tax Rate Reference": "a tax-rate reference", "Core Engine": "the calculation engine", "Changelog": "a changelog"}
    out = []
    for n in names:
        k = next((v for kk, v in m.items() if kk.lower() in n.lower()), None)
        out.append(k or "a reference sheet")
    return out[0] if len(out) == 1 else ", ".join(out[:-1]) + " and " + out[-1]
BAD_DESC = re.compile(r"^(Data through|As of|Essential Edition|ELITE|Elite Edition|Executive Dashboard\s*·|Last 12 full months:|Rates shown|Latest full month|← START)", re.I)
def clean_desc(d):
    d = d.strip().rstrip(".:;")
    d = re.sub(r"\s*\(TM\)|™", "", d)
    d = d.replace(" / ", " or ").replace(" - ", ", ").replace(" — ", ", ").replace(" – ", ", ").replace("vs.", "versus")
    d = re.sub(r"\b([A-Z]+_[A-Z_]+)\b", lambda m: m.group(1).replace("_", " ").title(), d)
    d = re.sub(r"\s*\([^)]*\)", "", d)
    d = re.sub(r"(?i)^last 12 full months[,:]?\s*", "Over the last twelve months: ", d)
    d = re.sub(r"(?i)over the last 12 full months", "over the last twelve months", d)
    d = re.sub(r"(?i)\bin the last 12 full months", "in the last twelve months", d)
    d = re.sub(r"(?i)last 12 full months", "the last twelve months", d)
    d = re.sub(r"(?i)last-12-month", "last twelve months", d)
    d = d.replace("0-100", "zero-to-100").replace(" + ", " and ")
    d = re.sub(r"\b(the|your|from your|are the) the last", r"\1 last", d)
    d = d.replace("from your the", "from your")
    d = re.sub(r"\b[A-Z]{4,}\b", lambda m: m.group(0) if m.group(0) in ("CAPEX", "DSCR", "ROAS", "AOV") else "the " + m.group(0).lower() if m.group(0) == "SUMMARY" else m.group(0).lower(), d)
    d = re.sub(r"\s+", " ", d).strip(" ,")
    w = d.split()
    if len(w) > 26:
        cut = re.split(r"[;,]", d)
        acc = ""
        for c in cut:
            if len((acc + c).split()) > 24: break
            acc = (acc + "," + c) if acc else c
        d = acc or " ".join(w[:24])
    return d[0].upper() + d[1:]
def headers(ed, tab):
    rows = META["sheets"][f"{ed}::{tab}"]["rows"]
    bands = {}
    for r in rows:
        if r[2] < 0.02: continue
        t = r[0].strip()
        if not t or re.match(r"^[-$0-9.,%() /:#]+$", t) or re.match(r"^[A-Z]{1,4}-?\d+", t) or len(t) > 32: continue
        key = round((r[2] + r[4] / 2) * 60)
        bands.setdefault(key, []).append(r)
    for key in sorted(bands):
        b = sorted(bands[key], key=lambda r: r[1])
        if len(b) >= 3: return [r[0].strip() for r in b]
    return []
def labels(ed, tab):
    rows = META["sheets"][f"{ed}::{tab}"]["rows"]
    out = []
    for r in rows[1:]:
        t = r[0].strip()
        if not t or len(t) > 34 or len(t) < 4 or re.match(r"^[-$0-9.,%() /:#]+$", t) or re.match(r"^[A-Z]{1,4}-?\d+", t) or re.search(r"\d{4}", t) or t.endswith(":"): continue
        if t.lower() in (x.lower() for x in out) or t.lower() == nice(tab).lower(): continue
        out.append(t)
    return out
def auto_line(ed, tab, k):
    nm = nice(tab)
    d = DESC.get(f"{ed}::{tab}", {}).get("desc", "")
    low = nm.lower()
    if low == "start here": text = "Start Here shows how the workbook is organized, and where to begin."
    elif low == "glossary": text = "And a Glossary, with a plain-English definition for every term."
    elif low == "changelog": text = "Plus a Changelog of what changed in each version."
    elif low == "tax setup": text = "Tax Setup holds your country, currency and tax-rate presets."
    elif d and len(d) > 35 and not BAD_DESC.search(d) and "|" not in d: text = f"{nm}. {clean_desc(d)}."
    else:
        hs = [h for h in headers(ed, tab) if h.lower() != nm.lower()][:4]
        if len(hs) < 3: hs = labels(ed, tab)[:4]
        hs = [h.lower() if h.isupper() else h for h in hs]
        hs = [re.sub(r"\s*\([^)]*\)", "", h).replace(" / ", " or ").replace("% of", "percent of") for h in hs]
        text = f"{nm}: " + (", ".join(hs[:-1]) + " and " + hs[-1] if len(hs) >= 2 else "every number for this part of the business, in one place") + "."
    hs = headers(ed, tab)
    hi = [[hs[0], None, ["blue", "green", "amber", "cyan"][k % 4], "row", 0.35]] if hs else []
    if low == "start here":
        return [text, {"t": "sheet", "ed": ed, "tab": tab, "label": nm, "cam": "full", "zoom": False, "hi": []}, text]
    if k % 4 == 3:
        v = {"t": "hero", "ed": ed, "tab": tab, "text": f"[{nm}]", "size": 64, "hi": hi, "minW": 0.85}
    else:
        v = {"t": "sheet", "ed": ed, "tab": tab, "label": nm, "hi": hi, "minW": 0.85}
    say = text.replace("&", "and").replace("P and L", "P and L").replace("KPI", "K P I").replace("ROI", "R O I").replace("AR ", "A R ").replace("MRR", "M R R").replace("ARR", "A R R")
    return [text, v, say]

# featured lines written per niche, keyed by exact tab: list of [sub, v, say] (continuation lines follow)
FEAT = {}
def harvest(lines, default_ed):
    last = None
    for x in lines:
        v = x[1] if len(x) > 1 else None
        if v and v.get("t") in ("sheet", "hero") and v.get("tab"):
            ed = "ess" if v.get("ed") == "ess" else "elite"
            last = (ed, exact(ed, v["tab"])); FEAT.setdefault(last, []).append(list(x))
        elif v is None and last:
            FEAT[last].append(list(x))
        else:
            last = None
harvest(D["ess_tour"], "ess")
for _, lines in D["sections"]: harvest(lines, "elite")
tx = D.get("tax_hi", {})
if D.get("leak") is not False:
    lk = D["leak"]
    harvest([["Then there's the Profit Leak Detector™.", {"t": "hero", "ed": "elite", "tab": etab("Profit Leak"), "text": "The Profit Leak [Detector™]", "cam": "full", "minW": lk.get("minW", 0.7), "hi": lk["hi"]}, "Then there's the Profit Leak Detector."]] + [[x] for x in lk["lines"]], "elite")
harvest([
    ["The Tax Reserve Center works out a recommended reserve, and how much of it you've funded.", {"t": "sheet", "ed": "elite", "tab": etab("Tax Reserve"), "label": "Tax Reserve", "d": "what to set aside", "hi": tx.get("reserve", [["Recommended Tax Reserve $", "Recommended reserve", "green", "row"], ["Reserve Funded %", "Funded %", "cyan", "row"]])}],
    ["The Deduction Maximizer groups the year's expenses by category, to review with your accountant.", {"t": "sheet", "ed": "elite", "tab": etab("Deduction Maximizer"), "label": "Deduction Maximizer", "d": "by category", "hi": tx.get("deduct", [["Typically Deductible?", "Deductible?", "green", "cell"], ["Total Deductible", "Total", "cyan", "row"]])}],
    ["The Tax Readiness Center tracks due dates, and scores how ready your records are.", {"t": "sheet", "ed": "elite", "tab": etab("Tax Readiness"), "label": "Tax Readiness", "d": "due dates + score", "hi": tx.get("ready", [["TAX CALENDAR", "Due dates", "amber", "block"], ["TAX READINESS SCORE", "Readiness score", "green", "block"]])}],
    ["The Accountant Summary is a print-ready package to hand over at filing time.", {"t": "sheet", "ed": "elite", "tab": etab("Accountant Summary"), "label": "Accountant Summary", "d": "print-ready", "hi": tx.get("acct", [["Accountant Package Status:", "Package status", "green", "row"], ["Net Profit", "P&L summary", "blue", "row"]])}],
], "elite")

def tour(ed, tabs, start_k=0):
    out = []
    for k, t in enumerate(tabs):
        if (ed, t) in FEAT:
            ls = [list(x) for x in FEAT[(ed, t)]]
            v = ls[0][1]
            if v.get("t") == "sheet":
                v.setdefault("label", nice(t)); v.pop("d", None); v["d"] = None
            out += ls
        else:
            out.append(auto_line(ed, t, start_k + k))
    return out

ve, vx = len(META["ess"]), len(META["elite"])
he, hx = INV["ess_hidden"], INV["elite_hidden"]
ess_cover = f"Let me show you what's inside. Start with Essential: {words(ve)} sheets you work in" + (f", plus {hidden_phrase(he)} behind the scenes." if he else ".")
add("ess", [
    [ess_cover, {"t": "cover", "ed": "ess", "n": ve, "sub": (f"+ {len(he)} working behind the scenes" if he else None)}],
    [D["ess_wall"], {"t": "wall", "ed": "ess", "text": "You enter the facts. [It does the math.]", "inputs": D["inputs"]}],
    ["Now every sheet, in order.", {"t": "slam", "text": "Every sheet, [in order.]", "size": 96}],
] + tour("ess", META["ess"]))
elite_cover = f"Now, Elite. {cap(words(vx))} sheets you work in" + (f", plus {hidden_phrase(hx)} working behind the scenes. " if hx else ". ") + D["elite_tag"]
add("elite", [
    [elite_cover, {"t": "cover", "ed": "elite", "n": vx, "sub": (f"+ {len(hx)} working behind the scenes" if hx else None), "fx": "shock", "fxAt": 0.3}],
    [D["elite_wall"], {"t": "wall", "ed": "elite", "tags": False, "text": f"[{vx} sheets,] {D.get('wall_text', 'one operating system.')}"}],
    ["Let's walk through every one of them.", {"t": "slam", "text": "Every sheet. [In order.]", "size": 96}],
])
tabs = META["elite"]
G = 8
groups = [tabs[i:i + G] for i in range(0, len(tabs), G)]
if len(groups) > 1 and len(groups[-1]) < 4:
    _last = groups.pop(); groups[-1] = groups[-1] + _last
themes = {"ess": "light", "guide": "light"}
taxfirst = next((t for t in tabs if re.search(r"tax setup|tax reserve", t, re.I)), None)
idx = 0
who_dreads = D.get("dreads", "owner")
for gi, grp in enumerate(groups):
    sc = f"x{gi + 1}"
    if gi % 2 == 0: themes[sc] = "light"
    first_n = idx + 1; last_n = idx + len(grp)
    card = [f"Part {words(gi + 1)} of {words(len(groups))}: sheets {words(first_n)} to {words(last_n)}.", {"t": "chapter", "eyebrow": f"Elite · part {gi + 1} of {len(groups)}", "num": f"{first_n:02d}–{last_n:02d}", "text": f"Part [{gi + 1}]", "items": [nice(t) for t in grp]}]
    lines = [card]
    for t in grp:
        if t == taxfirst:
            lines.append([f"Then the part every {who_dreads} dreads. Taxes.", {"t": "zero", "eyebrow": f"The part every {who_dreads} dreads", "big": "TAXES.", "impact": True, "fxAt": 0.2, "fx": "shockred"}])
        lines += tour("elite", [t], idx)
        idx += 1
    add(sc, lines)

# ---- problem -> solution recap ----
FX = runpy.run_path(f"{ROOT}/script/src/_fixes.py")["FIXES"].get(slug)
if FX:
    def ftab(k):
        h = [t for t in META["elite"] + META["ess"] if k.lower() in t.lower()]
        if not h: raise SystemExit(f"fix sheet {k!r} not found")
        return h[0]
    for _, k in FX: ftab(k)
    nfx = words(len(FX))
    lines = [[f"So let's go back to every problem from the start of this video, and the sheet that answers it.", {"t": "fixes", "text": "Every problem. [Its answer.]", "items": FX}]]
    lines += [[f"{p}? {k}."] for p, k in FX]
    lines.append([f"{cap(nfx)} problems. {cap(nfx)} answers. All in one workbook."])
    add("fix", lines)

# ---- guides (shared) ----
ge, gx = D["guide"]
add("guide", [
    ["And you're never left guessing how to use it."],
    ["Every edition comes with a Quick Start: the exact steps for your first session, your first week, and your first thirty days."],
    ["And a full Field Guide that walks through every sheet, screen by screen."],
    [f"{cap(words(ge))} pages for Essential. {cap(words(gx))} for Elite. Including what to do when a number looks wrong."],
])

# ---- objections ----
objs = D["objs"]
n_obj = len(objs) + 1
add("obj", [[D.get("obj_intro", f"Now, honest answers to the questions {D['people']} ask."), {"t": "slam", "text": "Honest answers to [real questions.]", "size": 92}]])
for k, o in enumerate(objs):
    v = {"t": "qa", "q": o["q"], "eyebrow": f"Honest answer {k + 1} of {n_obj}", "liftAt": o.get("liftAt", 0.6), "chips": o["chips"]}
    for key in ("big", "bigSize", "answer", "foot", "fine"):
        if key in o: v[key] = o[key]
    first = f"“{o['q']}” {o['a1']}"
    add("obj", [[first, v, f"{o['q']} {o['a1']}"], [o["a2"]]])
macro = D.get("macro", "No macros. Every calculation is a plain formula, and your numbers stay in your file.")
add("obj", [[f"“Is it a subscription?” No. One payment. {macro}", {"t": "qa", "q": "Is it a subscription?", "eyebrow": f"Honest answer {n_obj} of {n_obj}", "liftAt": 0.25, "big": "No.", "bigSize": 150, "chips": ["One payment", "No macros", "Plain formulas"], "foot": "Your numbers stay in your file."}, f"Is it a subscription? No. One payment. {macro}"]])

# ---- offer / cta / end (shared) ----
add("offer", [
    ["So, which edition fits you?"],
    [f"Essential, $97: {D['offer_ess']}.", None, f"Essential, ninety-seven dollars. {cap(D['offer_ess'])}."],
    [f"Elite, $197: {D['offer_elite']}.", None, f"Elite, one ninety-seven. {cap(D['offer_elite'])}."],
    ["Or Complete, $249: both workbooks, both Field Guides, both Quick Starts. Start simple, grow into the full system.", None, "Or Complete, two forty-nine. Both workbooks, both Field Guides, both Quick Starts. Start simple, and grow into the full system."],
    ["One-time payment. And a 60-day money-back guarantee, no questions asked.", None, "One-time payment. And a sixty-day money-back guarantee. No questions asked."],
])
add("cta", [["Here's what to do right now."], ["Pick your edition below this video."], [D["cta_line"]], ["Because every month you wait is another month of guessing."]])
add("end", [[f"P.S. {D['ps'][0]}", None, f"P S. {D['ps'][0]}"], ["ProfitIQS shows you " + D["ps"][1], None, "Profit IQS shows you " + D["ps"][1]]])

_w = sum(len((x[2] or x[1]).split()) for x in L)
for x in L:
    if x[3] and x[3].get("t") == "ring": x[3]["n"] = str(max(1, round(_w / 2.58 / 60 + 0.4)))
spec = {
    "slug": slug, "name": name, "short": D["short"], "file_ess": D["file_ess"], "file_elite": D["file_elite"], "n_ess": ve, "n_elite": vx, "themes": themes,
    "reveal": {"title": D["title"], "made": f"Made only for [{D['aud_short']}.]", "chips": D.get("chips", ["Formulas", "Dashboards", "Reports", "Tax set-aside", "Sample data included"])},
    "who": D["who"], "tiers": D["tiers"], "guide": {"ess": ge, "elite": gx},
    "cta": D["cta"], "end": D["end"], "lines": L,
}
os.makedirs(f"{ROOT}/script/n", exist_ok=True)
json.dump(spec, open(f"{ROOT}/script/n/{slug}.json", "w"), indent=1, ensure_ascii=False)
print(slug, len(L), "lines")
