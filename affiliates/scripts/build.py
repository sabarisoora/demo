"""Build the ProfitIQS affiliate portal into affiliates/site/ (deploy that folder at /affiliates).

    python3 scripts/build.py            # from the affiliates/ folder

Reads data/program.json and data/products.json. No dependencies beyond the Python standard library.
"""
import json, os, shutil, datetime, html, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import promo_copy as copylib   # noqa: E402  (scripts/promo_copy.py)

OUT = os.path.join(ROOT, 'site')
PROG = json.load(open(os.path.join(ROOT, 'data', 'program.json')))
PRODUCTS = json.load(open(os.path.join(ROOT, 'data', 'products.json')))['products']
TODAY = datetime.date.today()
E = lambda s: html.escape(str(s), quote=True)
BASE = PROG['site_url'].rstrip('/') + PROG['portal_path'].rstrip('/')
EMAIL = PROG['support_email']
DS = PROG['affiliate_platform']


def promo_active():
    p = PROG['launch_promotion']
    if not (p.get('enabled') and p.get('verified') and p.get('start_date') and p.get('end_date')):
        return False
    s, e = (datetime.date.fromisoformat(p[k]) for k in ('start_date', 'end_date'))
    return s <= TODAY <= e


def commission_text():
    return f"{PROG['commission']['standard_percent']}%"


def niche_indexable(p):
    """A niche page goes into search engines only once its sales page and approval are verified."""
    return p.get('approval_status') == 'approved' and any(t.get('sales_page_url') for t in p['tiers'])


def availability(p):
    if p.get('approval_status') == 'approved' and p.get('promotion_available'):
        return 'available', 'Available to promote'
    return 'pending', 'Approval pending'


def icon(name, size=20):
    paths = {
        'grid': '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        'layers': '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 13 10 5 10-5"/><path d="m2 17.5 10 5 10-5" opacity=".5"/>',
        'file': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
        'link': '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
        'megaphone': '<path d="M3 11v2a2 2 0 0 0 2 2h2l5 4V5L7 9H5a2 2 0 0 0-2 2Z"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M19 5a9 9 0 0 1 0 14"/>',
        'chart': '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
        'shield': '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
        'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        'copy': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
        'download': '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
        'check': '<path d="m5 12 5 5 9-10"/>',
        'arrow': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
        'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
        'video': '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
        'chat': '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
        'excel': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
        'support': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
        'x': '<path d="M6 6l12 12M18 6 6 18"/>',
    }
    return (f'<svg class="ic" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[name]}</svg>')


