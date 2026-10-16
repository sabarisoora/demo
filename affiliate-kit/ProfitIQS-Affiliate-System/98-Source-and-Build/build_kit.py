"""Build the ProfitIQS affiliate kit.

    python3 build_kit.py                 # documents + graphics (graphics need Node.js + Playwright)
    python3 build_kit.py --no-graphics   # documents only (keeps existing graphics)

Everything is generated from config.json (prices, commission phases, placeholders), product_facts.json (read from the
shipped product files) and packs/*.py (one hand-written knowledge pack per niche).
"""
import importlib.util, json, os, shutil, sys, glob, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from niche_docs import Niche, csv_text            # noqa: E402
import master_docs as M                            # noqa: E402
import graphics as G                               # noqa: E402

OUT = os.path.join(os.path.dirname(HERE), 'ProfitIQS-Affiliate-System')
C = json.load(open(os.path.join(HERE, 'config.json')))
FACTS = json.load(open(os.path.join(HERE, 'product_facts.json')))
UPLOAD_NOTE = ('Not an affiliate kit: identical (byte-for-byte, 9/9 files) to the shipped Auto Repair product package. '
               'Used to confirm product facts.')


def load_packs():
    packs = []
    for f in sorted(glob.glob(os.path.join(HERE, 'packs', '*.py'))):
        spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f)
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        packs.append(m.PACK)
    return sorted(packs, key=lambda p: p['n'])


