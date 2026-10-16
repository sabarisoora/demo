"""Generate one niche kit (9 documents + CSVs) from a knowledge pack, the verified product facts and config.json."""
import csv, io

STATUS = ('> **Legend:** **VERIFIED** = read from the shipped 2026 product files. **HYPOTHESIS** = general industry '
          'context for marketing angles, not a product claim. `[NEEDS CONFIRMATION]` = fill in before publishing.')


def lc(s):
    """Lower-case only the first letter, so acronyms like ARO, ADR or HVAC keep their case."""
    first = s.split(" ", 1)[0]
    if any(ch.isupper() for ch in first[1:]):        # acronym or brand casing (ADR, HVAC, RevPAR)
        return s
    return s[:1].lower() + s[1:]


def money(c, v):
    return f"{c['currency_symbol']}{v:,.0f}" if float(v).is_integer() else f"{c['currency_symbol']}{v:,.2f}"


def price(c, tier):
    return next(t['price'] for t in c['tiers'] if t['tier'] == tier)


def ul(items):
    return '\n'.join(f'- {x}' for x in items)


def table(head, rows):
    out = '| ' + ' | '.join(head) + ' |\n|' + '|'.join('---' for _ in head) + '|\n'
    return out + ''.join('| ' + ' | '.join(str(x).replace('|', '/') for x in r) + ' |\n' for r in rows)


def csv_text(head, rows):
    b = io.StringIO(); w = csv.writer(b); w.writerow(head); w.writerows(rows); return b.getvalue()


