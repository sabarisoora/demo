"""Helpers shared by niche definitions."""
def S(ed, tab, label, d, hi, **k):
    return {"t": "sheet", "ed": ed, "tab": tab, "label": label, "d": d, "hi": hi, **k}

def mini(text, items, ed="elite"):
    return {"t": "mini", "ed": ed, "text": text, "items": [{"tab": t, "label": l} if isinstance(t, str) else t for t, l in items]}

def setup_line():
    return ["Set up once: your country, currency and tax-rate presets.", S("ess", "SETUP", "Setup", "once", [["Country", "Country preset", "cyan", "row"], ["Tax Reserve Rate % — default", "Tax-rate preset", "green", "row"]])]

def ess_tail(dash_kpi=("TOTAL REVENUE", "Revenue"), dash_kpi2=("NET PROFIT", "Net profit"), dash_kpi3=None, dash_line=None, tax_cost=None, tax_line=None):
    """Tax & Deductions, Dashboard, Accountant Export, Health Snapshot for the standard Essential layout."""
    thi = ([[tax_cost[0], tax_cost[1], "amber", "row"]] if tax_cost else []) + [["Recommended Tax Reserve $", "Recommended reserve", "green", "row"], ["DEDUCTION SUMMARY BY CATEGORY", "Every category", "cyan", "block"]]
    dhi = [[dash_kpi[0], dash_kpi[1], "blue", "kpi"], [dash_kpi2[0], dash_kpi2[1], "green", "kpi"]] + ([[dash_kpi3[0], dash_kpi3[1], "cyan", "kpi"]] if dash_kpi3 else []) + [["TAX RESERVE FUNDED %", "Reserve funded", "amber", "kpi"]]
    return [
        [tax_line or "Tax & Deductions works out your recommended tax reserve, and totals every deductible category.", S("ess", "TAX & DEDUCTIONS", "Tax & Deductions", "reserve + deductions", thi), (tax_line or "Tax & Deductions works out your recommended tax reserve, and totals every deductible category.").replace("&", "and")],
        [dash_line or "The Dashboard puts it on one screen: revenue, net profit, and how funded your tax reserve is.", S("ess", "DASHBOARD", "Dashboard", "one screen", dhi, dir="zoom")],
        ["The Accountant Export hands over a clean summary and a document checklist.", S("ess", "ACCOUNTANT EXPORT", "Accountant Export", "clean summary", [["Net Profit", "Summary", "blue", "row"], ["DOCUMENT CHECKLIST", "Document checklist", "green", "block"]])],
        ["And the Business Health Snapshot scores profit, cash, tax readiness, expenses and revenue trend.", S("ess", "BUSINESS HEALTH SNAPSHOT", "Health Snapshot", "scored 0–100", [["Profit Status", "5 categories", "cyan", "block"], ["OVERALL SCORE (0-100)", "Overall score", "green", "row"]], cam="full")],
    ]

def obj_excel(enter="jobs and expenses", locked=False):
    if locked:
        return {"q": "I'm not an Excel person.", "a1": "You don't need to be.", "a2": f"Every calculation is already built. In Elite, the formula cells are locked, so you can't break them by accident. All you do is enter {enter}.", "chips": ["Formulas built in", "Elite: formula cells locked", f"You enter {enter}", "Quick Start included"]}
    return {"q": "I'm not an Excel person.", "a1": "You don't need to be.", "a2": f"Every calculation is already built, and the Quick Start and Field Guide walk you through it. You just enter {enter}.", "chips": ["Formulas built in", f"You enter {enter}", "Quick Start included", "Field Guide included"]}

def obj_app(q, keep, chips, a1=None, a2=None):
    """'My software already has reports.' Keep the app (it runs the day-to-day); ProfitIQS sits beside it and shows what the business kept."""
    a1_, a2_ = a1, a2
    v = len(q) % 3
    a1 = ["Keep it. It runs your day-to-day.", "Keep using it. It runs the work.", "Keep it. It does its job."][v]
    a2 = [f"ProfitIQS sits next to it, and shows what all that work actually made you: {keep}, in one place.",
          f"ProfitIQS doesn't replace it. It sits beside it, and pulls {keep} into one view.",
          f"ProfitIQS adds the owner's view on top: {keep}, all in one place."][v]
    return {"q": q, "a1": a1_ or a1, "a2": a2_ or a2, "chips": chips, "liftAt": 0.7}

def money_slam():
    return ["Then, the money side.", {"t": "slam", "text": "Then, [the money side.]", "photo": "cash-pile", "size": 110}]

def months_line(text="Busy all year, and still not sure what the business actually kept.", photo="busy"):
    return [text, {"t": "months", "text": "Kept this year:", "photo": photo}]

def send_everything():
    return ["Your accountant asks for everything. And nothing's in one place.", {"t": "slam", "text": "“Send me [everything.]”", "photo": "signing", "glitch": 0.6}]

def ring(niche_say, niche_text):
    return [f"If you run {niche_say}, the next few minutes are for you.", {"t": "ring", "n": "7", "unit": "MINUTES", "text": f"If you run {niche_text} — [this is for you.]"}]

def money_side_line(word):
    return [f"Here's how the money side of {word} usually works.", {"t": "slam", "text": "How the money side [usually works.]", "glitch": 0, "size": 92}]

TIER_C = ["Both workbooks", "Both Field Guides", "Both Quick Starts", "Start simple, grow"]
