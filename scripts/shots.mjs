// Usage: node scripts/shots.mjs <baseUrl> <outDir> <route,route> <width,width> [dark]
// Screenshots each route at each width and reports horizontal overflow + console errors.
import { chromium } from '@playwright/test';
const [base, out, routes, widths, theme] = process.argv.slice(2);
const browser = await chromium.launch();
let bad = 0;
for (const w of widths.split(',').map(Number)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 800 : 900 }, deviceScaleFactor: 1, hasTouch: w < 900, isMobile: w < 700 });
  if (theme === 'dark') await ctx.addInitScript(() => localStorage.setItem('hali-studio:theme', 'dark'));
  for (const r of routes.split(',')) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    page.on('response', (r) => { if (r.status() >= 400 && !/_rsc=|\/(editor|documents|playbook)\//.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
    page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(base + r, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html,body{overflow-x:visible!important}' });
    await page.waitForTimeout(400);
    const o = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.right > vw + 1 && getComputedStyle(e).position !== 'fixed' && b.width > 0; })
        .filter((e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return false; } return true; }).slice(0, 5).map((e) => e.tagName + '.' + (e.className?.baseVal ?? e.className) + ' r=' + Math.round(e.getBoundingClientRect().right));
      return { sw: document.documentElement.scrollWidth, vw, wide };
    });
    const name = r.replace(/[\/#=]+/g, '_') || 'home';
    await page.screenshot({ path: `${out}/${name}-${w}${theme ? '-' + theme : ''}.png`, fullPage: process.env.FULL === '1' });
    const flag = o.sw > o.vw || errs.length;
    if (flag) bad++;
    console.log(`${flag ? 'FAIL' : 'ok  '} ${r} @${w}: scroll ${o.sw}/${o.vw}${o.wide.length ? ' wide: ' + o.wide.join(' | ') : ''}${errs.length ? ' errors: ' + errs.slice(0, 3).join(' || ') : ''}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
