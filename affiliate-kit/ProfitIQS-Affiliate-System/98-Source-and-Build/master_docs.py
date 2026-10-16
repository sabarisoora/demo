"""Master kit, affiliate hub specification, audit report and launch checklist — all values from config.json."""
import datetime
from niche_docs import money, price, table, ul, csv_text


def fmt_date(s):
    return datetime.date.fromisoformat(s).strftime('%-d %B %Y') if s else 'onward'


def phase_rows(c):
    rows = []
    for ph in c['commission_phases']:
        end = fmt_date(ph['end']) if ph['end'] else 'no end date'
        rows.append((ph['months'], f"{ph['percent']}%", f"{fmt_date(ph['start'])} – {end}", ph['name']))
    return rows


def payout_rows(c):
    return [(t['tier'], money(c, t['price']), *(f"${t['price'] * ph['percent'] / 100:,.2f}" for ph in c['commission_phases']))
            for t in c['tiers']]


def current_phase(c, today=None):
    today = today or datetime.date.today()
    for ph in c['commission_phases']:
        s = datetime.date.fromisoformat(ph['start']); e = datetime.date.fromisoformat(ph['end']) if ph['end'] else None
        if s <= today and (e is None or today <= e):
            return ph
    return c['commission_phases'][0]


def master(c, niches):
    B, P, E = c['brand'], c['platform'], c['support_email']
    L, SP, HUB = c['placeholders']['affiliate_link'], c['placeholders']['sales_page'], c['placeholders']['hub_url']
    ph0 = c['commission_phases'][0]
    pct = '/'.join(str(p['percent']) for p in c['commission_phases'])
    nlist = table(['#', 'Niche', 'Exact product name', 'Kit folder'], [(n.p['n'], n.p['label'], n.p['title'], f"`{n.p['folder']}/`") for n in niches])
    prices = table(['Edition', 'Customer price'], [(t['tier'], money(c, t['price'])) for t in c['tiers']])
    disc = c['disclosure_long']
    docs = {}
    docs['Affiliate-Program-Overview.md'] = f"""# {B} Affiliate Program — Overview

## What {B} is

{B} makes downloadable Excel business intelligence systems for specific industries. Each product is a ready-built workbook with dashboards, reports and a tax set-aside estimate, plus a Field Guide and a Quick Start. Buyers enter their own data; the formulas are already in place.

## Who the products serve

Owners and managers of small businesses in {len(niches)} industries:

{nlist}
Every product comes in three editions:

{prices}
**Essential** covers the core numbers. **Elite** is the full system with deeper analysis. **Complete** includes both editions. The exact contents of each are in each niche's `02-Tier-Comparison.md`.

## How the program works

1. You promote a {B} product with your own {P} affiliate link.
2. A customer buys through your link on {P}.
3. {P} records the sale and credits your commission on eligible orders.
4. You see clicks, sales, refunds and commissions in your {P} account.

Launch commission: **{ph0['percent']}%** from {fmt_date(ph0['start'])} to {fmt_date(ph0['end'])}, then {c['commission_phases'][1]['percent']}% and {c['commission_phases'][2]['percent']}% under the planned schedule. See `Commission-Guide.md`.

## Choosing a niche

Pick the industry your audience already belongs to. Promoting the HVAC system to HVAC contractors converts better, and is more honest, than promoting every niche to everyone. You can promote several niches, each with its own kit.

## Finding your promotional links

- Sign in to {P} and find the {B} product (marketplace entry) for your niche. [NEEDS CONFIRMATION: marketplace entry names and approval status for each of the {len(niches)} entries]
- Request promotion if the product requires vendor approval.
- Copy your personal promotion link. Replace `{L}` in the kit with it.
- {B} does not issue affiliate links or IDs; they come from your {P} account.

## Product information and support

- Product facts for each niche: that niche's folder (`01-…` and `02-…` files).
- Customer product support: **{E}** (handled by {B}).
- Orders, payments and refunds: processed by {P}.
- Affiliate questions: email **{E}** with "{c['affiliate_support_subject']}" in the subject line.
- Affiliate hub: {HUB}
"""

    docs['Commission-Guide.md'] = f"""# Commission Guide

> **Single source of truth:** every percentage, date and example below comes from `98-Source-and-Build/config.json`. Change it there and rebuild — do not edit numbers by hand in individual files.

## Planned commission schedule

Launch date: **{fmt_date(c['launch_date'])}**

{table(['Period', 'Commission', 'Dates', 'Phase'], phase_rows(c))}
**Status:** {c['commission_status']}

- These are the **planned** program rates. {P} does not change them automatically; {B} updates the product settings at each phase change.
- The rate that applies to a sale is the rate set in {P} at the time of that sale.
- Nothing in this kit promises that a rate is locked for an affiliate for life.

## Illustrative commission per sale

Based on the displayed customer price, before {P} fees, taxes, refunds, chargebacks or other adjustments.

{table(['Edition', 'Price', *[f"At {p['percent']}%" for p in c['commission_phases']]], payout_rows(c))}
**These are simple illustrative calculations, not guaranteed payouts.** {P}'s actual commission basis (for example whether the percentage applies before or after platform fees and sales taxes) determines what you receive. [NEEDS CONFIRMATION: {P} commission basis and fees before quoting payout amounts publicly]

## How actual payouts can differ

- {P} may calculate commission on a net amount after its fees or VAT/sales tax.
- Refunds and chargebacks reverse commissions.
- Payout timing, thresholds and methods follow {P}'s terms and your account settings.

## Recruiting copy rules

- You may say: "{ph0['percent']}% launch commission through {fmt_date(ph0['end'])}, then {c['commission_phases'][1]['percent']}%, then {c['commission_phases'][2]['percent']}% standard."
- Do not say: "earn ${c['tiers'][2]['price'] * ph0['percent'] / 100:,.2f} per sale guaranteed", "lifetime {ph0['percent']}%", or any income promise.
"""
    docs['commission-schedule.csv'] = csv_text(['Period', 'Commission', 'Dates', 'Phase'], phase_rows(c))
    docs['illustrative-commission.csv'] = csv_text(['Edition', 'Price', *[f"At {p['percent']}%" for p in c['commission_phases']]], payout_rows(c))

    docs['Brand-Messaging-Guide.md'] = f"""# Brand Messaging Guide

## Approved brand description

**{B}** makes industry-specific business intelligence systems in Excel. Each product gives small-business owners ready-built dashboards, reports and a tax set-aside estimate for their own data, with a Field Guide and a Quick Start in every edition.

## Positioning statement

For owners of small, industry-specific businesses who have the data but not the view, {B} provides ready-built Excel business intelligence systems that turn everyday records into dashboards and reports — without new software to learn or a monthly subscription. [NEEDS CONFIRMATION: "no monthly subscription" depends on final purchase terms]

## Voice and tone

- **Clear:** plain English, short sentences, real sheet names.
- **Practical:** talk about what the owner sees and does, not abstract "insights".
- **Honest:** say who it is not for; never overpromise.
- **Respectful:** owners are experts in their trade, not in spreadsheets.

## Product naming

- Convention: **{c['naming_convention']}**
- Use the exact names from the product files: {', '.join(n.p['title'] for n in niches)}.
- Editions are written "Essential", "Elite" and "Complete" (optionally with "2026").
- Allowed short forms: "DMA" for the Digital Marketing Agency product, in social copy only. Never use "DMA" as the product title.
- Never call the products "Profit Intelligence Systems". Never call them AI, automation, a chatbot or a voice agent — those are separate services.

## Approved claims (VERIFIED from the product files)

{ul(['Downloadable Excel workbook built for one industry',
     'Formulas, dashboards and reports are already built in; the owner enters their own data',
     'Ships with sample data so every dashboard works immediately',
     'Each edition includes a Field Guide (PDF) and a Quick Start (PDF)',
     'Essential, Elite and Complete editions; Complete includes both Essential and Elite',
     'Tax set-aside estimate and accountant-ready summary (planning estimates, not advice)',
     'Requires a desktop version of Microsoft Excel',
     'Sheet names and counts listed in each niche\'s tier comparison'])}

## Claims and language to avoid

{ul(['Income, profit, savings or growth promises ("double your profit", "save 10 hours a week")',
     'Tax outcomes ("pay less tax", "audit-proof", "maximize your refund")',
     'Social proof that does not exist (reviews, testimonials, "best-selling", customer counts)',
     'Urgency or scarcity that is not real (countdowns, "only today", "price going up")',
     'Integrations or automation the product does not have (syncs, AI, real-time cloud data)',
     '"Approved on Digistore24" until the marketplace entry is confirmed',
     'Discounts, coupons or bonuses not approved by ProfitIQS'])}

## Keeping material accurate

Every claim should be traceable to the niche's `02-Tier-Comparison.md` or the Field Guide. If you cannot point to it, do not say it.
"""

    docs['Affiliate-Launch-Checklist.md'] = '# Affiliate Launch Checklist\n\n' + '\n'.join(
        f"## {a}\n\n" + '\n'.join(f"- [ ] {x}" for x in b) + '\n' for a, b in [
            ('1. Select a niche', ['Choose the industry your audience belongs to', 'Open that niche folder and read `README.md`']),
            ('2. Review the product', ['Read `01-Niche-Overview-and-Product-Facts.md` and `02-Tier-Comparison.md`', 'Note which edition fits your audience']),
            ('3. Access promotional assets', ['Pick hooks, scripts, posts and emails', 'Download the graphics from `graphics/`']),
            ('4. Get the correct tracking link', [f'Sign in to {P} and request promotion if required', 'Copy the link for the correct niche and edition', f'Replace every `{L}`']),
            ('5. Check the landing page', ['The link opens the right product', 'The page loads on mobile', 'Prices match the kit']),
            ('6. Test tracking (approved method)', ['Click your own link once from a private browser window — do not buy through your own link to test',
                                                    f'Confirm the click appears in your {P} reports (reporting can be delayed)']),
            ('7. Publish', ['Disclosure in every post, email and video', 'Run the niche `09-Publishing-Checklist.md`']),
            ('8. Monitor', [f'Check clicks, sales and refunds in {P} weekly', 'Note which hooks and channels get clicks; drop what does not work',
                            f'Watch for commission phase changes ({", ".join(fmt_date(p["start"]) for p in c["commission_phases"][1:])})'])])

    docs['Compliance-Guide.md'] = f"""# Affiliate Compliance Guide

Plain rules for promoting {B}. They do not replace {P}'s affiliate terms or the laws where you and your audience live; those always apply.

## 1. Disclose clearly
Put the disclosure next to the link or at the start of a caption. Say it in videos. Examples: "{c['disclosure_short']}", "{disc}" A disclosure hidden behind "more" or in a profile link is not enough.

## 2. Describe the product honestly
Say what it is: a downloadable Excel system with dashboards, reports, a Field Guide and a Quick Start. Mention that it needs desktop Excel.

## 3. No fake reviews or testimonials
Never write reviews, testimonials, ratings, "customer" quotes or screenshots that did not happen. If you bought and used the product, you can share your own honest experience.

## 4. No income or results claims
Do not promise profit, savings, time saved, growth or tax outcomes for buyers — or earnings for other affiliates.

## 5. No spam or misleading advertising
Email only people who opted in to hear from you. No bulk unsolicited messages, comment spam, misleading ad headlines or clickbait that misrepresents the product.

## 6. No impersonation
Do not present yourself as {B} or {P}, use their logos as your own brand, register lookalike domains or social accounts, or bid on "{B}" brand keywords unless {B} allows it. [NEEDS CONFIRMATION: brand-keyword bidding policy]

## 7. Respect customer data
Do not collect, buy or share personal data without consent. Follow the privacy and email-marketing laws that apply to you (for example CAN-SPAM in the US).

## 8. No unapproved discounts, bonuses or guarantees
Only mention offers that really exist on the sales page or that {B} approved in writing. Do not invent refund promises — refunds follow {P}'s process.

## 9. No unsupported functionality claims
No integrations, automatic syncing, AI, cloud dashboards or multi-user access unless the product files say so. They do not.

## If you are unsure
Leave it out, or ask: **{E}** (subject: "{c['affiliate_support_subject']}").
"""

    ph1 = c['commission_phases']
    docs['Shared-Promotional-Copy.md'] = f"""# Shared Promotional Copy

## Master brand description
{B} makes industry-specific business intelligence systems in Excel: ready-built dashboards, reports and tax set-aside estimates for small-business owners, with a Field Guide and Quick Start in every edition.

## Affiliate program — short description (for recruiting affiliates)
Promote {B}'s industry-specific Excel business systems on {P}. {len(niches)} niches, three editions each ({'/'.join(money(c, t['price']) for t in c['tiers'])}), ready-made promotion kits, and a planned {ph1[0]['percent']}% launch commission through {fmt_date(ph1[0]['end'])}.

## Affiliate program — long description
{B} sells downloadable Excel business intelligence systems for {len(niches)} industries — from auto repair shops and dental practices to ecommerce stores and HVAC contractors. Each product comes as Essential ({money(c, price(c, 'Essential'))}), Elite ({money(c, price(c, 'Elite'))}) and Complete ({money(c, price(c, 'Complete'))}).

Affiliates get a full kit per niche: 30 video hooks, 10 scripts, social captions and carousels, five email swipes and ten ready-made graphics, all written from the real product contents.

Planned commission: {ph1[0]['percent']}% from {fmt_date(ph1[0]['start'])} to {fmt_date(ph1[0]['end'])}, {ph1[1]['percent']}% from {fmt_date(ph1[1]['start'])} to {fmt_date(ph1[1]['end'])}, then {ph1[2]['percent']}% standard. Commissions are tracked and paid through {P}. No earnings are promised.

## Three social announcements (to recruit affiliates)

1. ```
New affiliate program: {B} — Excel business intelligence systems for {len(niches)} industries. Planned {ph1[0]['percent']}% launch commission until {fmt_date(ph1[0]['end'])}. Full promo kits included. Join via {P}: {HUB}
```
2. ```
If your audience runs a small business — repair shops, cleaners, contractors, dentists, agencies, stores — {B} has a niche Excel system for them. Essential/Elite/Complete, ready-made hooks, scripts and graphics. Details: {HUB}
```
3. ```
Affiliates: {B} launched on {P} with a planned {ph1[0]['percent']}% → {ph1[1]['percent']}% → {ph1[2]['percent']}% commission schedule and a promotion kit for every niche. No hype, real product facts. {HUB}
```

## Three email announcements (to affiliates / your partner list)

**1. Subject:** {B} affiliate program is live on {P}
```
Hi {c['placeholders']['first_name']},

{B} just launched its affiliate program on {P}. {B} sells downloadable Excel business intelligence systems for {len(niches)} industries, each in Essential, Elite and Complete editions.

Planned launch commission: {ph1[0]['percent']}% until {fmt_date(ph1[0]['end'])}, then {ph1[1]['percent']}% and {ph1[2]['percent']}%.

Every niche has a ready-made kit: hooks, scripts, posts, emails and graphics. Start here: {HUB}

{c['placeholders']['your_name']}
```
**2. Subject:** Pick the niche your audience already lives in
```
Hi {c['placeholders']['first_name']},

The {B} kits are built per industry, so the best results usually come from matching one niche to one audience. The {len(niches)} niches: {', '.join(n.p['label'] for n in niches)}.

Each kit has a tier comparison written from the real product files, so you can recommend the right edition honestly. {HUB}

{c['placeholders']['your_name']}
```
**3. Subject:** Reminder: launch commission phase ends {fmt_date(ph1[0]['end'])}
```
Hi {c['placeholders']['first_name']},

A note on timing: the planned {ph1[0]['percent']}% launch commission runs until {fmt_date(ph1[0]['end'])}. From {fmt_date(ph1[1]['start'])} the planned rate is {ph1[1]['percent']}%, and from {fmt_date(ph1[2]['start'])} {ph1[2]['percent']}%.

Kits and graphics: {HUB}

{c['placeholders']['your_name']}
```

## General calls to action (customer-facing)
{ul([f'See the three editions: {L}', f'Explore the sample workbook: {L}', f'Pick the edition that fits your business: {L}', f'Built for your industry — take a look: {L}'])}

## Support and tracking placeholders
- Affiliate hub: {HUB}
- Sales pages: {SP}
- {P} product IDs: {c['placeholders']['product_id']}
- Support email (verified): {E}
"""

    docs['Brand-Asset-Inventory.md'] = f"""# Brand Asset Inventory

| Asset | Location | Status |
|---|---|---|
| ProfitIQS mark (transparent PNG) | `00-Master-Affiliate-Kit/brand/profitiqs-mark.png` | VERIFIED (from product brand files) |
| Product dashboard images, 11 niches | `<niche>/graphics/source/dashboard.png` | VERIFIED renders of each Elite workbook with sample data |
| Field Guide covers (Essential + Elite), 11 niches | `<niche>/graphics/source/cover-essential.png`, `cover-elite.png` | VERIFIED (page 1 of the shipped guides) |
| Ten ready graphics per niche | `<niche>/graphics/` | Rendered from the above |
| Affiliate recruitment graphic | `00-Master-Affiliate-Kit/graphics/` | Rendered |
| Fonts | Poppins (Google Fonts, OFL) | Available |
| Colors | #0F172A, #2563EB, #10B981, #F59E0B, #FFFFFF | Defined |
| Product logos / box shots | — | Not available: use Field Guide covers instead |
| Sales-page screenshots | — | [NEEDS CONFIRMATION: sales pages not yet available] |
"""
    return docs


