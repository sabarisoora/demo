"""Build the public dir for one niche: real sheet images (+ text-row index for highlights), thumbs, guide pages, covers.
Nothing here is committed: it shows the paid product.
Usage: python3 -I scripts/prep_niche.py <slug> <inv.json> <pdf dir> <covers dir>"""
import json, os, re, shutil, subprocess, sys, html
from PIL import Image, ImageChops
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug, INV, PDFS, COVERS = sys.argv[1:5]
inv = json.load(open(INV))[slug]
OUT = f"{ROOT}/assets/{slug}"
for d in ("sheets/thumb", "docs", "covers"):
    os.makedirs(f"{OUT}/{d}", exist_ok=True)
for d in ("fx",):
    if not os.path.exists(f"{OUT}/{d}"): shutil.copytree(f"{ROOT}/public/{d}", f"{OUT}/{d}")
shutil.copy(f"{ROOT}/public/logo.png", f"{OUT}/logo.png")
if os.path.exists(f"{OUT}/photos"): shutil.rmtree(f"{OUT}/photos")
shutil.copytree(f"{ROOT}/public/photos", f"{OUT}/photos")

# covers: match by the cover family prefix (first word(s) of the product folder)
base = inv["name"].replace("_Complete_2026", "")
key = {"1099-income": "1099_Income", "rental-portfolio": "Rental_Portfolio", "trucking-owner-operator": "Trucking_Owner", "construction": "Construction_Job_Cost", "small-business": "Small_Business"}.get(slug)
cands = sorted(os.listdir(COVERS))
pref = key or "_".join(base.split("_")[:2])
for tier in ("Essential", "Elite", "Complete"):
    hit = [c for c in cands if c.startswith(pref) and f"_{tier}_2026" in c]
    if not hit: hit = [c for c in cands if c.startswith(base.split("_")[0]) and f"_{tier}_2026" in c]
    shutil.copy(f"{COVERS}/{hit[0]}", f"{OUT}/covers/{tier}.png")

def pdfsize(pdf, i):
    o = subprocess.run(["pdfinfo", "-f", str(i), "-l", str(i), pdf], capture_output=True, text=True).stdout
    m = re.search(r"Page\s+%d size:\s+([\d.]+) x ([\d.]+)" % i, o)
    return float(m.group(1)), float(m.group(2))

def rows_of(pdf, i, scale, crop):
    xml = subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), "-bbox-layout", pdf, "-"], capture_output=True, text=True).stdout
    lines = []
    for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', xml, re.S):
        x0, y0, x1, y1 = (float(m.group(k)) * scale for k in range(1, 5))
        txt = " ".join(html.unescape(w) for w in re.findall(r"<word[^>]*>(.*?)</word>", m.group(5)))
        if txt.strip(): lines.append([x0, y0, x1, y1, txt])
    W, H = crop
    lines = [[l[0], l[1], min(l[2], W), min(l[3], H), l[4]] for l in lines if l[1] < H - 4 and l[0] < W - 4]
    return [[l[4][:90], round(l[0] / W, 4), round(l[1] / H, 4), round((l[2] - l[0]) / W, 4), round((l[3] - l[1]) / H, 4)] for l in lines]