def page(title, desc, canonical, body, rel='', indexable=True, jsonld=None, active=''):
    robots = 'index,follow' if indexable else 'noindex,follow'
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ''
    nav = [('Products', f'{rel}index.html#products'), ('How it works', f'{rel}index.html#how'),
           ('Guidelines', f'{rel}index.html#guidelines'), ('FAQ', f'{rel}index.html#faq')]
    navh = ''.join(f'<a href="{h}">{n}</a>' for n, h in nav)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{E(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{E(canonical)}">
<meta property="og:image" content="{E(BASE)}/assets/og-affiliates.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0F172A">
<link rel="icon" href="{rel}assets/brand/mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{rel}assets/portal.css">
{ld}
</head>
<body class="{active}">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap topbar-in">
    <a class="brand" href="{rel}index.html" aria-label="ProfitIQS Affiliate Partners home">
      <img src="{rel}assets/brand/mark.png" alt="" width="30" height="30"><span>ProfitIQS</span><em>Partners</em>
    </a>
    <nav class="mainnav" aria-label="Affiliate portal">{navh}</nav>
    <a class="btn btn-sm btn-dark" href="{rel}index.html#products">Explore products</a>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="footer">
  <div class="wrap footer-in">
    <div>
      <a class="brand brand-light" href="{rel}index.html"><img src="{rel}assets/brand/mark.png" alt="" width="26" height="26"><span>ProfitIQS</span><em>Partners</em></a>
      <p>Industry-specific Excel business intelligence systems. Affiliate tracking and payouts are handled by {E(DS['name'])}.</p>
    </div>
    <div class="footer-links">
      <a href="{rel}index.html#products">Affiliate products</a>
      <a href="{rel}index.html#how">How it works</a>
      <a href="{rel}index.html#guidelines">Promotion guidelines</a>
      <a href="{rel}index.html#faq">FAQ</a>
      <a href="mailto:{EMAIL}">{EMAIL}</a>
    </div>
  </div>
  <div class="wrap footer-fine">ProfitIQS products are planning and tracking tools, not tax, legal or financial advice. Commission rates and eligibility are set in {E(DS['name'])} and may change. &copy; {TODAY.year} ProfitIQS</div>
</footer>
<div class="toast" role="status" aria-live="polite"></div>
<script src="{rel}assets/portal.js" defer></script>
</body>
</html>
"""


def commission_block():
    c = PROG['commission']
    promo = PROG['launch_promotion']
    promo_html = ''
    if promo_active():
        promo_html = (f'<div class="promo" data-promo-end="{E(promo["end_date"])}">{icon("info", 18)}<div><b>Launch promotion: '
                      f'{promo["percent"]}% commission</b> on eligible sales from {E(promo["start_date"])} to {E(promo["end_date"])}. '
                      f'After that the standard {c["standard_percent"]}% applies.</div></div>')
    return f"""
<section class="section commission" id="commission" aria-labelledby="commission-h">
  <div class="wrap commission-in">
    <div class="commission-rate">
      <div class="eyebrow eyebrow-light">Standard commission</div>
      <div class="rate"><span>{c['standard_percent']}</span>%</div>
      <p>on eligible sales, tracked and paid through {E(DS['name'])}.</p>
    </div>
    <div class="commission-copy">
      <h2 id="commission-h">Clear, platform-tracked commission</h2>
      <p>{E(c['note'])}</p>
      <ul class="ticks ticks-light">
        <li>{icon('check', 18)}<span>One rate across Essential, Elite and Complete editions</span></li>
        <li>{icon('check', 18)}<span>Sales, refunds and payouts are recorded in your {E(DS['name'])} account</span></li>
        <li>{icon('check', 18)}<span>No earnings are promised — results depend on your audience and promotion</span></li>
      </ul>
      {promo_html}
      <p class="fine-light">Rate last confirmed {E(c['last_verified'])}. Cookie duration, payout schedule and refund handling follow {E(DS['name'])}'s terms and your account settings.</p>
    </div>
  </div>
</section>"""


def card(p):
    st, label = availability(p)
    tiers = ''.join(f'<span class="chip">{E(t["tier"])}</span>' for t in p['tiers'])
    prices = [t for t in p['tiers'] if t.get('price_verified') and t.get('price')]
    price_html = (' · '.join(f'{E(t["tier"])} {E(t["currency"] or "")}{E(t["price"])}' for t in prices)
                  if prices else 'Pricing: see official sales page')
    tier_attr = ' '.join(t['tier'].lower() for t in p['tiers'])
    search = ' '.join([p['industry'], p['product_title'], p['audience'], p['one_liner']] + p['elite_highlights']).lower()
    return f"""
<article class="pcard" data-industry="{E(p['slug'])}" data-tiers="{E(tier_attr)}" data-status="{st}" data-search="{E(search)}">
  <a class="pcard-img" href="{E(p['slug'])}/index.html" tabindex="-1" aria-hidden="true">
    <img src="{E(p['image'])}" alt="" loading="lazy" width="640" height="400">
  </a>
  <div class="pcard-body">
    <div class="pcard-top"><span class="industry">{E(p['industry'])}</span><span class="status status-{st}">{E(label)}</span></div>
    <h3><a href="{E(p['slug'])}/index.html">{E(p['product_title'])}</a></h3>
    <p>{E(p['one_liner'])}</p>
    <div class="chips">{tiers}</div>
    <dl class="pcard-meta">
      <div><dt>Commission</dt><dd>{commission_text()}</dd></div>
      <div><dt>Sheets (Essential / Elite)</dt><dd>{len(p['essential_sheets'])} / {len(p['elite_sheets'])}</dd></div>
    </dl>
    <div class="pcard-price">{price_html}</div>
    <a class="btn btn-primary btn-block" href="{E(p['slug'])}/index.html">Affiliate resources {icon('arrow', 18)}</a>
  </div>
</article>"""


def build_index():
    n = len(PRODUCTS)
    opts = ''.join(f'<option value="{E(p["slug"])}">{E(p["industry"])}</option>' for p in sorted(PRODUCTS, key=lambda p: p['industry']))
    cards = ''.join(card(p) for p in sorted(PRODUCTS, key=lambda p: p['industry']))
    steps = [
        ('Explore the products', 'Browse the industries below and open a product\'s resource page to see exactly what each edition contains.'),
        ('Check promotion availability', 'Each product shows its affiliate status. Only promote products marked available, or confirmed for you in ' + DS['name'] + '.'),
        ('Join through ' + DS['name'], 'Create or sign in to your ' + DS['name'] + ' account. Some products may need vendor approval before you can promote them.'),
        ('Get your tracking link', 'Your personal promotion link is generated inside your ' + DS['name'] + ' account. ProfitIQS cannot create it for you.'),
        ('Promote accurately', 'Use the ready-made copy, images and banners, add your link, and include a clear affiliate disclosure.'),
        ('Track your results', 'Clicks, sales, refunds and commissions are reported in your ' + DS['name'] + ' dashboard.'),
    ]
    steps_html = ''.join(f'<li class="step"><span class="step-n">{i + 1:02d}</span><h3>{E(a)}</h3><p>{E(b)}</p></li>' for i, (a, b) in enumerate(steps))
    why = [
        ('grid', f'{n} industry-specific products', 'Each system is built for one industry, with its own sheets, sample data and terminology.'),
        ('layers', 'Three clear editions', 'Essential for the core numbers, Elite for deeper analysis, Complete for both — easy to match to your audience.'),
        ('excel', 'Downloadable Excel systems', 'Buyers download a ready-built workbook plus a Field Guide and Quick Start for every edition.'),
        ('megaphone', 'Ready-to-use promotion kit', 'Headlines, emails, social captions, video scripts, product images and banners for every industry.'),
        ('link', f'{DS["name"]} tracking', f'Clicks, sales and commissions are tracked and paid through {DS["name"]}.'),
        ('support', 'Real product support', f'Customers get product support from ProfitIQS at {EMAIL}, so you can focus on promotion.'),
    ]
    why_html = ''.join(f'<li class="why">{icon(i, 22)}<h3>{E(a)}</h3><p>{E(b)}</p></li>' for i, a, b in why)
    faq = [
        ('What is ProfitIQS?', f'ProfitIQS makes downloadable Excel business intelligence systems for specific industries — {", ".join(sorted(p["industry"] for p in PRODUCTS))}. Each workbook comes with a Field Guide and a Quick Start.'),
        ('What products can I promote?', 'Every industry listed on this page has Essential, Elite and Complete 2026 editions. Promote a product once its status shows it is available, or once it is confirmed for you in ' + DS['name'] + '.'),
        ('How does affiliate commission work?', f'When a customer buys through your personal {DS["name"]} link, {DS["name"]} records the sale and credits your commission on eligible orders.'),
        ('What is the current commission rate?', f'The standard rate is {commission_text()} on eligible sales. Any temporary promotion is announced on this page with its dates; your {DS["name"]} account shows the rate that applies to you.'),
        ('How do I get my affiliate link?', f'Sign in to {DS["name"]}, find the ProfitIQS product you want to promote, and request or copy your promotion link there. Links are personal to your account.'),
        ('How are sales tracked?', f'Through {DS["name"]}. Tracking details such as cookie duration are set by the platform and the product settings — check them in your account.'),
        ('Where do I see my earnings?', f'In your {DS["name"]} account, which reports clicks, sales, refunds and commissions.'),
        ('Can I promote multiple industries?', 'Yes. Each industry has its own resource page and materials, so you can promote the ones that fit your audience.'),
        ('Can I use the supplied marketing resources?', 'Yes — the copy, product images and banners on this portal are provided for promoting ProfitIQS products. Keep them accurate and add your own affiliate disclosure.'),
        ('What marketing practices are prohibited?', 'Spam, fake reviews or testimonials, income or results promises, misleading pricing or discounts, unsupported tax or legal claims, and anything that impersonates ProfitIQS. See the promotion guidelines above.'),
        ('Who handles customer support?', f'ProfitIQS handles product support for customers at {EMAIL}. Orders, payments and refunds are processed by {DS["name"]}.'),
        ('Where can I get affiliate assistance?', f'Email {EMAIL} with "Affiliate" in the subject line. For account, tracking or payout questions, contact {DS["name"]} support.'),
    ]
    faq_html = ''.join(f'<details class="faq-item"><summary>{E(q)}{icon("arrow", 18)}</summary><p>{E(a)}</p></details>' for q, a in faq)
    guide_do = ['Describe the products as they are: downloadable Excel workbooks with guides',
                'Disclose your affiliate relationship clearly, close to the link',
                'Use the editions\' real contents when you compare them',
                'Send people to the official sales page through your tracking link',
                'Follow the marketing and privacy laws that apply to you and your audience']
    guide_dont = ['Promise income, savings, tax outcomes or business results',
                  'Write fake reviews, testimonials, screenshots or customer stories',
                  'Invent discounts, countdowns, scarcity or pricing',
                  'Present ProfitIQS products as tax, legal or accounting advice',
                  'Spam, bid on or imitate the ProfitIQS brand, or pose as ProfitIQS',
                  'Collect personal data without consent']
    do_html = ''.join(f'<li>{icon("check", 18)}<span>{E(x)}</span></li>' for x in guide_do)
    dont_html = ''.join(f'<li>{icon("x", 18)}<span>{E(x)}</span></li>' for x in guide_dont)
    body = f"""
<section class="hero">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-in">
    <div class="hero-copy">
      <div class="eyebrow">ProfitIQS Affiliate Partner Program</div>
      <h1>Partner With ProfitIQS. <span>Promote Smarter Business Systems.</span></h1>
      <p class="lead">Help business owners discover industry-specific financial management and business intelligence tools. Access promotional resources and earn commissions on eligible sales through {E(DS['name'])}.</p>
      <div class="hero-cta">
        <a class="btn btn-primary btn-lg" href="#products">Explore Affiliate Products {icon('arrow', 18)}</a>
        <a class="btn btn-ghost btn-lg" href="#how">How It Works</a>
      </div>
      <ul class="hero-facts">
        <li><b>{commission_text()}</b><span>standard commission</span></li>
        <li><b>{n}</b><span>industries</span></li>
        <li><b>3</b><span>editions each</span></li>
      </ul>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <div class="shot shot-back"><img src="{E(PRODUCTS[min(2, n - 1)]['image'])}" alt="" width="640" height="400"></div>
      <div class="shot shot-front"><img src="{E(PRODUCTS[0]['image'])}" alt="" width="640" height="400"></div>
      <div class="hero-badge">{icon('excel', 18)}<span>Excel systems · Field Guide · Quick Start</span></div>
    </div>
  </div>
</section>
{commission_block()}
<section class="section" id="why" aria-labelledby="why-h">
  <div class="wrap">
    <div class="eyebrow">Why partner with ProfitIQS</div>
    <h2 id="why-h">Products that are easy to explain — and honest to promote</h2>
    <ul class="why-grid">{why_html}</ul>
  </div>
</section>
<section class="section section-soft" id="products" aria-labelledby="products-h">
  <div class="wrap">
    <div class="eyebrow">Affiliate product directory</div>
    <h2 id="products-h">Find the right product for your audience</h2>
    <p class="section-lead">Every industry comes in three editions. Open a product for its full promotion kit.</p>
    <div class="filters" role="search">
      <label class="search">{icon('search', 18)}<span class="sr">Search products</span>
        <input id="q" type="search" placeholder="Search industries, features…" autocomplete="off"></label>
      <label class="select"><span class="sr">Industry</span><select id="f-industry"><option value="">All industries</option>{opts}</select></label>
      <label class="select"><span class="sr">Edition</span><select id="f-tier"><option value="">All editions</option><option value="essential">Essential</option><option value="elite">Elite</option><option value="complete">Complete</option></select></label>
      <label class="select"><span class="sr">Availability</span><select id="f-status"><option value="">Any availability</option><option value="available">Available to promote</option><option value="pending">Approval pending</option></select></label>
    </div>
    <p class="count" id="count" aria-live="polite">{n} products</p>
    <div class="pgrid" id="pgrid">{cards}</div>
    <div class="empty" id="empty" hidden>{icon('search', 28)}<p>No products match those filters.</p><button class="btn btn-ghost" type="button" id="reset">Clear filters</button></div>
  </div>
</section>
<section class="section" id="how" aria-labelledby="how-h">
  <div class="wrap">
    <div class="eyebrow">How it works</div>
    <h2 id="how-h">From sign-up to your first promotion</h2>
    <ol class="steps">{steps_html}</ol>
    <p class="note">{icon('info', 18)}<span>Not every product is automatically open for promotion. Availability and approval are managed in {E(DS['name'])}.</span></p>
  </div>
</section>
<section class="section section-soft" id="kit" aria-labelledby="kit-h">
  <div class="wrap kit">
    <div>
      <div class="eyebrow">What is in every promotion kit</div>
      <h2 id="kit-h">Copy, images and scripts — ready to use</h2>
      <p class="section-lead">Each product page has materials written from the product's real contents. Copy with one click, then add your link.</p>
    </div>
    <ul class="kit-list">
      <li>{icon('megaphone')}<span>Headlines and short &amp; long descriptions</span></li>
      <li>{icon('mail')}<span>Two email templates with subject lines</span></li>
      <li>{icon('chat')}<span>Captions for LinkedIn, Facebook, X and Instagram</span></li>
      <li>{icon('video')}<span>30-second and 60-second video scripts</span></li>
      <li>{icon('layers')}<span>Edition comparison and feature summary</span></li>
      <li>{icon('download')}<span>Product image and banners in 5 standard sizes</span></li>
    </ul>
  </div>
</section>
<section class="section" id="guidelines" aria-labelledby="guidelines-h">
  <div class="wrap">
    <div class="eyebrow">Promotion guidelines</div>
    <h2 id="guidelines-h">Promote with integrity</h2>
    <p class="section-lead">ProfitIQS products help owners see their numbers. Keep your promotion just as clear.</p>
    <div class="guide-grid">
      <div class="guide guide-do"><h3>Do</h3><ul>{do_html}</ul></div>
      <div class="guide guide-dont"><h3>Don't</h3><ul>{dont_html}</ul></div>
    </div>
    <p class="note">{icon('info', 18)}<span><b>Draft guidelines.</b> These guidelines explain ProfitIQS's expectations. They do not replace {E(DS['name'])}'s affiliate terms or the laws that apply to you, which remain binding.</span></p>
  </div>
</section>
<section class="section section-soft" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq-wrap">
    <div><div class="eyebrow">FAQ</div><h2 id="faq-h">Affiliate questions, answered</h2>
      <p class="section-lead">Anything account-specific — payouts, cookie windows, refunds — is set by {E(DS['name'])}. Check your account or their terms.</p></div>
    <div class="faq">{faq_html}</div>
  </div>
</section>
<section class="cta">
  <div class="wrap cta-in">
    <div><h2>Questions about promoting ProfitIQS?</h2><p>Email the team with "Affiliate" in the subject line.</p></div>
    <a class="btn btn-primary btn-lg" href="mailto:{EMAIL}?subject=Affiliate%20question">{icon('mail', 18)} {EMAIL}</a>
  </div>
</section>"""
    jsonld = {"@context": "https://schema.org", "@type": "WebPage", "name": "ProfitIQS Affiliate Partner Program",
              "url": BASE + '/', "publisher": {"@type": "Organization", "name": "ProfitIQS", "url": PROG['site_url'],
                                               "email": EMAIL}}
    return page('ProfitIQS Affiliate Partner Program — Promote Industry Business Systems',
                f'Promote ProfitIQS industry-specific Excel business systems and earn {commission_text()} commission on eligible sales through {DS["name"]}. Products, promotion kits and guidelines.',
                BASE + '/', body, rel='', indexable=True, jsonld=jsonld, active='home')


def copy_block(label, text, kind='', note=''):
    return (f'<div class="copy {kind}"><div class="copy-head"><span>{E(label)}</span>'
            f'<button class="btn btn-sm btn-copy" type="button" data-copy>{icon("copy", 16)}<span>Copy</span></button></div>'
            f'{f"<p class=copy-note>{E(note)}</p>" if note else ""}<pre class="copy-text">{E(text)}</pre></div>')


def asset_card(label, rel_path, dims, alt):
    path = os.path.join(OUT, rel_path.replace('../', ''))
    if os.path.exists(path):
        kb = os.path.getsize(path) // 1024
        pv = rel_path.replace('/banners/', '/banners/previews/').replace('.png', '.webp')
        shown = pv if os.path.exists(os.path.join(OUT, pv.replace('../', ''))) else rel_path
        return (f'<figure class="asset"><div class="asset-img"><img src="{E(shown)}" alt="{E(alt)}" loading="lazy"></div>'
                f'<figcaption><span><b>{E(label)}</b><small>{E(dims)} · PNG · {kb} KB</small></span>'
                f'<a class="btn btn-sm btn-ghost" href="{E(rel_path)}" download>{icon("download", 16)} Download</a></figcaption></figure>')
    return (f'<figure class="asset asset-missing"><div class="asset-img">{icon("file", 28)}</div>'
            f'<figcaption><span><b>{E(label)}</b><small>Not available yet</small></span>'
            f'<span class="btn btn-sm btn-disabled" aria-disabled="true">Unavailable</span></figcaption></figure>')


BANNERS = [('1200x628', 'Social / link preview'), ('1080x1080', 'Square post'), ('1080x1920', 'Story / Reel'),
           ('728x90', 'Leaderboard'), ('300x250', 'Medium rectangle')]


def build_niche(p):
    c = copylib.build(p)
    st, label = availability(p)
    slug = p['slug']
    es, el = len(p['essential_sheets']), len(p['elite_sheets'])
    rows = ''
    for t in p['tiers']:
        price = f'{E(t["currency"] or "")}{E(t["price"])}' if (t.get('price_verified') and t.get('price')) else '<span class="muted">See sales page</span>'
        rows += (f'<tr><th scope="row">{E(t["tier"])} 2026</th><td><ul>' + ''.join(f'<li>{E(x)}</li>' for x in t['contents'])
                 + f'</ul></td><td>{price}</td><td>{commission_text()}</td></tr>')
    sales = [t for t in p['tiers'] if t.get('sales_page_url')]
    if sales:
        sales_html = ''.join(f'<li><a href="{E(t["sales_page_url"])}" rel="noopener">{E(t["title"])}</a></li>' for t in sales)
        sales_html = f'<ul class="links">{sales_html}</ul>'
    else:
        sales_html = f'<div class="unavail">{icon("info", 18)}<span>The official sales page link has not been published here yet. Use the link {E(DS["name"])} gives you for this product.</span></div>'
    promo = [t for t in p['tiers'] if t.get('affiliate_promo_url')]
    promo_html = (''.join(f'<li><a href="{E(t["affiliate_promo_url"])}" rel="noopener">{E(t["tier"])} — {E(DS["name"])} promotion page</a></li>' for t in promo)
                  if promo else '')
    promo_html = (f'<ul class="links">{promo_html}</ul>' if promo_html else
                  f'<div class="unavail">{icon("info", 18)}<span>{E(DS["name"])} product IDs and promotion links for this product are not listed yet. When they are, they will appear here.</span></div>')
    ess_li = ''.join(f'<li>{icon("check", 18)}<span>{E(x)}</span></li>' for x in p['essential_highlights'])
    eli_li = ''.join(f'<li>{icon("check", 18)}<span>{E(x)}</span></li>' for x in p['elite_highlights'])
    q_li = ''.join(f'<li>{E(x)}</li>' for x in p['questions'])
    heads = ''.join(copy_block(f'Headline {i + 1}', h, 'copy-line') for i, h in enumerate(c['headlines']))
    emails = ''.join(copy_block(f'Email {i + 1}: {e["name"]}', f'Subject: {e["subject"]}\n\n{e["body"]}') for i, e in enumerate(c['emails']))
    social = ''.join(copy_block(s['name'], s['text']) for s in c['social'])
    videos = ''.join(copy_block(v['name'], v['text']) for v in c['videos'])
    faqtxt = '\n\n'.join(f'Q: {q}\nA: {a}' for q, a in c['faq'])
    assets = asset_card('Product image', f'../{p["image"]}', '16:10', p['image_alt'])
    assets += ''.join(asset_card(f'Banner — {n}', f'../assets/banners/{slug}-{d}.png', d.replace('x', ' × '),
                                 f'{p["product_title"]} {n} banner') for d, n in BANNERS)
    conf = ('<p class="note">' + icon('info', 18) + '<span>Product title taken from the shipped product files; '
            'confirm it matches the sales page before publishing.</span></p>') if p.get('title_needs_confirmation') else ''
    toc = [('overview', 'Overview'), ('editions', 'Editions'), ('links', 'Affiliate links'), ('copy', 'Copy'),
           ('emails', 'Emails'), ('social', 'Social'), ('video', 'Video scripts'), ('assets', 'Images & banners'), ('pfaq', 'FAQ')]
    toc_html = ''.join(f'<a href="#{a}">{E(b)}</a>' for a, b in toc)
    body = f"""
<section class="nhero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html">Affiliates</a><span>/</span><a href="../index.html#products">Products</a><span>/</span><span aria-current="page">{E(p['industry'])}</span></nav>
    <div class="nhero-in">
      <div>
        <div class="nhero-top"><span class="industry">{E(p['industry'])}</span><span class="status status-{st}">{E(label)}</span></div>
        <h1>{E(p['product_title'])}</h1>
        <p class="lead">{E(p['one_liner'])}</p>
        <div class="nhero-facts">
          <div><b>{commission_text()}</b><span>commission</span></div>
          <div><b>{es}</b><span>Essential sheets</span></div>
          <div><b>{el}</b><span>Elite sheets</span></div>
          <div><b>3</b><span>editions</span></div>
        </div>
        {conf}
      </div>
      <figure class="nhero-img"><img src="../{E(p['image'])}" alt="{E(p['image_alt'])}" width="640" height="400"></figure>
    </div>
  </div>
</section>
<nav class="subnav" aria-label="On this page"><div class="wrap subnav-in">{toc_html}</div></nav>
<section class="section" id="overview" aria-labelledby="ov-h">
  <div class="wrap two">
    <div>
      <div class="eyebrow">Product overview</div>
      <h2 id="ov-h">Who it is for</h2>
      <p>{E(p['audience'])}.</p>
      <h3 class="h3">Questions it helps answer</h3>
      <ul class="qlist">{q_li}</ul>
    </div>
    <div class="panel">
      <h3 class="h3">Included in every edition</h3>
      <ul class="ticks">
        <li>{icon('check', 18)}<span>Downloadable Excel workbook with formulas, dashboards and reports built in</span></li>
        <li>{icon('check', 18)}<span>Field Guide (PDF) explaining every sheet</span></li>
        <li>{icon('check', 18)}<span>Quick Start (PDF) for the first session</span></li>
        <li>{icon('check', 18)}<span>Sample data, so every dashboard works before entering real figures</span></li>
        <li>{icon('check', 18)}<span>{E('Country-based tax rate presets with an override for your own rate' if p['multi_country_tax'] else 'Estimated-tax and quarterly planning sheets')}</span></li>
      </ul>
      <p class="fine">Requires a desktop version of Microsoft Excel. Planning tool only — not tax, legal or financial advice.</p>
    </div>
  </div>
</section>
<section class="section section-soft" id="editions" aria-labelledby="ed-h">
  <div class="wrap">
    <div class="eyebrow">Editions</div>
    <h2 id="ed-h">Essential, Elite and Complete</h2>
    <div class="tiers">
      <div class="tier"><div class="tier-h"><h3>Essential 2026</h3><span>{es} sheets</span></div><p>The core numbers.</p><ul class="ticks">{ess_li}</ul></div>
      <div class="tier tier-feat"><div class="tier-h"><h3>Elite 2026</h3><span>{el} sheets</span></div><p>The deeper view.</p><ul class="ticks">{eli_li}</ul></div>
      <div class="tier"><div class="tier-h"><h3>Complete 2026</h3><span>Both editions</span></div><p>Essential and Elite together.</p>
        <ul class="ticks"><li>{icon('check', 18)}<span>Essential 2026 edition</span></li><li>{icon('check', 18)}<span>Elite 2026 edition</span></li><li>{icon('check', 18)}<span>License, README and Support documents</span></li></ul></div>
    </div>
    <div class="table-wrap"><table class="cmp"><caption class="sr">Edition contents, price and commission</caption>
      <thead><tr><th scope="col">Edition</th><th scope="col">What the buyer downloads</th><th scope="col">Price</th><th scope="col">Commission</th></tr></thead>
      <tbody>{rows}</tbody></table></div>
    <p class="fine">Prices are shown only once confirmed. The official sales page is always the source of truth.</p>
  </div>
</section>
<section class="section" id="links" aria-labelledby="links-h">
  <div class="wrap two">
    <div>
      <div class="eyebrow">Affiliate links</div>
      <h2 id="links-h">Getting your tracking link</h2>
      <ol class="mini-steps">
        <li>Sign in to your {E(DS['name'])} affiliate account (or create one).</li>
        <li>Find this ProfitIQS product and request promotion if approval is required.</li>
        <li>Copy your personal promotion link from {E(DS['name'])}.</li>
        <li>Replace <code>{E(copylib.LINK)}</code> in the materials below with that link.</li>
      </ol>
      <p class="fine">Your link is personal to your account. ProfitIQS does not issue affiliate links or IDs.</p>
    </div>
    <div class="panel">
      <h3 class="h3">Official sales page</h3>{sales_html}
      <h3 class="h3">{E(DS['name'])} promotion</h3>{promo_html}
      <a class="btn btn-ghost btn-block" href="{E(DS['home_url'])}" rel="noopener" target="_blank">Open {E(DS['name'])} {icon('arrow', 16)}</a>
    </div>
  </div>
</section>
<section class="section section-soft" id="copy" aria-labelledby="copy-h">
  <div class="wrap">
    <div class="eyebrow">Marketing copy</div>
    <h2 id="copy-h">Headlines and descriptions</h2>
    <p class="section-lead">Written from the product's real contents. Add your link and an affiliate disclosure wherever you publish.</p>
    <div class="copy-grid copy-grid-2">{heads}</div>
    <div class="copy-grid">{copy_block('Short description', c['short'])}{copy_block('Long description', c['long'])}{copy_block('Feature summary', c['features'])}</div>
  </div>
</section>
<section class="section" id="emails" aria-labelledby="em-h">
  <div class="wrap"><div class="eyebrow">Email marketing</div><h2 id="em-h">Email templates</h2>
    <p class="section-lead">Send only to people who agreed to hear from you. Keep the disclosure line.</p>
    <div class="copy-grid copy-grid-2">{emails}</div></div>
</section>
<section class="section section-soft" id="social" aria-labelledby="so-h">
  <div class="wrap"><div class="eyebrow">Social media</div><h2 id="so-h">Captions</h2>
    <div class="copy-grid copy-grid-2">{social}</div></div>
</section>
<section class="section" id="video" aria-labelledby="vi-h">
  <div class="wrap"><div class="eyebrow">Short-form video</div><h2 id="vi-h">Video scripts</h2>
    <p class="section-lead">Use the product image or your own screen recording of the sample workbook as b-roll.</p>
    <div class="copy-grid copy-grid-2">{videos}</div></div>
</section>
<section class="section section-soft" id="assets" aria-labelledby="as-h">
  <div class="wrap"><div class="eyebrow">Images &amp; banners</div><h2 id="as-h">Approved images</h2>
    <p class="section-lead">Real screens from the product with sample data. Do not edit them to show figures the product does not produce.</p>
    <div class="assets">{assets}</div></div>
</section>
<section class="section" id="pfaq" aria-labelledby="pf-h">
  <div class="wrap two">
    <div><div class="eyebrow">Product FAQ</div><h2 id="pf-h">Answers you can share</h2>
      <p class="section-lead">Accurate answers for questions your audience may ask.</p>{copy_block('All FAQ answers', faqtxt)}</div>
    <div class="faq">{''.join(f'<details class="faq-item"><summary>{E(q)}{icon("arrow", 18)}</summary><p>{E(a)}</p></details>' for q, a in c['faq'])}</div>
  </div>
</section>
<section class="section section-soft">
  <div class="wrap"><p class="note">{icon('shield', 18)}<span>Keep every promotion accurate: no income or results promises, no fake reviews, no invented discounts, and no tax or legal claims. <a href="../index.html#guidelines">Read the promotion guidelines</a>.</span></p></div>
</section>"""
    jsonld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Affiliates", "item": BASE + '/'},
        {"@type": "ListItem", "position": 2, "name": p['industry'], "item": f'{BASE}/{slug}/'}]}
    return page(f'{p["product_title"]} — Affiliate Resources | ProfitIQS Partners',
                f'Affiliate promotion kit for {p["product_title"]}: editions, commission, copy, email templates, social captions, video scripts and banners.',
                f'{BASE}/{slug}/', body, rel='../', indexable=niche_indexable(p), jsonld=jsonld, active='niche')


def main():
    if os.path.exists(OUT):
        for n in os.listdir(OUT):
            fp = os.path.join(OUT, n)
            if n == 'assets':
                continue
            shutil.rmtree(fp) if os.path.isdir(fp) else os.remove(fp)
    os.makedirs(os.path.join(OUT, 'assets'), exist_ok=True)
    src_assets = os.path.join(ROOT, 'assets')
    shutil.copytree(src_assets, os.path.join(OUT, 'assets'), dirs_exist_ok=True)
    for f in ('portal.css', 'portal.js'):
        shutil.copy(os.path.join(ROOT, 'src', f), os.path.join(OUT, 'assets', f))
    slugs = [p['slug'] for p in PRODUCTS]
    assert len(slugs) == len(set(slugs)), 'duplicate slug in products.json'
    for p in PRODUCTS:
        assert re.fullmatch(r'[a-z0-9-]+', p['slug']), p['slug']
    open(os.path.join(OUT, 'index.html'), 'w').write(build_index())
    urls = [BASE + '/']
    for p in PRODUCTS:
        os.makedirs(os.path.join(OUT, p['slug']), exist_ok=True)
        open(os.path.join(OUT, p['slug'], 'index.html'), 'w').write(build_niche(p))
        if niche_indexable(p):
            urls.append(f'{BASE}/{p["slug"]}/')
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += ''.join(f'  <url><loc>{E(u)}</loc><lastmod>{PROG["last_updated"]}</lastmod></url>\n' for u in urls)
    sm += '</urlset>\n'
    open(os.path.join(OUT, 'sitemap-affiliates.xml'), 'w').write(sm)
    print(f'built {len(PRODUCTS)} niche pages + index -> {OUT}  (sitemap: {len(urls)} url(s); promo active: {promo_active()})')


if __name__ == '__main__':
    main()
