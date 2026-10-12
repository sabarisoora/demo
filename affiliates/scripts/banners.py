"""Render promotional banners for every product (and the portal share image) with headless Chromium.

    python3 scripts/banners.py [slug ...]

Needs Node.js with Playwright (set NODE_PATH if it is installed globally). Writes:
    assets/banners/<slug>-<W>x<H>.png   for the five sizes below
    assets/og-affiliates.png            1200x630 share image for the portal
Banners show only the product name, its one-liner and the edition names — never prices or claims.
"""
import json, os, subprocess, sys, tempfile, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'scripts', 'banner-fonts')
PRODUCTS = json.load(open(os.path.join(ROOT, 'data', 'products.json')))['products']
SIZES = [(1200, 628), (1080, 1080), (1080, 1920), (728, 90), (300, 250)]
E = lambda s: html.escape(str(s))


def css(w, h):
    s = min(w, h)
    return f"""
@font-face{{font-family:P;src:url('file://{FONTS}/Poppins-Regular.ttf');font-weight:400}}
@font-face{{font-family:P;src:url('file://{FONTS}/Poppins-Medium.ttf');font-weight:500}}
@font-face{{font-family:P;src:url('file://{FONTS}/Poppins-SemiBold.ttf');font-weight:600}}
@font-face{{font-family:P;src:url('file://{FONTS}/Poppins-Bold.ttf');font-weight:700}}
*{{box-sizing:border-box;margin:0}}
html,body{{width:{w}px;height:{h}px;overflow:hidden}}
body{{font-family:P,sans-serif;color:#fff;background:radial-gradient(120% 120% at 0% 0%,#1E3A8A 0%,#0F172A 58%);position:relative}}
.glow{{position:absolute;right:-20%;bottom:-30%;width:80%;height:90%;background:radial-gradient(closest-side,rgba(16,185,129,.22),transparent)}}
.brand{{display:flex;align-items:center;gap:.4em;font-weight:700;letter-spacing:-.01em}}
.brand img{{height:1.35em}}
.brand span{{opacity:.95}}
.eyebrow{{font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#93C5FD}}
h1{{font-weight:700;letter-spacing:-.025em;line-height:1.08}}
h1 em{{font-style:normal;background:linear-gradient(90deg,#60A5FA,#34D399);-webkit-background-clip:text;color:transparent}}
p{{color:#CBD5E1;line-height:1.4}}
.chips{{display:flex;gap:.45em;flex-wrap:wrap}}
.chips span{{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);border-radius:.5em;padding:.32em .7em;font-weight:500}}
.shot{{border-radius:{max(6, s // 70)}px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.12);background:#fff}}
.shot img{{display:block;width:100%}}
.cta{{display:inline-flex;align-items:center;gap:.5em;background:#2563EB;color:#fff;font-weight:600;border-radius:.55em;padding:.6em 1em}}
"""


def body(p, w, h):
    title = p['product_title'].replace('™', '<sup style="font-size:.45em">™</sup>')
    ind = E(p['industry'])
    name = title.replace(E(p['industry']), f'<em>{ind}</em>', 1) if p['product_title'].startswith(p['industry']) else title
    img = f"file://{os.path.join(ROOT, p['image'])}"
    mark = f"file://{os.path.join(ROOT, 'assets', 'brand', 'mark.png')}"
    chips = '<div class="chips"><span>Essential</span><span>Elite</span><span>Complete</span></div>'
    if (w, h) == (728, 90):
        return (f'<div class="glow"></div><div style="display:flex;align-items:center;height:100%;padding:0 18px;gap:16px">'
                f'<img src="{mark}" style="height:46px"><div style="flex:1;min-width:0"><div class="eyebrow" style="font-size:9px;margin-bottom:3px">ProfitIQS · Excel business system</div>'
                f'<h1 style="font-size:{16 if len(p["product_title"]) > 40 else 18}px;line-height:1.15">{name}</h1></div>'
                f'<div class="shot" style="width:118px;flex:none"><img src="{img}"></div>'
                f'<div class="cta" style="font-size:13px;flex:none">See editions</div></div>')
    if (w, h) == (300, 250):
        return (f'<div class="glow"></div><div style="padding:18px 18px 0;height:100%;display:flex;flex-direction:column">'
                f'<div class="brand" style="font-size:13px"><img src="{mark}"><span>ProfitIQS</span></div>'
                f'<h1 style="font-size:19px;margin-top:10px">{name}</h1>'
                f'<div class="cta" style="font-size:12px;margin-top:10px;align-self:flex-start">See the editions</div>'
                f'<div class="shot" style="margin-top:auto;transform:translateY(14px)"><img src="{img}"></div></div>')
    if h > w:   # story
        return (f'<div class="glow"></div><div style="padding:110px 80px 0;height:100%;display:flex;flex-direction:column;gap:34px">'
                f'<div class="brand" style="font-size:40px"><img src="{mark}"><span>ProfitIQS</span></div>'
                f'<div class="eyebrow" style="font-size:24px;margin-top:40px">Excel business system for {E(p["audience_short"])}</div>'
                f'<h1 style="font-size:84px">{name}</h1><p style="font-size:34px">{E(p["one_liner"])}</p>'
                f'<div style="font-size:26px">{chips}</div>'
                f'<div class="shot" style="margin-top:auto;margin-bottom:-60px;transform:rotate(-2deg)"><img src="{img}"></div></div>')
    if w == h:  # square
        return (f'<div class="glow"></div><div style="padding:70px 70px 0;height:100%;display:flex;flex-direction:column;gap:24px">'
                f'<div class="brand" style="font-size:32px"><img src="{mark}"><span>ProfitIQS</span></div>'
                f'<h1 style="font-size:64px;margin-top:20px">{name}</h1><p style="font-size:27px">{E(p["one_liner"])}</p>'
                f'<div style="font-size:21px">{chips}</div>'
                f'<div class="shot" style="margin-top:auto;margin-bottom:-90px"><img src="{img}"></div></div>')
    return (f'<div class="glow"></div><div style="display:grid;grid-template-columns:1fr 1.05fr;gap:44px;align-items:center;height:100%;padding:0 0 0 64px">'
            f'<div style="display:flex;flex-direction:column;gap:20px"><div class="brand" style="font-size:26px"><img src="{mark}"><span>ProfitIQS</span></div>'
            f'<div class="eyebrow" style="font-size:15px;margin-top:10px">Excel business system</div>'
            f'<h1 style="font-size:46px">{name}</h1><p style="font-size:21px">{E(p["one_liner"])}</p>'
            f'<div style="font-size:16px">{chips}</div></div>'
            f'<div class="shot" style="margin-right:-80px;transform:rotate(-1.5deg)"><img src="{img}"></div></div>')


