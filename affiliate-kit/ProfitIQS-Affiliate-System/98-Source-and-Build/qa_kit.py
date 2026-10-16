"""QA for the built kit: python3 qa_kit.py  -> writes 99-Audit-and-Launch-Checklist/QA-Report.md, exits 1 on hard failures."""
import os, re, sys, json, glob, collections, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'ProfitIQS-Affiliate-System')
if not os.path.isdir(OUT):                       # running from inside 98-Source-and-Build
    OUT = os.path.dirname(HERE)
C = json.load(open(os.path.join(HERE, 'config.json')))
packs = []
for f in sorted(glob.glob(os.path.join(HERE, 'packs', '*.py'))):
    s = importlib.util.spec_from_file_location('p', f); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); packs.append(m.PACK)
hard, soft = [], []
PRICES = {t['price'] for t in C['tiers']}
PCTS = {p['percent'] for p in C['commission_phases']}
PAYOUTS = {round(t['price'] * p['percent'] / 100, 2) for t in C['tiers'] for p in C['commission_phases']}
RISKY = r"\bguarantee|risk[- ]free|best[- ]?selling|#1\b|number one|proven\b|double your|triple your|save \d+|\d+ hours a week|passive income|get rich|tax[- ]free|audit[- ]proof|\bmost (shops|owners|contractors|hosts|practices|agencies|sellers|freelancers|stores)\b|\bI see\b|limited time|only \d+ left|act now|hurry|testimonial from|5[- ]star"
BANNED = r"profit intelligence system|\bchatbot|voice agent|\bAI\b|artificial intelligence|automat"
EMOJI = re.compile('[\U0001F300-\U0001FAFF☀-➿⭐✅❌]')


def files(root, ext=('.md', '.csv')):
    for r, _, fs in os.walk(root):
        if '98-Source-and-Build' in r:
            continue
        for f in fs:
            if f.endswith(ext):
                yield os.path.join(r, f)


titles = {p['title'] for p in packs}
for p in packs:
    D = os.path.join(OUT, p['folder'])
    if not os.path.isdir(D):
        hard.append(f"missing niche folder {p['folder']}"); continue
    need = ['01-Niche-Overview-and-Product-Facts.md', '02-Tier-Comparison.md', '02-Tier-Comparison.csv', '03-Video-Hooks.md', '03-Video-Hooks.csv',
            '04-Video-Scripts.md', '05-Social-Media-Copy.md', '06-Email-Swipes.md', '07-Graphic-Briefs.md', '08-Audience-and-Objections.md', '09-Publishing-Checklist.md']
    for n in need:
        if not os.path.exists(os.path.join(D, n)): hard.append(f"{p['folder']}: missing {n}")
    pngs = glob.glob(os.path.join(D, 'graphics', '*.png'))
    if len(pngs) != 10: hard.append(f"{p['folder']}: {len(pngs)} graphics (expected 10)")
    for f in files(D):
        t = open(f, encoding='utf-8').read(); rel = os.path.relpath(f, OUT)
        for other in titles - {p['title']}:
            if other in t: hard.append(f"{rel}: mentions another niche's product '{other}'")
        for m in re.finditer(r'\$(\d[\d,]*(?:\.\d\d)?)', t):
            v = float(m.group(1).replace(',', ''))
            if v not in PRICES: hard.append(f"{rel}: unexpected price ${m.group(1)}")
        for m in re.finditer(r'(\d{2})%', t):
            if int(m.group(1)) in PCTS: hard.append(f"{rel}: commission % '{m.group(0)}' in customer-facing niche copy")
    sc = open(os.path.join(D, '05-Social-Media-Copy.md'), encoding='utf-8').read()
    for blk in re.findall(r'```\n(.*?)```', sc, re.S):
        if C['placeholders']['affiliate_link'] in blk or 'link in bio' in blk.lower():
            if '#ad' not in blk and 'Disclosure' not in blk: hard.append(f"{p['folder']}: social block without disclosure: {blk[:60]!r}")
    for line in re.findall(r'^\d+\. (.*)$', sc.split('## 10 short promotional posts')[1].split('##')[0], re.M):
        if '#ad' not in line: hard.append(f"{p['folder']}: short post without disclosure")
    em = open(os.path.join(D, '06-Email-Swipes.md'), encoding='utf-8').read()
    for blk in re.findall(r'```\n(.*?)```', em, re.S):
        if C['placeholders']['affiliate_link'] in blk and 'Disclosure' not in blk: hard.append(f"{p['folder']}: email with link but no disclosure")

