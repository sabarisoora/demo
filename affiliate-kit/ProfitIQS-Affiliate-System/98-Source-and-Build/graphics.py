"""Ten graphics per niche (+1 recruiting graphic) — specs drive both the rendered PNGs and the written briefs.
Rendering needs Node.js + Playwright (NODE_PATH pointing at node_modules)."""
import html, json, os, subprocess, tempfile
from niche_docs import money, price, lc

E = lambda s: html.escape(str(s))
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, 'assets', 'fonts')


def specs(n, c):
    p = n.p
    h = [x for _, x in p['hooks']]
    pr = ' · '.join(f"{t['tier']} {money(c, t['price'])}" for t in c['tiers'])
    S = [
        ('square-1-problem.png', 'Square post', '1080×1080', h[0], p['problems'][0][1], 'See the editions → link in bio', 'Dark slate, headline top, dashboard screen tilted at the bottom', 'square', 'problem'),
        ('square-2-product.png', 'Square post', '1080×1080', p['title'], f"Excel business system for {p['owners']} · {pr}", 'Explore the editions', 'Product name with industry word highlighted, edition price chips, dashboard', 'square', 'product'),
        ('square-3-kpi.png', 'Square post', '1080×1080', f"What is {lc(p['kpis'][0][0])}?", p['kpis'][0][1], 'Track it in Excel → link in bio', 'Educational card: big question, plain definition, small product credit', 'square', 'kpi'),
        ('story-1-curiosity.png', 'Story / Reel cover', '1080×1920', h[14], f"{p['title']} with sample data", 'Swipe up / link in bio', 'Full-height, headline top third, dashboard lower half', 'story', 'curiosity'),
        ('story-2-tour.png', 'Story', '1080×1920', f"Inside the {p['label']} system", ' · '.join(d[0] for d in p['demos'][:4]), 'Link in bio', 'Numbered list of real sheet names over dark background, dashboard peek', 'story', 'tour'),
        ('story-3-tiers.png', 'Story', '1080×1920', 'Which edition fits you?', pr, 'Compare at the link', 'Three stacked edition cards with prices and contents', 'story', 'tiers'),
        ('landscape-1-banner.png', 'Landscape banner / link preview', '1200×628', p['title'], p['problems'][0][0], 'See the editions', 'Text left, dashboard right', 'land', 'banner'),
        ('landscape-2-thumbnail.png', 'YouTube / video thumbnail', '1280×720', h[17], p['label'], 'Watch', 'Big two-line question, dashboard behind, high contrast', 'thumb', 'thumb'),
        ('comparison.png', 'Comparison graphic (portrait post)', '1080×1350', 'Essential · Elite · Complete', 'Real Field Guide covers, prices and contents', 'Pick yours → link', 'Three columns with the Essential and Elite guide covers', 'compare', 'compare'),
        ('launch-announcement.png', 'Launch announcement (square)', '1080×1080', f"Now available: {p['title']}", pr, 'See the editions', 'Announcement badge, product name, price chips, dashboard; no countdown or urgency', 'square', 'launch'),
    ]
    return [dict(file=a, format=b, size=c_, headline=d, support=e, cta=f, visual=g, kind=k, variant=v) for a, b, c_, d, e, f, g, k, v in S]