meta = {"ess": [], "elite": [], "sheets": {}, "docs": {}, "fg": {}}
for ed in ("ess", "elite"):
    wb = openpyxl.load_workbook(inv[ed + "_xlsx"], read_only=True)
    allws = [(ws.title, ws.sheet_state == "visible") for ws in wb.worksheets]
    meta[ed] = [t for t, v in allws if v]
    pdf0 = f"{PDFS}/{slug}-{ed}.pdf"
    trim_pdf = f"{PDFS}2/{slug}-{ed}.pdf"; trim_idx = set()
    if os.path.exists(trim_pdf + ".trim"):
        trim_idx = {int(x) for x in open(trim_pdf + ".trim").read().split()}
    for i, (title, vis) in enumerate(allws, 1):
        if not vis: continue
        pdf = trim_pdf if i in trim_idx else pdf0
        pw, ph = pdfsize(pdf, i)
        name = f"{ed}-{i:02d}"
        tmp = f"{OUT}/sheets/_t"
        if ph / pw > 1.5:  # long data sheet: full width, top screenful only
            dpi = min(220, 2200 / (pw / 72))
            cw, ch = int(pw * dpi / 72), int(min(ph, pw * 0.9) * dpi / 72)
            subprocess.run(["pdftoppm", "-f", str(i), "-l", str(i), "-r", f"{dpi:.2f}", "-x", "0", "-y", "0", "-W", str(cw), "-H", str(ch), "-singlefile", "-png", pdf, tmp], check=True)
        else:
            dpi = min(220, 2600 / (max(pw, ph) / 72))
            subprocess.run(["pdftoppm", "-f", str(i), "-l", str(i), "-r", f"{dpi:.2f}", "-singlefile", "-png", pdf, tmp], check=True)
        im = Image.open(tmp + ".png").convert("RGB"); os.remove(tmp + ".png")
        b = ImageChops.difference(im, Image.new("RGB", im.size, "white")).getbbox() or (0, 0, im.width, im.height)
        im = im.crop((0, 0, min(im.width, b[2] + 16), min(im.height, b[3] + 16)))
        im.save(f"{OUT}/sheets/{name}.jpg", quality=90)
        th = im.crop((0, 0, im.width, min(im.height, int(im.width * 0.625))))
        th.thumbnail((560, 350)); bg = Image.new("RGB", (560, 350), "white"); bg.paste(th, (0, 0)); bg.save(f"{OUT}/sheets/thumb/{name}.jpg", quality=85)
        meta["sheets"][f"{ed}::{title}"] = {"img": name, "w": im.width, "h": im.height, "rows": rows_of(pdf, i, dpi / 72, (im.width, im.height))}

# guide pages
def pages(pdf, d, r, first=None, last=None):
    os.makedirs(f"{OUT}/docs/{d}", exist_ok=True)
    a = ["pdftoppm", "-r", str(r), "-png"] + (["-f", str(first), "-l", str(last)] if first else []) + [pdf, f"{OUT}/docs/{d}/p"]
    subprocess.run(a, check=True)
    return sorted(os.listdir(f"{OUT}/docs/{d}"))
for ed, k in (("ess", "e"), ("elite", "x")):
    fg, qs = inv[ed + "_fg"], inv[ed + "_qs"]
    meta["docs"][k + "fg"] = pages(fg, k + "fg", 40)
    meta["docs"][k + "qs"] = pages(qs, k + "qs", 100)
    n = inv[ed + "_fg_pages"]
    txt = [subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), fg, "-"], capture_output=True, text=True).stdout for p in range(1, n + 1)]
    # featured: pages that walk through a sheet (most "formula"/"column" mentions), spread over the guide; plus troubleshooting
    score = [(t.lower().count("formula") * 2 + t.lower().count("column") + t.lower().count("sheet"), p) for p, t in enumerate(txt, 1) if 4 < p < n - 2]
    thirds = [[s for s in score if lo <= s[1] / n < hi] for lo, hi in ((0, 0.4), (0.4, 0.65), (0.65, 1))]
    feat = [max(t)[1] for t in thirds if t]
    trouble = [p for p, t in enumerate(txt, 1) if p > 4 and re.search(r"(?i)troubleshoot|looks wrong", t[:300])]
    tp = trouble[0] if trouble else max(score)[1]
    meta["fg"][ed] = feat + [tp]
    os.makedirs(f"{OUT}/docs/{k}fg-hi", exist_ok=True)
    for p in [1] + feat + [tp]:
        subprocess.run(["pdftoppm", "-r", "110", "-png", "-f", str(p), "-l", str(p), "-singlefile", fg, f"{OUT}/docs/{k}fg-hi/p{p}"], check=True)
json.dump(meta, open(f"{OUT}/meta.json", "w"))
print(slug, "ess", len(meta["ess"]), "elite", len(meta["elite"]), "fg", meta["fg"])