PROMO = lambda rel: rel.split(os.sep)[0][:2].isdigit() and rel.split(os.sep)[0][:2] not in ('00', '12', '99') or rel.endswith(('Shared-Promotional-Copy.md', 'Affiliate-Program-Overview.md'))
for f in files(OUT):
    t = open(f, encoding='utf-8').read(); rel = os.path.relpath(f, OUT)
    for m in (re.finditer(RISKY, t, re.I) if PROMO(rel) else []):
        ctx = t[max(0, m.start() - 70):m.end() + 30].replace('\n', ' ')
        if not re.search(r"avoid|never|not |no |don't|do not|must not|fake|without", ctx, re.I):
            hard.append(f"{rel}: risky phrase '{m.group(0)}' … {ctx.strip()[:110]}")
    for m in (re.finditer(BANNED, t, re.I) if PROMO(rel) else []):
        ctx = t[max(0, m.start() - 90):m.end() + 160].replace('\n', ' ')
        if not re.search(r"never|not |no\.|is not|are not|separate|avoid|do not", ctx, re.I):
            hard.append(f"{rel}: banned term '{m.group(0)}' … {ctx.strip()[:110]}")
    for u in re.findall(r'https?://[^\s)`\]|>"]+', t):
        if not re.match(r'https?://(www\.)?(profitiqs\.com|digistore24\.com)', u): hard.append(f"{rel}: unapproved URL {u}")
    if EMOJI.search(t): hard.append(f"{rel}: emoji found")
    if rel.startswith('00-') or rel.startswith('12-'):
        for m in re.finditer(r'\$(\d[\d,]*\.\d\d)', t):
            if float(m.group(1).replace(',', '')) not in PAYOUTS: hard.append(f"{rel}: commission amount ${m.group(1)} does not match config")

# duplicate / generic content across niches
hooks = collections.defaultdict(set)
for p in packs:
    for _, h in p['hooks']:
        g = re.sub(re.escape(p['label']), 'X', h, flags=re.I)
        hooks[g.lower()].add(p['slug'])
shared = {h: s for h, s in hooks.items() if len(s) > 1}
total = sum(len(p['hooks']) for p in packs)
dup_lines = sum(len(s) for s in shared.values())
soft.append(f"Hooks: {total} total; {dup_lines} share a structural template with other niches ({100 * dup_lines // total}%) — "
            f"e.g. the edition-choice and Excel-objection hooks. All other hooks are niche-specific.")
ph = collections.Counter()
for f in files(OUT):
    t = open(f, encoding='utf-8').read()
    for k in re.findall(r'\[[A-Z][A-Z0-9 \-—:/,\'"().]+\]', t):
        ph[k.split(':')[0][:60]] += 1
report = ['# QA Report', '', f"Files checked: {sum(1 for _ in files(OUT))} documents, {len(glob.glob(os.path.join(OUT, '**', '*.png'), recursive=True))} images.", '',
          f"## Result: {'PASS' if not hard else 'FAIL'} ({len(hard)} hard issue(s))", '']
report += [f'- {x}' for x in hard] or ['- No hard issues: names, prices, commission figures, disclosures, claims, URLs, emoji and assets all checked.']
report += ['', '## Notes', ''] + [f'- {x}' for x in soft]
report += ['', '## Unresolved placeholders (expected until confirmed)', '', '| Placeholder | Occurrences |', '|---|---|'] + [f'| `{k}` | {v} |' for k, v in ph.most_common()]
os.makedirs(os.path.join(OUT, '99-Audit-and-Launch-Checklist'), exist_ok=True)
open(os.path.join(OUT, '99-Audit-and-Launch-Checklist', 'QA-Report.md'), 'w').write('\n'.join(report) + '\n')
print('\n'.join(report[:40]))
sys.exit(1 if hard else 0)
