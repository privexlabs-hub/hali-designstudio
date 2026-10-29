// node scripts/gallery-sheets.mjs <baseUrl> <outDir> <fmt,fmt> — screenshots the celebration gallery per size.
import { chromium } from '@playwright/test';
const [base, out, fmts] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
for (const f of fmts.split(',')) {
  await p.goto(base + '/editor/#new=celebrations', { waitUntil: 'networkidle' });
  const dlg = p.getByRole('dialog', { name: 'Choose a template' });
  await dlg.locator(`button[aria-pressed]`).filter({ hasText: /×/ }).first().waitFor();
  const pills = dlg.locator('[aria-label="Size"] button');
  const n = await pills.count();
  for (let i = 0; i < n; i++) { const t = await pills.nth(i).innerText(); if (t.includes(f.split('|')[1])) { await pills.nth(i).click(); break; } }
  const sc = dlg.locator('[class*="content"]').first();
  const total = await sc.evaluate((e) => e.scrollHeight);
  for (let y = 0, k = 0; y < total; y += 820, k++) {
    await sc.evaluate((e, y) => { e.scrollTop = y; }, y);
    await p.waitForTimeout(500);
    await dlg.screenshot({ path: `${out}/${f.split('|')[0]}-${k}.png` });
  }
}
await b.close();