def w(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(text)


def main(graphics=True):
    packs = load_packs()
    niches = []
    for p in packs:
        f = dict(FACTS[p['slug']]); f['multi_country_tax'] = p['slug'] != '1099-contractor'
        niches.append(Niche(p, f, C))
    if os.path.exists(OUT):
        for d in os.listdir(OUT):
            fp = os.path.join(OUT, d)
            if graphics or not os.path.isdir(os.path.join(fp, 'graphics')):
                shutil.rmtree(fp) if os.path.isdir(fp) else os.remove(fp)
            else:      # documents-only rebuild: keep rendered graphics
                for x in os.listdir(fp):
                    if x != 'graphics':
                        y = os.path.join(fp, x); shutil.rmtree(y) if os.path.isdir(y) else os.remove(y)
    MK = os.path.join(OUT, '00-Master-Affiliate-Kit')
    for name, text in M.master(C, niches).items():
        w(os.path.join(MK, name), text)
    os.makedirs(os.path.join(MK, 'brand'), exist_ok=True)
    shutil.copy(os.path.join(HERE, 'assets', 'profitiqs-mark.png'), os.path.join(MK, 'brand', 'profitiqs-mark.png'))
    jobs, tmp = [], os.path.join(OUT, '.render')
    os.makedirs(tmp, exist_ok=True)
    for n in niches:
        p = n.p
        D = os.path.join(OUT, p['folder'])
        GD = os.path.join(D, 'graphics'); SRC = os.path.join(GD, 'source')
        os.makedirs(SRC, exist_ok=True)
        shutil.copy(os.path.join(HERE, 'assets', 'dashboards', f"{p['slug']}-dashboard.png"), os.path.join(SRC, 'dashboard.png'))
        for t in ('essential', 'elite'):
            shutil.copy(os.path.join(HERE, 'assets', 'covers', f"{p['slug']}-{t}.png"), os.path.join(SRC, f'cover-{t}.png'))
        gspecs = G.specs(n, C)
        w(os.path.join(D, '01-Niche-Overview-and-Product-Facts.md'), n.overview())
        md, cs = n.tiers(); w(os.path.join(D, '02-Tier-Comparison.md'), md); w(os.path.join(D, '02-Tier-Comparison.csv'), cs)
        md, cs = n.hooks(); w(os.path.join(D, '03-Video-Hooks.md'), md); w(os.path.join(D, '03-Video-Hooks.csv'), cs)
        w(os.path.join(D, '04-Video-Scripts.md'), n.scripts())
        w(os.path.join(D, '05-Social-Media-Copy.md'), n.social())
        w(os.path.join(D, '06-Email-Swipes.md'), n.emails())
        w(os.path.join(D, '07-Graphic-Briefs.md'), n.graphics(gspecs))
        w(os.path.join(D, '08-Audience-and-Objections.md'), n.audience())
        w(os.path.join(D, '09-Publishing-Checklist.md'), n.checklist())
        w(os.path.join(D, 'README.md'), n.readme(gspecs))
        A = dict(mark='file://' + os.path.join(HERE, 'assets', 'profitiqs-mark.png'), dash='file://' + os.path.join(SRC, 'dashboard.png'),
                 cover_ess='file://' + os.path.join(SRC, 'cover-essential.png'), cover_eli='file://' + os.path.join(SRC, 'cover-elite.png'))
        for s in gspecs:
            ww, hh = G.SIZES[s['kind']]
            src = os.path.join(tmp, f"{p['slug']}-{s['file']}.html")
            w(src, G.page(ww, hh, G.body(n, C, s, A)))
            jobs.append((src, os.path.join(GD, s['file']), ww, hh))
    A = dict(mark='file://' + os.path.join(HERE, 'assets', 'profitiqs-mark.png'))
    src = os.path.join(tmp, 'recruit.html'); w(src, G.page(1080, 1080, G.recruit_body(C, niches, A)))
    jobs.append((src, os.path.join(MK, 'graphics', 'affiliate-recruiting-1080x1080.png'), 1080, 1080))
    os.makedirs(os.path.join(MK, 'graphics'), exist_ok=True)
    if graphics:
        G.render(jobs)
    shutil.rmtree(tmp, ignore_errors=True)
    for name, text in M.hub(C, niches).items():
        w(os.path.join(OUT, '12-Affiliate-Hub', name), text)
    for name, text in {**M.audit(C, niches, UPLOAD_NOTE), **M.prelaunch(C, niches)}.items():
        w(os.path.join(OUT, '99-Audit-and-Launch-Checklist', name), text)
    shutil.copy(os.path.join(HERE, 'HANDOFF-REPORT.md'), os.path.join(OUT, '99-Audit-and-Launch-Checklist', 'Handoff-Report.md'))
    # source copy so the team can rebuild
    SB = os.path.join(OUT, '98-Source-and-Build')
    shutil.copytree(HERE, SB, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    w(os.path.join(SB, 'HOW-TO-REBUILD.md'), '# Rebuild the kit\n\n1. Edit `config.json` (prices, commission phases and dates, placeholders such as sales-page URLs).\n'
      '2. Edit a niche in `packs/<niche>.py` if needed. Add a new niche by copying a pack (keep the 30 hooks in the same angle order).\n'
      '3. Run `python3 build_kit.py` (add `--no-graphics` if Node.js/Playwright is not installed).\n'
      '4. Run `python3 qa_kit.py` and fix anything it reports.\n')
    # manifest
    rows = []
    for root, _, files in os.walk(OUT):
        for f in sorted(files):
            fp = os.path.join(root, f); rel = os.path.relpath(fp, OUT)
            if rel.startswith('98-Source-and-Build') and not rel.endswith(('config.json', '.md')):
                continue
            rows.append((rel, f"{os.path.getsize(fp) // 1024} KB"))
    rows.sort()
    w(os.path.join(OUT, 'MANIFEST.md'), f"# File Manifest\n\nGenerated {datetime.date.today().isoformat()} · {len(rows)} files listed (source code files in 98-Source-and-Build omitted).\n\n"
      + '| File | Size |\n|---|---|\n' + ''.join(f"| `{a}` | {b} |\n" for a, b in rows))
    w(os.path.join(OUT, 'README.md'), readme(niches))
    print(f'built {len(niches)} niche kits, {len(jobs)} graphics{" rendered" if graphics else " (skipped)"} -> {OUT}')


def readme(niches):
    ph = C['commission_phases']
    prices = ' · '.join(f"{t['tier']} ${t['price']}" for t in C['tiers'])
    return (f"# ProfitIQS Affiliate System\n\nThe complete affiliate kit for **ProfitIQS** on {C['platform']}: a master kit, one kit per niche "
            f"({len(niches)}), the affiliate hub specification, and the audit and launch checklist.\n\n"
            f"**Prices:** {prices}  \n"
            f"**Planned commission:** {ph[0]['percent']}% ({M.fmt_date(ph[0]['start'])} – {M.fmt_date(ph[0]['end'])}) → {ph[1]['percent']}% → {ph[2]['percent']}% standard (from {M.fmt_date(ph[2]['start'])})\n\n"
            "| Folder | Contents |\n|---|---|\n| `00-Master-Affiliate-Kit/` | Program overview, commission guide, brand messaging, launch checklist, compliance, shared copy, brand assets, recruiting graphic |\n"
            + ''.join(f"| `{n.p['folder']}/` | {n.p['title']} — 9 documents, 2 CSVs, 10 graphics |\n" for n in niches)
            + "| `12-Affiliate-Hub/` | Hub specification (pages, copy, navigation) |\n| `98-Source-and-Build/` | config.json (single source of truth), knowledge packs, build + QA scripts |\n"
              "| `99-Audit-and-Launch-Checklist/` | Audit report, QA report, pre-launch checklist |\n| `MANIFEST.md` | Every file |\n\n"
              "Search for `[NEEDS CONFIRMATION]` and `[YOUR AFFILIATE LINK]` to find everything that still needs a real value.\n")


if __name__ == '__main__':
    main(graphics='--no-graphics' not in sys.argv)