CSS = """
@font-face{font-family:P;src:url('file://%(f)s/Poppins-Regular.ttf');font-weight:400}
@font-face{font-family:P;src:url('file://%(f)s/Poppins-Medium.ttf');font-weight:500}
@font-face{font-family:P;src:url('file://%(f)s/Poppins-SemiBold.ttf');font-weight:600}
@font-face{font-family:P;src:url('file://%(f)s/Poppins-Bold.ttf');font-weight:700}
*{box-sizing:border-box;margin:0}html,body{width:%(w)spx;height:%(h)spx;overflow:hidden}
body{font-family:P,sans-serif;color:#fff;background:radial-gradient(120%% 120%% at 0%% 0%%,#1E3A8A 0%%,#0F172A 60%%);position:relative}
.glow{position:absolute;right:-20%%;bottom:-25%%;width:80%%;height:80%%;background:radial-gradient(closest-side,rgba(16,185,129,.22),transparent)}
.light{background:#FAFAFA;color:#0F172A}
.brand{display:flex;align-items:center;gap:.45em;font-weight:700}.brand img{height:1.4em}
.eyebrow{font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#93C5FD}
h1{font-weight:700;letter-spacing:-.025em;line-height:1.08}
h1 em{font-style:normal;background:linear-gradient(90deg,#60A5FA,#34D399);-webkit-background-clip:text;color:transparent}
p{color:#CBD5E1;line-height:1.42}
.chips{display:flex;gap:.5em;flex-wrap:wrap}.chips span{border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.07);border-radius:.55em;padding:.35em .8em;font-weight:600}
.shot{border-radius:14px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.12);background:#fff}.shot img{display:block;width:100%%}
.cta{display:inline-flex;background:#2563EB;color:#fff;font-weight:600;border-radius:.6em;padding:.65em 1.1em}
.badge{display:inline-flex;background:#F59E0B;color:#0F172A;font-weight:700;border-radius:999px;padding:.35em .9em;letter-spacing:.06em;text-transform:uppercase}
.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:1em 1.1em}
.fine{position:absolute;bottom:22px;left:0;right:0;text-align:center;font-size:15px;color:#64748B}
"""


def name_html(p):
    t = E(p['title']).replace('™', '<sup style="font-size:.45em">™</sup>')
    lab = E(p['label'])
    return t.replace(lab, f'<em>{lab}</em>', 1) if p['title'].startswith(p['label']) else t


