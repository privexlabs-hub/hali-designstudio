// node scripts/tiles.mjs <url> <outPrefix> <width> [height] [dark] — viewport screenshots down the whole page.
import { chromium } from '@playwright/test';
const [url, out, w, h = '1000', theme] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: +w < 900, isMobile: +w < 700 });
if (theme === 'dark') await ctx.addInitScript(() => localStorage.setItem('hali-studio:theme', 'dark'));
const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'networkidle' });
const total = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += +h - 60, i++) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.png` });
}
console.log(i, 'tiles');
await b.close();
