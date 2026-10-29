import { expect, test } from '@playwright/test';

/* Every route at phone, tablet and desktop widths, light and dark: no horizontal page scroll, no errors. */
const ROUTES = ['/', '/playbook/', '/design-system/', '/voice/', '/assets/', '/editor/', '/editor/#new=celebrations', '/documents/#type=book'];
const WIDTHS = [320, 360, 375, 390, 414, 768, 834, 1024, 1280, 1440, 1920];

test.describe.configure({ mode: 'parallel' });
test.skip(({ browserName }) => browserName !== 'chromium');

for (const theme of ['light', 'dark'] as const) {
  for (const w of WIDTHS) {
    test(`${theme} @${w}px`, async ({ browser }) => {
      test.setTimeout(120_000);
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 800 : 900 }, hasTouch: w < 1024, isMobile: w < 700 });
      await ctx.addInitScript((t) => localStorage.setItem('hali-studio:theme', t), theme);
      const page = await ctx.newPage();
      const errors: string[] = [];
      let cur = '';
      page.on('pageerror', (e) => errors.push(cur + ': ' + String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(cur + ': ' + m.text()); });
      for (const r of ROUTES) {
        cur = r;
        await page.goto(r, { waitUntil: 'networkidle' });
        await page.waitForTimeout(150);
        // body clips horizontally (overflow-x: hidden), but its scrollWidth still reports any content wider than the viewport.
        const o = await page.evaluate(() => ({ sw: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth), vw: document.documentElement.clientWidth, theme: document.documentElement.dataset.theme }));
        expect(o.sw, `${r} horizontal overflow at ${w}px`).toBeLessThanOrEqual(o.vw);
        expect(o.theme).toBe(theme);
      }
      expect(errors, errors.join('\n')).toEqual([]);
      await ctx.close();
    });
  }
}