def body(n, c, s, A):
    p, h = n.p, None
    mark, dash, ce, cl = A['mark'], A['dash'], A['cover_ess'], A['cover_eli']
    pr_chips = ''.join(f"<span>{E(t['tier'])} {E(money(c, t['price']))}</span>" for t in c['tiers'])
    brand = lambda size: f'<div class="brand" style="font-size:{size}px"><img src="{mark}"><span>ProfitIQS</span></div>'
    v = s['variant']
    if v == 'problem':
        return (f'<div class="glow"></div><div style="padding:70px">{brand(30)}<h1 style="font-size:66px;margin-top:60px">{E(s["headline"])}</h1>'
                f'<p style="font-size:27px;margin-top:26px">{E(s["support"])}</p></div>'
                f'<div class="shot" style="position:absolute;left:70px;right:-60px;bottom:-110px;transform:rotate(-2deg)"><img src="{dash}"></div>')
    if v in ('product', 'launch'):
        top = (f'<div class="badge" style="font-size:20px;margin-top:40px">Now available</div>' if v == 'launch'
               else f'<div class="eyebrow" style="font-size:20px;margin-top:40px">Excel business system for {E(p["owners"])}</div>')
        return (f'<div class="glow"></div><div style="padding:70px">{brand(30)}{top}<h1 style="font-size:{58 if len(p["title"]) < 48 else 52}px;margin-top:22px">{name_html(p)}</h1>'
                f'<div class="chips" style="font-size:22px;margin-top:28px">{pr_chips}</div></div>'
                f'<div class="shot" style="position:absolute;left:70px;right:70px;bottom:-140px"><img src="{dash}"></div>')
    if v == 'kpi':
        return (f'<div class="glow"></div><div style="padding:80px;height:100%;display:flex;flex-direction:column">{brand(30)}'
                f'<div class="eyebrow" style="font-size:20px;margin-top:70px">{E(p["label"])} · numbers that matter</div>'
                f'<h1 style="font-size:84px;margin-top:20px">{E(s["headline"])}</h1><p style="font-size:34px;margin-top:34px">{E(s["support"])}</p>'
                f'<div style="margin-top:auto;font-size:22px;color:#94A3B8;position:relative;z-index:2">Tracked in the {E(p["title"])}</div></div>'
                f'<div class="shot" style="position:absolute;left:80px;right:80px;bottom:-330px;opacity:.9"><img src="{dash}"></div>')
    if v == 'curiosity':
        return (f'<div class="glow"></div><div style="padding:110px 80px">{brand(40)}<h1 style="font-size:88px;margin-top:120px">{E(s["headline"])}</h1>'
                f'<p style="font-size:32px;margin-top:36px">{E(s["support"])}</p></div>'
                f'<div class="shot" style="position:absolute;left:80px;right:-80px;bottom:-60px;transform:rotate(-3deg)"><img src="{dash}"></div>')
    if v == 'tour':
        items = ''.join(f'<div class="card" style="font-size:34px;font-weight:600;display:flex;gap:24px;align-items:center"><span style="color:#34D399">0{i}</span>{E(d[0])}</div>'
                        for i, d in enumerate(p['demos'][:4], 1))
        return (f'<div class="glow"></div><div style="padding:110px 80px;display:flex;flex-direction:column;gap:28px">{brand(40)}'
                f'<h1 style="font-size:78px;margin:80px 0 30px">{E(s["headline"])}</h1>{items}</div>'
                f'<div class="shot" style="position:absolute;left:80px;right:80px;bottom:-260px"><img src="{dash}"></div>')
    if v == 'tiers':
        cards = ''.join(f'<div class="card" style="padding:34px"><div style="display:flex;justify-content:space-between;font-size:40px;font-weight:700">'
                        f'<span>{E(t)}</span><span style="color:#34D399">{E(money(c, price(c, t)))}</span></div>'
                        f'<p style="font-size:28px;margin-top:12px">{E(p["tier_fit"][t])}</p></div>' for t in ('Essential', 'Elite', 'Complete'))
        return (f'<div class="glow"></div><div style="padding:110px 80px;display:flex;flex-direction:column;gap:34px">{brand(40)}'
                f'<h1 style="font-size:84px;margin:60px 0 10px">{E(s["headline"])}</h1><div style="font-size:30px;color:#93C5FD">{E(p["title"])}</div>{cards}'
                f'<div class="cta" style="font-size:32px;align-self:flex-start">{E(s["cta"])}</div></div>')
    if v == 'banner':
        return (f'<div class="glow"></div><div style="display:grid;grid-template-columns:1fr 1.05fr;gap:44px;align-items:center;height:100%;padding-left:64px">'
                f'<div style="display:flex;flex-direction:column;gap:20px">{brand(26)}<h1 style="font-size:{46 if len(p["title"]) < 48 else 40}px;margin-top:10px">{name_html(p)}</h1>'
                f'<p style="font-size:22px">{E(s["support"])}? See it on one screen.</p><div class="chips" style="font-size:16px">{pr_chips}</div></div>'
                f'<div class="shot" style="margin-right:-80px;transform:rotate(-1.5deg)"><img src="{dash}"></div></div>')
    if v == 'thumb':
        return (f'<div class="shot" style="position:absolute;inset:40px -120px -140px 520px;transform:rotate(-4deg);opacity:.95"><img src="{dash}"></div>'
                f'<div style="position:absolute;inset:0;background:linear-gradient(90deg,#0F172A 45%,rgba(15,23,42,.2))"></div>'
                f'<div style="position:relative;padding:70px;width:760px">{brand(30)}<h1 style="font-size:70px;margin-top:50px">{E(s["headline"])}</h1>'
                f'<div class="badge" style="font-size:22px;margin-top:30px">{E(p["label"])}</div></div>')
    if v == 'compare':
        def col(t, img, txt):
            cov = (f'<div class="shot" style="height:300px;border-radius:10px"><img src="{img}" style="height:100%;width:auto;margin:auto"></div>' if img else
                   f'<div style="height:300px;display:flex;gap:8px"><div class="shot" style="flex:1;border-radius:10px"><img src="{ce}"></div><div class="shot" style="flex:1;border-radius:10px"><img src="{cl}"></div></div>')
            return (f'<div class="card" style="display:flex;flex-direction:column;gap:18px;padding:22px">{cov}<div style="font-size:34px;font-weight:700">{E(t)}</div>'
                    f'<div style="font-size:40px;font-weight:700;color:#34D399">{E(money(c, price(c, t)))}</div><p style="font-size:21px">{E(txt)}</p></div>')
        return (f'<div class="glow"></div><div style="padding:64px 54px;display:flex;flex-direction:column;gap:26px">{brand(30)}'
                f'<h1 style="font-size:56px;margin-top:14px">Essential · Elite · Complete</h1><div style="font-size:24px;color:#93C5FD">{E(p["title"])}</div>'
                f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:10px">'
                + col('Essential', ce, f"{len(n.ess['sheets'])}-sheet workbook + {n.ess['guide_pages']}-page Field Guide + Quick Start")
                + col('Elite', cl, f"{len(n.eli['sheets'])}-sheet workbook + {n.eli['guide_pages']}-page Field Guide + Quick Start")
                + col('Complete', None, 'Both editions in one package')
                + '</div><div style="font-size:20px;color:#94A3B8">Every edition: sample data, Field Guide, Quick Start. Requires desktop Microsoft Excel.</div></div>')
    raise ValueError(v)


