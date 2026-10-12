// Browser QA for the built portal:  node scripts/qa.js  (serves site/ on a local port)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'site');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => srv.listen(8765, r));
  const base = 'http://localhost:8765';
  const b = await chromium.launch();
  const pages = ['/index.html', ...fs.readdirSync(ROOT).filter(d => fs.existsSync(path.join(ROOT, d, 'index.html'))).map(d => `/${d}/index.html`)];
  const fails = []; const fail = m => { fails.push(m); console.log('FAIL', m); };
  for (const vp of [{ width: 1366, height: 900, name: 'desktop' }, { width: 390, height: 844, name: 'mobile' }]) {
    const ctx = await b.newContext({ viewport: vp, permissions: ['clipboard-read', 'clipboard-write'] });
    for (const u of pages) {
      const pg = await ctx.newPage(); const errs = [];
      pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      pg.on('pageerror', e => errs.push(String(e)));
      pg.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) errs.push(`${r.status()} ${r.url()}`); });
      await pg.goto(base + u, { waitUntil: 'load' });
      // local links and downloads must resolve (fonts.googleapis may be blocked in the sandbox: ignored)
      const hrefs = await pg.$$eval('a[href], img[src]', els => els.map(e => e.getAttribute('href') || e.getAttribute('src')));
      for (const h of new Set(hrefs)) {
        if (/^(https?:|mailto:|#)/.test(h)) continue;
        const abs = new URL(h, base + u).pathname;
        if (!fs.existsSync(path.join(ROOT, abs.endsWith('/') ? abs + 'index.html' : abs))) errs.push(`broken link ${h}`);
      }
      // scroll through so lazy images load, then require every image to have decoded
      await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
      const lazyBad = await pg.evaluate(async () => {
        const imgs = Array.from(document.images); imgs.forEach(i => { i.loading = 'eager'; });
        const res = await Promise.all(imgs.map(i => Promise.race([i.decode().then(() => null, () => i.getAttribute('src')),
          new Promise(r => setTimeout(() => r(i.naturalWidth ? null : i.getAttribute('src')), 8000))])));
        return res.filter(Boolean); });
      lazyBad.forEach(s => errs.push('image did not load ' + s));
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) errs.push(`horizontal overflow ${over}px`);
      const imgs = await pg.$$eval('img', els => els.filter(i => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map(i => i.src));
      imgs.forEach(s => errs.push('image failed ' + s));
      errs.filter(e => !/fonts\.(googleapis|gstatic)/.test(e)).forEach(e => fail(`${vp.name} ${u}: ${e}`));
      if (vp.name === 'desktop' && u !== '/index.html' && u === pages[1]) {
        const btn = pg.locator('[data-copy]').first(); await btn.scrollIntoViewIfNeeded(); await btn.click();
        const clip = await pg.evaluate(() => navigator.clipboard.readText());
        const want = await pg.locator('.copy-text').first().textContent();
        if (clip !== want) fail(`copy button: clipboard "${clip.slice(0, 40)}" != "${want.slice(0, 40)}"`); else console.log('ok copy button');
        if (!(await btn.textContent()).includes('Copied')) fail('copy button label did not change');
      }
      if (u === '/index.html' && vp.name === 'desktop') {
        const n = async () => pg.locator('.pcard:not([hidden])').count();
        const total = await n();
        await pg.fill('#q', 'technician'); const t1 = await n();
        await pg.fill('#q', ''); await pg.selectOption('#f-industry', 'dental'); const t2 = await n();
        await pg.selectOption('#f-industry', ''); await pg.selectOption('#f-status', 'available'); const t3 = await n();
        const emptyShown = await pg.isVisible('#empty');
        await pg.click('#reset'); const t4 = await n();
        await pg.selectOption('#f-tier', 'complete'); const t5 = await n();
        console.log(`filters: total ${total}, search 'technician' ${t1}, dental ${t2}, available ${t3} (empty state ${emptyShown}), reset ${t4}, complete tier ${t5}`);
        if (!(t1 > 0 && t1 < total && t2 === 1 && t4 === total && t5 === total)) fail('filter results unexpected');
        if (t3 === 0 && !emptyShown) fail('empty state not shown');
      }
      if (u === '/index.html' || u === pages[1]) await pg.screenshot({ path: path.join(require('os').tmpdir(), `qa-${vp.name}-${u.split('/')[1] || 'index'}.png`.replace('.html', '')), fullPage: true });
      await pg.close();
    }
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log(fails.length ? `QA FAILED: ${fails.length} issue(s)` : `QA PASSED: ${pages.length} pages x 2 viewports`);
  process.exit(fails.length ? 1 : 0);
})();