def og_body():
    mark = f"file://{os.path.join(ROOT, 'assets', 'brand', 'mark.png')}"
    img1 = f"file://{os.path.join(ROOT, PRODUCTS[0]['image'])}"
    img2 = f"file://{os.path.join(ROOT, PRODUCTS[min(2, len(PRODUCTS) - 1)]['image'])}"
    prog = json.load(open(os.path.join(ROOT, 'data', 'program.json')))
    return (f'<div class="glow"></div><div style="display:grid;grid-template-columns:1.1fr 1fr;height:100%;align-items:center;padding-left:70px">'
            f'<div style="display:flex;flex-direction:column;gap:22px"><div class="brand" style="font-size:30px"><img src="{mark}"><span>ProfitIQS Partners</span></div>'
            f'<h1 style="font-size:54px">Partner with ProfitIQS. <em>Promote smarter business systems.</em></h1>'
            f'<p style="font-size:22px">{len(PRODUCTS)} industries · Essential, Elite &amp; Complete · {prog["commission"]["standard_percent"]}% commission via Digistore24</p></div>'
            f'<div style="position:relative;height:100%"><div class="shot" style="position:absolute;width:560px;right:-120px;top:70px;transform:rotate(3deg);opacity:.85"><img src="{img2}"></div>'
            f'<div class="shot" style="position:absolute;width:560px;left:20px;bottom:60px;transform:rotate(-2deg)"><img src="{img1}"></div></div></div>')


def main():
    only = set(sys.argv[1:])
    jobs = []
    tmp = tempfile.mkdtemp()
    os.makedirs(os.path.join(ROOT, 'assets', 'banners'), exist_ok=True)
    for p in PRODUCTS:
        if only and p['slug'] not in only:
            continue
        for w, h in SIZES:
            f = os.path.join(tmp, f"{p['slug']}-{w}x{h}.html")
            open(f, 'w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{css(w, h)}</style></head><body>{body(p, w, h)}</body></html>')
            jobs.append((f, os.path.join(ROOT, 'assets', 'banners', f"{p['slug']}-{w}x{h}.png"), w, h))
    if not only:
        f = os.path.join(tmp, 'og.html')
        open(f, 'w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{css(1200, 630)}</style></head><body>{og_body()}</body></html>')
        jobs.append((f, os.path.join(ROOT, 'assets', 'og-affiliates.png'), 1200, 630))
    js = os.path.join(tmp, 'render.js')
    open(js, 'w').write("""const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const jobs = %s;
  for (const [src, out, w, h] of jobs) { const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + src); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: out }); await p.close(); }
  await b.close(); })();""" % json.dumps(jobs))
    subprocess.run(['node', js], check=True, env={**os.environ, 'NODE_PATH': os.environ.get('NODE_PATH', '/opt/node-tools/node_modules')})
    from PIL import Image                       # light previews for the portal pages; downloads stay full PNG
    prev = os.path.join(ROOT, 'assets', 'banners', 'previews'); os.makedirs(prev, exist_ok=True)
    for _, out, w, h in jobs:
        if '/banners/' in out:
            im = Image.open(out).convert('RGB'); im.thumbnail((640, 640))
            im.save(os.path.join(prev, os.path.basename(out).replace('.png', '.webp')), quality=82)
    print(f'{len(jobs)} images rendered')


if __name__ == '__main__':
    main()