SIZES = {'square': (1080, 1080), 'story': (1080, 1920), 'land': (1200, 628), 'thumb': (1280, 720), 'compare': (1080, 1350)}


def recruit_body(c, niches, A):
    from master_docs import fmt_date
    ph = c['commission_phases']
    labels = ''.join(f'<span>{E(n.p["label"])}</span>' for n in niches)
    strip = ''.join(f'<div class="card" style="flex:1"><div style="font-size:44px;font-weight:700;color:{col}">{x["percent"]}%</div>'
                    f'<div style="font-size:19px;font-weight:600">{E(x["months"])}</div><div style="font-size:16px;color:#94A3B8">'
                    f'{E(fmt_date(x["start"]))}{" – " + E(fmt_date(x["end"])) if x["end"] else " onward"}</div></div>'
                    for x, col in zip(ph, ('#34D399', '#60A5FA', '#E2E8F0')))
    return (f'<div class="glow"></div><div style="padding:66px">'
            f'<div class="brand" style="font-size:30px"><img src="{A["mark"]}"><span>ProfitIQS Affiliates</span></div>'
            f'<div class="badge" style="font-size:19px;margin-top:34px">Planned launch commission</div>'
            f'<h1 style="font-size:150px;margin-top:6px"><em>{ph[0]["percent"]}%</em></h1>'
            f'<p style="font-size:24px">on eligible sales via {E(c["platform"])} · {len(niches)} niches · Essential, Elite, Complete</p>'
            f'<div style="display:flex;gap:14px;margin-top:30px">{strip}</div>'
            f'<div class="chips" style="font-size:16px;margin-top:28px">{labels}</div>'
            f'<p style="font-size:16px;margin-top:22px;color:#94A3B8">Planned schedule, set in {E(c["platform"])} at each phase. No earnings are promised.</p></div>')


def render(jobs):
    tmp = tempfile.mkdtemp()
    js = os.path.join(tmp, 'r.js')
    open(js, 'w').write("""const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const jobs = %s;
 for (const [src, out, w, h] of jobs) { const p = await b.newPage({ viewport: { width: w, height: h } });
   await p.goto('file://' + src); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(120);
   await p.screenshot({ path: out }); await p.close(); } await b.close(); })();""" % json.dumps(jobs))
    subprocess.run(['node', js], check=True, env={**os.environ, 'NODE_PATH': os.environ.get('NODE_PATH', '/opt/node-tools/node_modules')})


def page(w, h, inner, light=False):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS % dict(f=FONTS, w=w, h=h)}</style></head><body class="{"light" if light else ""}">{inner}</body></html>'