def hub(c, niches):
    B, P, E, HUB = c['brand'], c['platform'], c['support_email'], c['placeholders']['hub_url']
    ph = c['commission_phases']
    return {'Affiliate-Hub-Specification.md': f"""# {B} Affiliate Hub — Specification

The site's existing `/affiliates` portal (built earlier in this project, in `affiliates/` of the demo repository) already implements most of this hub: landing page, product directory with search and filters, one resource page per niche with copy buttons and downloads. This spec lists what to add so the hub matches this kit. Implementation is being done separately in VS Code; nothing here was deployed.

## URL: {HUB}

## Navigation
Home · Commission · Niches · Resources · Tracking help · Compliance · Contact

## Pages and content

### 1. Welcome (`/affiliates/`)
- H1: "Partner With {B}. Promote Smarter Business Systems."
- Sub: "Industry-specific Excel business intelligence systems for {len(niches)} industries, with a ready-made promotion kit for every niche."
- Commission panel (from `config.json`): **{ph[0]['percent']}% launch commission** {fmt_date(ph[0]['start'])} – {fmt_date(ph[0]['end'])}, then {ph[1]['percent']}% ({fmt_date(ph[1]['start'])}), then {ph[2]['percent']}% standard ({fmt_date(ph[2]['start'])}). Small print: "Planned schedule. Rates are set in {P} at the time of sale. Illustrative amounts are not guaranteed payouts."
- Price row: {' · '.join(f"{t['tier']} {money(c, t['price'])}" for t in c['tiers'])}
- CTAs: "Browse niches" · "Download the master kit"

### 2. Master resources (`/affiliates/resources/`)
Downloads of the `00-Master-Affiliate-Kit` files: Program Overview, Commission Guide, Brand Messaging Guide, Launch Checklist, Compliance Guide, Shared Promotional Copy, brand mark.

### 3. Commission schedule (`/affiliates/commission/`)
The schedule table and illustrative table from `Commission-Guide.md`, with the "how payouts can differ" notes.

### 4. Niche directory (`/affiliates/#products`)
One card per niche: exact product name, three editions with prices, commission, "Open kit" link. Existing portal cards already do this; add prices.

### 5. Niche sections (`/affiliates/<slug>/`)
Existing pages plus: download link for the niche kit ZIP, the 30 hooks, 10 scripts, carousels and the 10 graphics from this kit.

| Niche | Slug | Kit folder |
|---|---|---|
""" + ''.join(f"| {n.p['label']} | `{n.p['slug']}` | `{n.p['folder']}/` |\n" for n in niches) + f"""
### 6. Tracking and troubleshooting (`/affiliates/tracking/`)
- Where to find your link: {P} account → the {B} product → promotion link. [NEEDS CONFIRMATION: exact {P} menu path]
- My clicks are not showing: reporting can be delayed; test once from a private window; check you used the correct product's link.
- I clicked my own link and bought: do not — self-purchases may be rejected under {P}'s terms. [NEEDS CONFIRMATION]
- Cookie duration, payout schedule, refund windows: see {P} terms / your account. [NEEDS CONFIRMATION]

### 7. Compliance (`/affiliates/#guidelines`)
Content of `Compliance-Guide.md`, labeled "{B} guidelines — {P}'s terms remain binding".

### 8. Contact and support
Affiliate questions: **{E}** (subject "{c['affiliate_support_subject']}"). Account, tracking and payout questions: {P} support.

## Implementation notes
- Keep commission values in one data file (the portal already uses `data/program.json`; mirror `config.json` here).
- Show the {ph[0]['percent']}% launch rate only while the launch phase is active; switch automatically by date.
- Do not publish sales-page links or "approved" badges until confirmed.
"""}


