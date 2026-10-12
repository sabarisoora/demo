"""Marketing copy for each niche, built only from facts in data/products.json.

Rules this file follows (keep them when editing):
- no income, earnings or results promises; no time-saved or tax-saved figures
- no testimonials, reviews, ratings, scarcity or countdowns
- prices are never written into copy (they change; the sales page is the source of truth)
- every piece carries the affiliate-link placeholder and, where it is a post or email, a disclosure

Any text placed in a product's "custom_copy" object (same keys as below) replaces the generated version.
"""

LINK = '[YOUR AFFILIATE LINK]'
DISCLOSURE = 'Disclosure: I may earn a commission if you buy through this link, at no extra cost to you.'
TAG = '#ad'


def _sheets(p, tier):
    return len(p['essential_sheets'] if tier == 'Essential' else p['elite_sheets'])


def _tax_line(p):
    if p['multi_country_tax']:
        return 'Pick your country once and the tax set-aside rates, currency and VAT/GST labels follow from a built-in rate table.'
    return 'Estimated-tax and quarterly planning sheets show what to set aside as you go.'


def build(p):
    t, ind, who, biz = p['product_title'], p['industry'], p['audience_short'], p['business_phrase']
    q = p['questions']
    es, el = _sheets(p, 'Essential'), _sheets(p, 'Elite')
    ess_b = '\n'.join(f'• {x}' for x in p['essential_highlights'])
    eli_b = '\n'.join(f'• {x}' for x in p['elite_highlights'])

    headlines = [
        f'{t}: the numbers behind your {biz}, in one Excel workbook',
        p['one_liner'],
        f'{q[0]} This Excel system shows you.',
        f'Built for {who}: dashboards, tax set-aside and profit tracking in Excel',
        f'Stop guessing. See the numbers behind your {biz} clearly.',
        f'Essential, Elite or Complete: an Excel business system made for {who}',
    ]

    short = (f'{t} is a downloadable Excel system for {who}. Log your activity and expenses, and the built-in '
             f'dashboards, tax set-aside estimate and business health score update automatically. '
             f'Available as Essential, Elite and Complete. {LINK}')

    long = (f'Running a {biz} means answering questions like "{q[0]}" and "{q[1]}" '
            f'— usually without clear numbers.\n\n'
            f'{t} is an industry-specific Excel workbook built for {p["audience"].lower()}. '
            f'You enter your own data; the formulas, dashboards and reports are already built in.\n\n'
            f'Essential 2026 ({es} sheets) covers the core:\n{ess_b}\n\n'
            f'Elite 2026 ({el} sheets) adds deeper analysis:\n{eli_b}\n\n'
            f'Complete 2026 includes both editions. Every edition comes with a Field Guide and a Quick Start '
            f'guide, and sample data so you can see how everything works before entering your own. {_tax_line(p)}\n\n'
            f'It is a planning and tracking tool, not tax, legal or financial advice.\n\n'
            f'See the editions: {LINK}')

    features = (f'{t}\n\nEssential 2026 — {es} sheets\n{ess_b}\n\nElite 2026 — {el} sheets\n{eli_b}\n\n'
                f'Complete 2026 — both editions in one package\n\nEvery edition: Excel workbook, Field Guide (PDF), '
                f'Quick Start (PDF), sample data included.')

    emails = [
        dict(name='Introduction',
             subject=f'A clearer view of your {biz} numbers',
             body=(f'Hi [First name],\n\n'
                   f'If you run a {biz}, you have probably asked yourself: "{q[0]}"\n\n'
                   f'I wanted to share a tool that helps answer that. {t} is a downloadable Excel workbook made for '
                   f'{who}. You log your own figures and the dashboards, tax set-aside estimate and health score '
                   f'update for you.\n\nWhat it covers:\n{ess_b}\n\n'
                   f'There are three editions — Essential, Elite and Complete — so you can start with what you need.\n\n'
                   f'Take a look here: {LINK}\n\n[Your name]\n\n{DISCLOSURE}')),
        dict(name='Which edition fits',
             subject=f'Essential, Elite or Complete? A quick guide for {who}',
             body=(f'Hi [First name],\n\n'
                   f'A quick follow-up on {t}, because the editions are different tools:\n\n'
                   f'ESSENTIAL 2026 ({es} sheets) — the core numbers:\n{ess_b}\n\n'
                   f'ELITE 2026 ({el} sheets) — for owners who want the deeper view:\n{eli_b}\n\n'
                   f'COMPLETE 2026 — both editions together.\n\n'
                   f'Each comes with a Field Guide and Quick Start, and sample data to explore first.\n\n'
                   f'Compare them here: {LINK}\n\n[Your name]\n\n{DISCLOSURE}')),
    ]

    social = [
        dict(name='LinkedIn', text=(f'Most {who} I talk to can tell you their revenue. Far fewer can tell you '
                                    f'"{q[0].rstrip("?").lower()}?"\n\n{t} is an Excel system built for exactly that: '
                                    f'{p["one_liner"][0].lower() + p["one_liner"][1:]}\n\n'
                                    f'Three editions: Essential, Elite and Complete.\n\n{LINK}\n\n{TAG} — affiliate link')),
        dict(name='Facebook', text=(f'{q[0]}\n\nIf you run a {biz}, {t} is worth a look: a downloadable '
                                    f'Excel workbook with dashboards, a tax set-aside estimate and a business health score.\n\n'
                                    f'{LINK}\n\n{TAG} I may earn a commission from this link.')),
        dict(name='X / Twitter', text=(f'{who.capitalize()}: {p["one_liner"]} {t} (Excel). {LINK} {TAG}')),
        dict(name='Instagram', text=(f'{p["one_liner"]}\n\n{t} — built in Excel for {who}.\n\n'
                                     f'✔ Dashboards\n✔ Tax set-aside estimate\n✔ Business health score\n✔ Field Guide included\n\n'
                                     f'Link in bio. {TAG} affiliate link').replace('✔', '–')),
    ]

    videos = [
        dict(name='30-second script', text=(
            f'[HOOK — 0:00] "{q[0]}"\n'
            f'[PROBLEM — 0:04] Most {who} can\'t answer that quickly, because the numbers are scattered.\n'
            f'[PRODUCT — 0:09] {t} is an Excel workbook made for {who}. '
            f'Show the dashboard on screen.\n'
            f'[HOW — 0:16] You enter your own figures. Dashboards, tax set-aside and a health score update for you.\n'
            f'[CTA — 0:24] Essential, Elite or Complete — see the editions at the link. (Say: "affiliate link")\n')),
        dict(name='60-second walkthrough', text=(
            f'[HOOK — 0:00] Three questions every owner of a {biz} should be able to answer: '
            f'{q[0]} {q[1]} {q[2]}\n'
            f'[CONTEXT — 0:10] {t} is a downloadable Excel system built for {who}.\n'
            f'[ESSENTIAL — 0:18] Essential covers the core: ' + '; '.join(p['essential_highlights'][:3]).lower() + '.\n'
            f'[ELITE — 0:30] Elite goes deeper: ' + '; '.join(p['elite_highlights'][:3]).lower() + '.\n'
            f'[INCLUDED — 0:42] Every edition includes a Field Guide, a Quick Start and sample data to explore first.\n'
            f'[CTA — 0:50] Compare Essential, Elite and Complete at the link. Disclose on screen: "Affiliate link — I may earn a commission."\n')),
    ]

    faq = [
        (f'What is {t}?', f'A downloadable Excel workbook for {who}. You enter your own data and the built-in dashboards and reports update automatically.'),
        ('What is the difference between Essential, Elite and Complete?',
         f'Essential ({es} sheets) covers the core tracking, tax set-aside estimate and dashboard. Elite ({el} sheets) adds deeper analysis. Complete includes both editions.'),
        ('What do I need to use it?', 'A desktop version of Microsoft Excel. The guides recommend full Excel rather than a lightweight viewer.'),
        ('Does it come with instructions?', 'Yes. Each edition includes a Field Guide (PDF) and a Quick Start (PDF).'),
        ('Can I try it with sample data?', 'Yes. Each workbook ships with sample data so every dashboard works immediately; you replace it with your own figures.'),
        ('Is it tax or accounting advice?', 'No. Tax rates and figures are planning estimates. Always confirm with a licensed accountant or your local tax authority.'),
        ('Who do I contact for product support?', 'ProfitIQS support: support@profitiqs.com.'),
    ]

    out = dict(headlines=headlines, short=short, long=long, features=features, emails=emails,
               social=social, videos=videos, faq=faq)
    out.update(p.get('custom_copy') or {})
    return out
