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
add("ess", [
    [f"Let me show you what's inside. Start with Essential: {words(ne)} sheets.", {"t": "cover", "ed": "ess", "n": ne}],
    [D["ess_wall"], {"t": "wall", "ed": "ess", "text": "You enter the facts. [It does the math.]", "inputs": D["inputs"]}],
] + D["ess_tour"])
add("elite", [
    [f"Now, Elite. {cap(words(nx))} sheets. {D['elite_tag']}", {"t": "cover", "ed": "elite", "n": nx, "fx": "shock", "fxAt": 0.5}],
    [D["elite_wall"], {"t": "wall", "ed": "elite", "tags": False, "text": f"[{nx} sheets,] {D.get('wall_text', 'one operating system.')}"}],
])
for scene, lines in D["sections"]:
    add(scene, lines)

# ---- leak + scorecards (shared) ----
if D.get("leak") is not False:
    lk = D["leak"]
    add("leak", [["Then there's the Profit Leak Detector™.", {"t": "hero", "ed": "elite", "tab": etab("Profit Leak"), "text": "The Profit Leak [Detector™]", "cam": "full", "minW": lk.get("minW", 0.7), "hi": lk["hi"]}, "Then there's the Profit Leak Detector."]] + [[x] for x in lk["lines"]])
    sc = [{"tab": etab(k), "label": lab} for k, lab in (("KPI", "KPI Scorecard"), ("Health Score", "Health Score™"), ("Forecast", "Forecasting"), ("Bench", "Benchmarking")) if any(k.lower() in t.lower() for t in META["elite"])]
    add("leak", [[D.get("score_line", "Add a KPI Scorecard, a Business Health Score™, forecasting and benchmarking."), {"t": "mini", "ed": "elite", "text": "Scored, forecast, [benchmarked.]", "items": sc}, D.get("score_say", "Add a KPI Scorecard, a Business Health Score, forecasting and benchmarking.")]] + D.get("leak_extra", []))

# ---- tax (shared) ----
who_dreads = D.get("dreads", "owner")
tx = D.get("tax_hi", {})
add("tax", [
    [f"Then the part every {who_dreads} dreads. Taxes.", {"t": "zero", "eyebrow": f"The part every {who_dreads} dreads", "big": "TAXES.", "impact": True, "fxAt": 0.2, "fx": "shockred"}],
    ["The Tax Reserve Center works out a recommended reserve, and how much of it you've funded.", {"t": "sheet", "ed": "elite", "tab": etab("Tax Reserve"), "label": "Tax Reserve", "d": "what to set aside", "hi": tx.get("reserve", [["Recommended Tax Reserve $", "Recommended reserve", "green", "row"], ["Reserve Funded %", "Funded %", "cyan", "row"]])}],
    ["The Deduction Maximizer groups the year's expenses by category, to review with your accountant.", {"t": "sheet", "ed": "elite", "tab": etab("Deduction Maximizer"), "label": "Deduction Maximizer", "d": "by category", "hi": tx.get("deduct", [["Typically Deductible?", "Deductible?", "green", "cell"], ["Total Deductible", "Total", "cyan", "row"]])}],
    ["The Tax Readiness Center tracks due dates, and scores how ready your records are.", {"t": "sheet", "ed": "elite", "tab": etab("Tax Readiness"), "label": "Tax Readiness", "d": "due dates + score", "hi": tx.get("ready", [["TAX CALENDAR", "Due dates", "amber", "block"], ["TAX READINESS SCORE", "Readiness score", "green", "block"]])}],
    ["And the Accountant Summary is a print-ready package to hand over at filing time.", {"t": "sheet", "ed": "elite", "tab": etab("Accountant Summary"), "label": "Accountant Summary", "d": "print-ready", "hi": tx.get("acct", [["Accountant Package Status:", "Package status", "green", "row"], ["Net Profit", "P&L summary", "blue", "row"]])}],
])

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

spec = {
    "slug": slug, "name": name, "short": D["short"], "file_ess": D["file_ess"], "file_elite": D["file_elite"], "n_ess": ne, "n_elite": nx,
    "reveal": {"title": D["title"], "made": f"Made only for [{D['aud_short']}.]", "chips": D.get("chips", ["Formulas", "Dashboards", "Reports", "Tax set-aside", "Sample data included"])},
    "who": D["who"], "tiers": D["tiers"], "guide": {"ess": ge, "elite": gx},
    "cta": D["cta"], "end": D["end"], "lines": L,
}
os.makedirs(f"{ROOT}/script/n", exist_ok=True)
json.dump(spec, open(f"{ROOT}/script/n/{slug}.json", "w"), indent=1, ensure_ascii=False)
print(slug, len(L), "lines")