def audit(c, niches, upload_note):
    rows_found = [
        ('11 shipped product packages (Essential/Elite/Complete ZIPs)', 'Project files (release builds)', 'VERIFIED — titles, sheets, guide pages read directly'),
        ('Auto Repair Complete ZIP uploaded by owner', 'Upload, 16 Oct 2026', upload_note),
        ('Affiliate portal (static site)', '`affiliates/` in sabarisoora/demo', 'Built earlier; prices and commission schedule pre-date this brief (see corrections)'),
        ('Dashboard renders per niche', '`affiliates/assets/products/`', 'VERIFIED renders of each Elite workbook (Cleaning uses Job Profitability)'),
        ('Banners (5 sizes × 11)', '`affiliates/assets/banners/`', 'Valid; contain no prices or commission'),
        ('Product marketing copy in portal', '`affiliates/scripts/promo_copy.py`', 'Accurate but generic; superseded by these niche kits'),
        ('ProfitIQS mark', 'brand files', 'VERIFIED'),
        ('Support email support@profitiqs.com', 'Product License/Support PDFs, workbooks', 'VERIFIED'),
    ]
    return {'Audit-Report.md': f"""# Phase 1 — Audit Report

Date: {datetime.date.today().isoformat()}

## What was inspected
- The 11 shipped 2026 product packages (every workbook, Field Guide and Quick Start).
- The file uploaded as the "existing Auto Repair kit".
- The affiliate portal and assets built earlier in this project.
- The website repositories available to this session.

## Limitations (stated honestly)
- **No existing Auto Repair affiliate-growth kit was found.** The upload "Auto_Repair_Shop_Business_Intelligence_System_Complete_2026.zip" is the product package itself — all 9 files are byte-identical to the shipped Auto Repair release. It contains no affiliate copy, hooks, scripts or graphics. The Auto Repair kit was therefore built from scratch as the reference template.
- **profitiqs.com could not be reached** from this environment (DNS lookup fails), so no live sales pages, prices or URLs were inspected. The only website code available (`profit-intel`) is an older "Profit Intelligence Systems" page, not profitiqs.com.
- No Digistore24 account, product IDs, marketplace entries or approval status were available.

## 1. Assets found
{table(['Asset', 'Where', 'Status'], rows_found)}
## 2. Assets verified
- Exact product names for all {len(niches)} niches (from workbook, guide and ZIP names).
- Edition contents: sheet lists and counts, Field Guide and Quick Start page counts, License/README/Support PDFs in every edition.
- Support email: {c['support_email']}.
- Prices $97 / $197 / $249 and the 90/85/80 schedule: supplied by the owner in the brief (not verifiable from files).

## 3. Assets needing corrections
- **Affiliate portal:** shows 80% and "Pricing: see official sales page". Update to the {'/'.join(str(p['percent']) for p in c['commission_phases'])} schedule and $97/$197/$249 (owner is implementing in VS Code).
- **Portal Auto Repair title flag:** resolved — the brief confirms "Auto Repair Shop Business Intelligence System™".
- **Cleaning Service sample data:** the Elite dashboard's sample data shows a large loss (−$379K all-month profit). Graphics use the Job Profitability sheet instead; consider rebalancing the sample data before heavy promotion.
- **HVAC Elite sample data:** technician hours make "efficiency" read $3–5/hr; avoid showing that sheet in promotion until rebalanced.
- **Digital Marketing, Electrical, Pest Control Essential:** dashboard tile "GROSS MARGIN %" is actually net margin (label fix pending your decision). Kits avoid quoting that tile.

## 4. Assets missing
- Sales-page URLs for 11 niches (33 editions).
- {c['platform']} product IDs, marketplace entries and approval status.
- Affiliate hub public URL.
- Product box shots / logos (Field Guide covers used instead).
- Real customer reviews (none exist yet — none were created).

## 5. Items requiring human confirmation
- {c['platform']} commission basis (before/after fees and taxes) before quoting payouts.
- That the phase changes on {', '.join(fmt_date(p['start']) for p in c['commission_phases'][1:])} will be applied manually in {c['platform']}.
- Purchase terms (one-time purchase, refund policy) shown on the sales page.
- Brand-keyword bidding policy for affiliates.
- Whether the Essential/Elite/Complete tiers can be offered as related tiers inside one marketplace entry per niche.
- Approval of the rendered graphics before distribution.
"""}