class Niche:
    def __init__(self, p, facts, c):
        self.p, self.f, self.c = p, facts, c
        assert p['title'] == facts['product'] + '™', (p['title'], facts['product'])
        assert len(p['hooks']) == 30, (p['slug'], len(p['hooks']))
        self.L = c['placeholders']['affiliate_link']
        self.SP = c['placeholders']['sales_page']
        self.ess, self.eli = facts['tiers']['Essential'], facts['tiers']['Elite']

    # ---------- shared facts ----------
    def contents(self, tier):
        if tier == 'Complete':
            return ['Essential 2026 edition: workbook, Field Guide, Quick Start',
                    'Elite 2026 edition: workbook, Field Guide, Quick Start', 'License, README and Support PDFs']
        e = self.ess if tier == 'Essential' else self.eli
        return [f'Excel workbook — {len(e["sheets"])} sheets', f'Field Guide PDF — {e["guide_pages"]} pages',
                f'Quick Start PDF — {e["qs_pages"]} pages', 'License, README and Support PDFs']

    def facts_block(self):
        p, c = self.p, self.c
        rows = [(t, money(c, price(c, t)), '; '.join(self.contents(t))) for t in ('Essential', 'Elite', 'Complete')]
        tax = ('Country-based tax-rate presets (SETUP / Tax Setup) with an override for your own rate'
               if self.f.get('multi_country_tax', True) else 'US-focused estimated-tax and quarterly planning sheets')
        return (f"## Verified product facts\n\n**Exact product name:** {p['title']}  \n"
                + (f"**Allowed short form:** {', '.join(p['short_forms'])} (social copy only, never as the product title)  \n" if p['short_forms'] else '')
                + f"**Brand:** {c['brand']} · **Sold through:** {c['platform']} · **Product support:** {c['support_email']}\n\n"
                + table(['Edition', 'Price', 'What the buyer downloads (VERIFIED)'], rows)
                + '\n**Every edition (VERIFIED):** downloadable Excel workbook with formulas, dashboards and reports built in; '
                  'sample data so every dashboard works immediately; Field Guide and Quick Start PDFs; requires a desktop version of Microsoft Excel; '
                  f'{tax}; planning tool only — not tax, legal or financial advice.\n\n'
                + f"**Sales page:** {self.SP} · **{c['platform']} product IDs:** {c['placeholders']['product_id']} · "
                  f"**Marketplace status:** [NEEDS CONFIRMATION — do not describe as approved]\n")

    # ---------- 01 overview ----------
    def overview(self):
        p = self.p
        return (f"# {p['label']} — Niche Overview and Product Facts\n\n{STATUS}\n\n" + self.facts_block()
                + f"\n## Audience\n\n{p['audience']}.\n\n## Buyer profiles (HYPOTHESIS)\n\n"
                + '\n'.join(f"**{a}.** {b}\n" for a, b in p['profiles'])
                + "\n## Business problems in this industry (HYPOTHESIS)\n\nGeneral industry context to shape your angle. Do not present these as facts about the buyer or results of the product.\n\n"
                + '\n'.join(f"- **{a}.** {b}" for a, b in p['problems'])
                + '\n\n## Buyer motivations (HYPOTHESIS)\n\n' + ul(p['motivations'])
                + '\n\n## Why someone might consider a business intelligence system\n\n'
                  f"The common thread is visibility: {p['owners']} usually have the data (repair orders, invoices, receipts) but not one place that turns it into decisions. "
                  f"The {p['title']} gives them a ready-built Excel workbook for that (VERIFIED: dashboards, reports and tax set-aside built in). "
                  'Whether it helps depends on the owner entering data and reviewing it regularly.\n\n'
                + '## Key numbers this audience cares about (educational)\n\n' + '\n'.join(f"- **{a}:** {b}" for a, b in p['kpis'])
                + '\n\n## Common objections\n\nSee `08-Audience-and-Objections.md` for full, honest responses.\n\n'
                + ul(o for o, _ in p['objections'])
                + '\n\n## Hypothetical scenarios (label them as hypothetical if you use them)\n\n' + ul(p['scenario']) + '\n')

    # ---------- 02 tiers ----------
    def tiers(self):
        p, c = self.p, self.c
        e_s, l_s = self.ess['sheets'], self.eli['sheets']
        rows = [('Price', *(money(c, price(c, t)) for t in ('Essential', 'Elite', 'Complete'))),
                ('Excel workbook', f'Essential — {len(e_s)} sheets', f'Elite — {len(l_s)} sheets', 'Both workbooks'),
                ('Field Guide (PDF)', f'{self.ess["guide_pages"]} pages', f'{self.eli["guide_pages"]} pages', 'Both guides'),
                ('Quick Start (PDF)', f'{self.ess["qs_pages"]} pages', f'{self.eli["qs_pages"]} pages', 'Both'),
                ('License, README, Support PDFs', 'Yes', 'Yes', 'Yes'),
                ('Sample data', 'Yes', 'Yes', 'Yes'),
                ('Best for (from contents)', p['tier_fit']['Essential'], p['tier_fit']['Elite'], p['tier_fit']['Complete'])]
        md = (f"# {p['label']} — Tier Comparison\n\n{STATUS}\n\n**Product:** {p['title']}\n\n"
              + table(['', 'Essential', 'Elite', 'Complete'], rows)
              + f"\n## Essential 2026 — every visible sheet (VERIFIED, {len(e_s)})\n\n" + ul(e_s)
              + f"\n\n## Elite 2026 — every visible sheet (VERIFIED, {len(l_s)})\n\n" + ul(l_s)
              + "\n\n## Complete 2026 (VERIFIED)\n\nBoth editions above in one package: the Essential and Elite workbooks, both Field Guides, both Quick Starts, plus License, README and Support PDFs.\n\n"
              + "## Before you make any product claim, verify\n\n"
              + ul(['The claim names a sheet or feature listed above (or in the Field Guide).',
                    f"The price matches the live sales page ({self.SP}).",
                    'You are not promising results, savings, tax outcomes or time saved.',
                    'You link with your own Digistore24 affiliate link for the right edition or the marketplace entry.',
                    'Marketplace approval for this product is confirmed before you call it "available on Digistore24".']) + '\n')
        cs = csv_text(['Row', 'Essential', 'Elite', 'Complete'], rows)
        return md, cs

    # ---------- 03 hooks ----------
    def hooks(self):
        p = self.p
        visual = {'Problem and solution': 'Talking head, then cut to the dashboard', 'Industry mistake': 'Talking head with on-screen text',
                  'Operational inefficiency': 'B-roll of the workplace, then the relevant sheet', 'Owner frustration': 'Relatable POV clip',
                  'Curiosity': 'Screen recording reveal', 'Educational': 'Whiteboard or on-screen definition',
                  'Product demonstration': 'Screen recording of the sample workbook', 'Comparison and decision': 'Split screen of the editions',
                  'Objection handling': 'Talking head, objection as on-screen text'}
        rows = [(i + 1, a, h, visual.get(a, 'Talking head')) for i, (a, h) in enumerate(p['hooks'])]
        md = (f"# {p['label']} — 30 Short-Form Video Hooks\n\nFor TikTok, Instagram Reels and YouTube Shorts. Each hook is the first 1–3 seconds; "
              f"pair it with a script from `04-Video-Scripts.md`. No statistics, guarantees or fake urgency. Disclose your affiliate link in the caption.\n\n"
              + table(['#', 'Angle', 'Hook', 'Suggested visual'], rows))
        return md, csv_text(['#', 'Angle', 'Hook', 'Suggested visual'], rows)

    # ---------- 04 scripts ----------
    def scripts(self):
        p, c = self.p, self.c
        d, k, pr, o, m = p['demos'], p['kpis'], p['problems'], p['objections'], p['mistakes']
        T = p['title']
        cta = f"See the editions at the link in my bio. (Caption: {c['disclosure_short']})"
        S = [
            ('The problem nobody sees', 'Problem → demo', p['profiles'][0][0],
             p['hooks'][0][1], f"{pr[0][1]} The {T} puts the numbers on one screen. This is the {d[0][0]} with sample data. {d[0][3]}",
             [pr[0][0], d[0][2], T], f"Face to camera, then screen recording of {d[0][0]}", [f'{d[0][0]} exists and shows the items named (VERIFIED from product files)']),
            ('Three mistakes', 'Educational', p['owners'].capitalize(),
             f"Three common money mistakes in a {p['business']}.",
             f"One: {lc(m[0])}. Two: {lc(m[1])}. Three: {lc(m[2])}. None of these need a new system to fix — but having the numbers in one place makes them hard to ignore.",
             ['Mistake 1: ' + m[0], 'Mistake 2: ' + m[1], 'Mistake 3: ' + m[2]], 'Talking head, numbered text overlays',
             ['These are general observations, not statistics — do not add numbers']),
            (f'What is {lc(k[0][0])}?', 'Educational', p['owners'].capitalize(), f"What is {lc(k[0][0])}, and why should you care?",
             f"{k[0][1]} You can work it out by hand, or use a workbook that calculates it for you as you log your data.",
             [k[0][0], 'Simple definition', 'Check yours monthly'], 'Whiteboard or on-screen definition, end on the dashboard',
             [f'Only say the product shows {k[0][0]} if it appears on a sheet you have checked']),
            ('Inside the workbook', 'Product demonstration', p['owners'].capitalize(), p['hooks'][15][1],
             f"This is the {T}. The Elite edition has {len(self.eli['sheets'])} sheets. Here is {d[1][0]}. {d[1][3]} And this is {d[2][0]}. {d[2][3]}",
             [d[1][2], d[2][2]], f"Screen recording: {d[1][0]}, then {d[2][0]}", ['Sheet count and sheet names (VERIFIED)']),
            ('The late-night books', 'Owner frustration', p['profiles'][0][0], p['hooks'][11][1],
             f"{pr[5][1]} An Excel system with the dashboards already built means you log entries as you go and the reports are ready when you need them.",
             [pr[5][0], 'Log it as you go', 'Reports ready when you are'], 'POV clip at a desk, then the dashboard', ['Do not claim a specific amount of time saved']),
            ('Essential or Elite?', 'Comparison and decision', 'Owners deciding on an edition', p['hooks'][25][1],
             f"Essential is {money(c, price(c, 'Essential'))}: {lc(p['tier_fit']['Essential'][0]) + p['tier_fit']['Essential'][1:]} "
             f"Elite is {money(c, price(c, 'Elite'))}: {lc(p['tier_fit']['Elite'][0]) + p['tier_fit']['Elite'][1:]} "
             f"Complete, {money(c, price(c, 'Complete'))}, gives you both.",
             [f"Essential {money(c, price(c, 'Essential'))}", f"Elite {money(c, price(c, 'Elite'))}", f"Complete {money(c, price(c, 'Complete'))}"],
             'Split screen of the three editions', ['Prices must match the live sales page']),
            ('Answering the objection', 'Objection handling', 'Skeptical owners', p['hooks'][27][1],
             o[1][1], [o[1][0].strip('"'), 'Built for owners, not analysts'], 'Talking head with the objection as text, then the Quick Start',
             ['Requires desktop Excel (VERIFIED) — say so']),
            ('What you actually get', 'Product-focused', 'Ready-to-buy viewers', f"Here is exactly what is in the {T}.",
             f"Each edition is a downloadable Excel workbook with a Field Guide and a Quick Start, and sample data so you can explore before entering your own. "
             f"Essential has {len(self.ess['sheets'])} sheets; Elite has {len(self.eli['sheets'])}. Complete includes both.",
             ['Excel workbook', 'Field Guide + Quick Start', 'Sample data included'], 'Unboxing-style scroll through the download folder',
             ['File list and counts (VERIFIED)']),
            ('Your monthly review', 'Educational / demo', p['profiles'][2][0], f"A 15-minute monthly review for your {p['business']}.",
             f"Open the dashboard. Check {lc(k[0][0])} and {lc(k[1][0])}. Then open {d[4][0]}. {d[4][3]} "
             "Write down one thing to change next month. That's it.",
             ['Open the dashboard', f'Check {k[0][0]}', f'Check {d[4][0]}', 'Pick one change'], f"Screen recording of the dashboard and {d[4][0]}",
             ['Present the routine as a suggestion, not a result']),
            ('The sheet that surprised me', 'Curiosity / demo', p['owners'].capitalize(), p['hooks'][16][1],
             f"It is {lc(k[2][0])}. {k[2][1]} In the {T}, {d[3][0]} is where you see it alongside the rest of the business.",
             [k[2][0], d[3][2]], f"Screen recording of {d[3][0]}", [f'{d[3][0]} content as shown in the sample file']),
        ]
        out = [f"# {p['label']} — 10 Short-Form Video Scripts\n\nEach script runs about 20–45 seconds and can be recorded on a phone with a screen recording of the sample workbook. "
               f"Destination for every script: {self.L} (your Digistore24 link for {T}). Say or show the disclosure.\n"]
        for i, (title, kind, aud, hook, narration, ost, visuals, verify) in enumerate(S, 1):
            out.append(f"\n## Script {i}: {title}\n\n**Type:** {kind}  \n**Target audience:** {aud}  \n**Length:** about {20 + (len(narration) // 22)} seconds\n\n"
                       f"**1. Opening hook (0–3s):** {hook}\n\n**2. Spoken narration:** {narration}\n\n**3. On-screen text:**\n" + ul(ost)
                       + f"\n\n**4. Visuals / screen recording:** {visuals}\n\n**5. Call to action:** {cta}\n\n**6. Destination:** {self.L}\n\n"
                       f"**7. Claims to verify before posting:**\n" + ul(verify + ['Disclosure included in caption or on screen']) + '\n')
        return ''.join(out)

    # ---------- 05 social ----------
    def social(self):
        p, c = self.p, self.c
        T, L, D, ds = p['title'], self.L, c['disclosure_long'], c['disclosure_short']
        hs = ' '.join(p['hashtags'])
        h = [x for _, x in p['hooks']]
        caps = [
            ('Instagram', f"{h[0]}\n\n{p['problems'][0][1]}\n\nThe {T} is a downloadable Excel system built for {p['owners']}. Link in bio.\n\n{ds}\n{hs}"),
            ('Instagram', f"{h[14]}\n\nSwipe through the sample workbook: dashboards, reports and a tax set-aside estimate, built in Excel.\n\nLink in bio. {ds}\n{hs}"),
            ('TikTok', f"{h[4]} {ds} {hs}"),
            ('TikTok', f"{h[17]} Full breakdown in the video. {ds} {hs}"),
            ('Facebook', f"{h[2]}\n\n{p['problems'][1][1]}\n\nIf you run a {p['business']}, the {T} is worth a look: {L}\n\n{D}"),
            ('Facebook', f"Question for {p['owners']}: {lc(p['kpis'][0][0])} — do you know yours?\n\n{p['kpis'][0][1]}\n\nHere is a ready-built Excel system that tracks it: {L}\n\n{D}"),
            ('LinkedIn', f"{h[1]}\n\n{p['problems'][4][1]}\n\nThe {T} turns repair-shop-style data into a dashboard, reports and a tax set-aside estimate — in Excel, without new software to learn.\n\n{L}\n\n{D}".replace('repair-shop-style', p['business'])),
            ('LinkedIn', f"Three numbers every {p['owner']} should review monthly:\n\n1. {p['kpis'][0][0]}\n2. {p['kpis'][1][0]}\n3. {p['kpis'][2][0]}\n\nI share a ready-built Excel system that tracks them: {L}\n\n{D}"),
            ('X / Threads', f"{h[8]} {L} {ds}"),
            ('YouTube community', f"{h[25]}\n\nEssential {money(c, price(c, 'Essential'))} · Elite {money(c, price(c, 'Elite'))} · Complete {money(c, price(c, 'Complete'))}. Comparison in my latest Short. {L}\n\n{D}"),
        ]
        posts = [f"{x} {L} {ds}" for x in (h[3], h[5], h[6], h[9], h[12], h[13], h[18], h[19], h[20], h[26])]
        ctas = [f"See all three editions of the {T}: {L}", f"Explore the sample workbook before you decide: {L}",
                f"Start with Essential at {money(c, price(c, 'Essential'))}, or get both editions with Complete: {L}",
                f"Built for {p['owners']} — take a look: {L}", f"Compare Essential, Elite and Complete side by side: {L}"]
        edu = [(f"{a} explained", f"Define {lc(a)} in plain English ({b}) and show where it appears in the sample workbook.") for a, b in p['kpis'][:3]]
        edu += [(f"Mistake: {p['mistakes'][3]}", 'Explain why it happens and one simple habit that avoids it. No statistics.'),
                (f"Mistake: {p['mistakes'][7]}", 'Walk through a simple monthly habit; link the Field Guide topic it relates to.')]
        car = [
            (f"5 money mistakes {p['owners']} make", [f"5 money mistakes {p['owners']} make"] + p['mistakes'][:5] + [f"See them all in one place → {T}", f"Link in bio · {ds}"]),
            (f"The numbers behind a {p['business']}", [f"The numbers behind a {p['business']}"] + [f"{a}: {b}" for a, b in p['kpis'][:4]] + ['Track them in Excel → link in bio', ds]),
            ('Essential vs Elite vs Complete', ['Which edition fits you?', f"Essential — {money(c, price(c, 'Essential'))}: {p['tier_fit']['Essential']}",
                                               f"Elite — {money(c, price(c, 'Elite'))}: {p['tier_fit']['Elite']}", f"Complete — {money(c, price(c, 'Complete'))}: {p['tier_fit']['Complete']}",
                                               'Every edition: workbook + Field Guide + Quick Start', f"Compare at the link · {ds}"]),
            ('A tour of the workbook', [f"Inside the {T}"] + [f"{d[0]}: {d[2]}" for d in p['demos'][:5]] + [f"Link in bio · {ds}"]),
            ('Honest answers', ['Questions owners ask'] + [f"{a} → {b[:110]}{'…' if len(b) > 110 else ''}" for a, b in p['objections'][:4]] + [f"More at the link · {ds}"]),
        ]
        yt = [h[i] for i in (0, 1, 14, 15, 17, 18, 21, 22, 25, 27)]
        md = f"# {p['label']} — Social Media Copy\n\nReplace `{L}` with your Digistore24 link. Keep the disclosure in every post.\n\n## 10 social captions\n\n"
        md += '\n'.join(f"### {i}. {plat}\n\n```\n{t}\n```\n" for i, (plat, t) in enumerate(caps, 1))
        md += '\n## 10 short promotional posts\n\n' + '\n'.join(f"{i}. {t}" for i, t in enumerate(posts, 1))
        md += '\n\n## 5 alternative calls to action\n\n' + '\n'.join(f"{i}. {t}" for i, t in enumerate(ctas, 1))
        md += '\n\n## 5 educational post concepts\n\n' + '\n'.join(f"{i}. **{a}** — {b}" for i, (a, b) in enumerate(edu, 1))
        md += '\n\n## 5 carousel concepts (slide by slide)\n\n'
        for i, (name, slides) in enumerate(car, 1):
            md += f"### Carousel {i}: {name}\n\n" + '\n'.join(f"- **Slide {j}:** {s}" for j, s in enumerate(slides, 1)) + '\n\n'
        md += '## YouTube Shorts — titles and descriptions\n\n**Titles:**\n\n' + '\n'.join(f"{i}. {t}" for i, t in enumerate(yt, 1))
        md += (f"\n\n**Description template A:**\n\n```\n{p['problems'][0][1]} The {T} is a downloadable Excel system for {p['owners']}: dashboards, reports and a tax set-aside estimate, built in.\n\nEditions: Essential {money(c, price(c, 'Essential'))} · Elite {money(c, price(c, 'Elite'))} · Complete {money(c, price(c, 'Complete'))}\n{L}\n\n{D}\n{hs}\n```\n"
               f"\n**Description template B:**\n\n```\nA look inside the {T} with its sample data. Each edition includes the workbook, a Field Guide and a Quick Start. Requires desktop Microsoft Excel.\n\n{L}\n{D}\n```\n")
        return md

    # ---------- 06 emails ----------
    def emails(self):
        p, c = self.p, self.c
        T, L, D = p['title'], self.L, c['disclosure_long']
        F, Y = c['placeholders']['first_name'], c['placeholders']['your_name']
        E = [
            ('Problem awareness', f"{p['owners'].capitalize()} on your list who have not bought anything yet",
             f"{p['problems'][0][0]}?", f"Why a busy {p['business']} can still have a thin month",
             f"Hi {F},\n\n{p['problems'][0][1]}\n\n{p['problems'][1][1]}\n\nNeither of these is a moral failing — it is usually just that the numbers live in different places.\n\n"
             f"Tomorrow I will share a simple way to see them together.\n\n{Y}"),
            ('Educational value', 'Engaged readers who opened email 1',
             f"The {lc(p['kpis'][0][0])} question", f"One number worth checking every month",
             f"Hi {F},\n\nHere is one number worth knowing for any {p['business']}: {lc(p['kpis'][0][0])}.\n\n{p['kpis'][0][1]}\n\n"
             f"Two more worth adding to your monthly check:\n- {p['kpis'][1][0]}: {p['kpis'][1][1]}\n- {p['kpis'][2][0]}: {p['kpis'][2][1]}\n\n"
             f"You can track these by hand. Next time I will show you a tool that does it for you.\n\n{Y}"),
            ('Product introduction', 'Readers who clicked email 2',
             f"The Excel system built for {p['owners']}", f"Dashboards, reports and tax set-aside — already built",
             f"Hi {F},\n\nThe tool I mentioned is the {T}.\n\nIt is a downloadable Excel workbook built for {p['owners']}. You log your own data and the dashboards, reports and tax set-aside estimate update for you. "
             f"It ships with sample data, a Field Guide and a Quick Start.\n\nA few things inside the Elite edition:\n" + ul(f"{d[0]}: {d[3]}" for d in p['demos'][:4])
             + f"\n\nIt needs a desktop version of Microsoft Excel. Have a look here: {L}\n\n{Y}\n\n{D}"),
            ('Tier comparison', 'Readers who visited the sales page but did not buy',
             'Essential, Elite or Complete?', 'A quick guide to choosing an edition',
             f"Hi {F},\n\nIf you looked at the {T} and were not sure which edition to pick, here is the short version:\n\n"
             f"- **Essential — {money(c, price(c, 'Essential'))}** ({len(self.ess['sheets'])} sheets): {p['tier_fit']['Essential']}\n"
             f"- **Elite — {money(c, price(c, 'Elite'))}** ({len(self.eli['sheets'])} sheets): {p['tier_fit']['Elite']}\n"
             f"- **Complete — {money(c, price(c, 'Complete'))}:** both editions together.\n\nA good question to ask yourself: {p['tier_questions'][0]}\n\nCompare them here: {L}\n\n{Y}\n\n{D}"),
            ('Final follow-up', 'Readers who opened the series but did not click',
             'Last note on this', f"Honest answers to the two questions I get most",
             f"Hi {F},\n\nI will stop talking about the {T} after this. Two honest answers before I do:\n\n**{p['objections'][1][0]}** {p['objections'][1][1]}\n\n"
             f"**{p['objections'][4][0]}** {p['objections'][4][1]}\n\nIf it fits how you run your {p['business']}, it is here: {L}\n\nEither way, thanks for reading.\n\n{Y}\n\n{D}"),
        ]
        md = (f"# {p['label']} — 5 Email Swipes\n\nSend only to people who agreed to receive your emails. Replace `{F}`, `{Y}` and `{L}`. "
              "No discounts, bonuses, deadlines or testimonials unless they really exist and ProfitIQS has approved them.\n")
        for i, (kind, seg, subj, prev, body) in enumerate(E, 1):
            md += (f"\n## Email {i}: {kind}\n\n**Audience segment:** {seg}  \n**Subject line:** {subj}  \n**Preview text:** {prev}  \n"
                   f"**CTA placeholder:** {L}\n\n```\n{body}\n```\n")
        return md

    # ---------- 07 graphics ----------
    def graphics(self, files):
        p, c = self.p, self.c
        md = (f"# {p['label']} — Static Graphics (rendered + briefs)\n\nAll ten graphics below are **already rendered** in `graphics/` from the real product files "
              "(dashboard renders with sample data and the real Field Guide covers). The brief explains each one so a designer can adapt it.\n\n"
              "**Required brand assets:** ProfitIQS mark (`00-Master-Affiliate-Kit/brand/`), product dashboard image and Field Guide covers (in `graphics/source/`). "
              "**Fonts:** Poppins. **Colors:** #0F172A slate, #2563EB blue, #10B981 emerald, #F59E0B amber, white.\n\n")
        md += table(['File', 'Format', 'Size', 'Headline', 'Supporting copy', 'CTA', 'Visual direction'],
                    [(f"`graphics/{f['file']}`", f['format'], f['size'], f['headline'], f['support'], f['cta'], f['visual']) for f in files])
        md += '\n**Before using any graphic:** check prices against the live sales page, add your disclosure in the post caption, and do not edit the screenshots to show figures the product does not produce.\n'
        return md

    # ---------- 08 audience ----------
    def audience(self):
        p = self.p
        return (f"# {p['label']} — Audience and Objection Guide\n\n{STATUS}\n\n## Target audience segments\n\n"
                + '\n'.join(f"- **{a}:** {b}" for a, b in p['profiles'])
                + '\n\n## Common objections and honest responses\n\n' + '\n'.join(f"**{a}**  \n{b}\n" for a, b in p['objections'])
                + '\n## Questions to answer before recommending an edition\n\n' + ul(p['tier_questions'])
                + '\n\n## Recommended edition by situation (from verified contents)\n\n' + '\n'.join(f"- **{k}:** {v}" for k, v in p['tier_fit'].items())
                + '\n\n## When the product is probably not a good fit\n\n' + ul(p['not_fit'])
                + "\n\nSaying so builds trust. A buyer who is not a fit is a refund, not a commission.\n")

    # ---------- 09 checklist ----------
    def checklist(self):
        p, c = self.p, self.c
        items = [
            ('Product accuracy', [f"Product name written exactly as **{p['title']}**", 'Every feature you mention appears in `02-Tier-Comparison.md`',
                                  f"Prices shown as Essential {money(c, price(c, 'Essential'))} / Elite {money(c, price(c, 'Elite'))} / Complete {money(c, price(c, 'Complete'))} and match the live page"]),
            ('Landing page', [f"Link points to the {p['label']} product, not another niche", f"Sales page loads on mobile and desktop ({self.SP})"]),
            ('Affiliate link', ['Your own Digistore24 affiliate link replaces every placeholder', 'The link opens the correct edition or marketplace entry']),
            ('Tracking', ['Click your link once from a private window and confirm it lands correctly', 'Confirm in your Digistore24 account that clicks are recorded (allow for reporting delays)']),
            ('Disclosure', ['Disclosure is visible near the link or in the first lines of the caption', 'Spoken or on-screen disclosure in videos']),
            ('Call to action', ['One clear CTA per post', 'No invented discounts, bonuses or deadlines']),
            ('Mobile readability', ['Text on graphics readable on a phone', 'Captions front-load the hook and link']),
            ('Claims and compliance', ['No income, savings, results or tax promises', 'No fake testimonials, reviews or screenshots',
                                       'Hypothetical examples labeled as hypothetical', 'Not described as AI, automation or a chatbot']),
        ]
        return (f"# {p['label']} — Pre-Publication Checklist\n\nTick every box before publishing anything for the {p['title']}.\n\n"
                + '\n'.join(f"## {a}\n\n" + '\n'.join(f"- [ ] {x}" for x in b) + '\n' for a, b in items))

    def readme(self, gfiles):
        p = self.p
        return (f"# {p['label']} Affiliate Kit — {p['title']}\n\n| File | What it is |\n|---|---|\n"
                "| `01-Niche-Overview-and-Product-Facts.md` | Audience, buyer profiles, problems, verified facts |\n"
                "| `02-Tier-Comparison.md` / `.csv` | Essential vs Elite vs Complete with every sheet listed |\n"
                "| `03-Video-Hooks.md` / `.csv` | 30 short-form hooks |\n| `04-Video-Scripts.md` | 10 recordable scripts (20–45s) |\n"
                "| `05-Social-Media-Copy.md` | 10 captions, 10 short posts, 5 CTAs, 5 educational concepts, 5 carousels, YouTube Shorts titles/descriptions |\n"
                "| `06-Email-Swipes.md` | 5 emails |\n| `07-Graphic-Briefs.md` + `graphics/` | 10 rendered graphics + briefs |\n"
                "| `08-Audience-and-Objections.md` | Segments, objections, honest answers, fit |\n| `09-Publishing-Checklist.md` | Pre-publication checks |\n\n"
                f"Graphics: {len(gfiles)} files in `graphics/`.\n")