def prelaunch(c, niches):
    return {'Pre-Launch-Checklist-ProfitIQS-Team.md': '# Pre-Launch Checklist — ProfitIQS Team\n\n' + '\n'.join(
        f"## {a}\n\n" + '\n'.join(f"- [ ] {x}" for x in b) + '\n' for a, b in [
            ('Digistore24 setup', [f'Create/confirm 11 marketplace entries (one per niche) with Essential, Elite, Complete as related tiers where allowed',
                                   'Set prices: Essential $97, Elite $197, Complete $249',
                                   f"Set affiliate commission to {c['commission_phases'][0]['percent']}% for launch on {fmt_date(c['launch_date'])}",
                                   'Calendar reminders to change commission: ' + ', '.join(f"{p['percent']}% on {fmt_date(p['start'])}" for p in c['commission_phases'][1:]),
                                   'Confirm commission basis (before/after fees) and record it in config.json',
                                   'Submit each entry for marketplace approval; record approval status']),
            ('Fill the placeholders', ['Sales-page URL per niche → config.json / niche files', 'Digistore24 product IDs', 'Affiliate hub URL',
                                       'Rebuild the kit (python3 98-Source-and-Build/build_kit.py) so every file updates']),
            ('Sales pages', ['Each page names the product exactly as in this kit', 'Prices match', 'Disclaimer: planning tool, not tax/legal/financial advice',
                             'Mobile check']),
            ('Kit approval', ['Review one niche kit end to end (Auto Repair is the reference)', 'Approve the 10 graphics per niche',
                              'Decide on Cleaning and HVAC sample-data rebalance before promotion']),
            ('Hub', ['Portal updated with prices and the commission schedule', 'Niche kit ZIPs downloadable from each niche page',
                     'Commission panel switches automatically by date']),
            ('Launch day', ['Send the affiliate announcement email', 'Post the recruiting announcements', 'Monitor first clicks/sales in Digistore24']),
        ])}
