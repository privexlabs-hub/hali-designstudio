import { expect, test, type Page } from '@playwright/test';
import { freshStorage, readDownload } from './helpers';

/* Phone-first checks, run on iPhone (WebKit) and Android (Chromium) device profiles. */

test.beforeEach(async ({ page }) => { await freshStorage(page); });

/** Stubs the Web Share API so the share path can be exercised headlessly; records what was shared. */
async function stubShare(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __shared: string[] };
    w.__shared = [];
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (d: { files?: File[] }) => { w.__shared.push(...(d.files || []).map((f) => f.name)); } });
  });
}

const canvasEl = (page: Page, text: string) => page.locator('.ed-vp .ed-board [data-el]').filter({ hasText: text }).first();

test('template editor: tap to select, action bar, steppers, inline edit, duplicate and delete', async ({ page }) => {
  await page.goto('/editor/#t=celebrations/cel-christmas/ig-portrait');
  await expect(page.locator('.ed-size')).toContainText('1080 × 1350');
  const merry = canvasEl(page, 'Merry');
  await merry.tap();
  const bar = page.getByRole('toolbar', { name: 'Selected element' });
  await expect(bar).toBeVisible();

  // Style opens the bottom sheet with the element's properties.
  await bar.getByRole('button', { name: 'Style' }).tap();
  const sheet = page.locator('.ed-right[data-open]');
  await expect(sheet).toBeVisible();
  // The − stepper gives negative values (phone keypads have no minus key).
  const rot = sheet.locator('.ed-field', { hasText: 'Rotate' }).locator('input');
  await sheet.getByRole('button', { name: 'Decrease Rotate °' }).tap();
  await expect(rot).toHaveValue('-1');
  // Text fields are at least 16px so iOS does not zoom on focus.
  const fs = await sheet.locator('textarea').first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(fs).toBeGreaterThanOrEqual(16);

  // Close the sheet (Canvas tab), then edit the text inline from the action bar.
  await page.locator('.ed-tabbar button', { hasText: 'Canvas' }).tap();
  await expect(bar).toBeVisible();
  await bar.getByRole('button', { name: 'Edit text' }).tap();
  const editable = page.locator('.ed-vp [contenteditable="true"]');
  await expect(editable).toBeVisible();
  await editable.fill('Happy');
  await page.locator('.ed-toolbar .ed-size').tap();
  await expect(canvasEl(page, 'Happy')).toBeVisible();

  // Duplicate, then delete the copy, from the action bar.
  const count = () => page.locator('.ed-vp .ed-board').first().locator('[data-el]').count();
  await expect(bar).toBeVisible(); // the edited element stays selected
  const before = await count();
  await bar.getByRole('button', { name: 'Duplicate' }).tap();
  await expect.poll(count).toBe(before + 1);
  await bar.getByRole('button', { name: 'Delete' }).tap();
  await expect.poll(count).toBe(before);
  await expect(bar).toBeHidden();
});

test('template editor: gallery, size, month and phone exports (download and share)', async ({ page }) => {
  await stubShare(page);
  await page.goto('/editor/#new=celebrations');
  const dlg = page.getByRole('dialog', { name: 'Choose a template' });
  await dlg.getByRole('group', { name: 'Filter templates' }).getByRole('button', { name: /^Monthly/ }).tap();
  await dlg.locator('button', { hasText: 'Happy new month' }).first().tap();
  await expect(dlg).toBeHidden();

  await page.locator('.ed-tabbar button', { hasText: /Design|Edit/ }).tap();
  const sheet = page.locator('.ed-right[data-open]');
  await sheet.locator('select:has(option[value="March"])').selectOption('March');
  await sheet.locator('select:has(option[value="wa-status"])').selectOption('wa-status');
  await expect(page.locator('.ed-size')).toContainText('WhatsApp status');
  await page.locator('.ed-tabbar button', { hasText: 'Canvas' }).tap();
  await expect(page.locator('.ed-vp .ed-board').first()).toContainText('March');

  // Export: the dialog's actions stay reachable at the bottom; Share appears because sharing is supported.
  await page.getByRole('button', { name: 'Export' }).first().tap();
  const ex = page.getByRole('dialog', { name: 'Export' });
  const foot = ex.locator('.ed-dialog-foot');
  await expect(foot.getByRole('button', { name: 'Share or save to phone' })).toBeInViewport();
  const [d] = await Promise.all([page.waitForEvent('download'), foot.getByRole('button', { name: /^Download/ }).tap()]);
  expect(d.suggestedFilename()).toMatch(/1080x1920\.png$/);
  expect((await readDownload(d)).subarray(1, 4).toString()).toBe('PNG');
  await foot.getByRole('button', { name: 'Share or save to phone' }).tap();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: string[] }).__shared)).toEqual([d.suggestedFilename()]);
});

test('document editor: tap a selected block opens its field; flow overflow; export', async ({ page }) => {
  await stubShare(page);
  await page.goto('/documents/#type=resume');
  const block = page.locator('.ed-vp [data-bid]').filter({ hasText: 'professional summary' }).first();
  await block.tap();
  const bar = page.getByRole('toolbar', { name: 'Selected block' });
  await expect(bar).toBeVisible();
  await block.tap();
  const sheet = page.locator('.ed-right[data-open]');
  await expect(sheet).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('TEXTAREA');
  const long = Array.from({ length: 45 }, (_, i) => 'Sentence ' + (i + 1) + ' describes a scope, a request and an approval.').join(' ');
  await sheet.locator('textarea').first().fill(long);
  await page.locator('.ed-tabbar button', { hasText: 'Canvas' }).tap();
  await expect(page.locator('.dc-split')).toHaveCount(1);
  await page.locator('.dc-split').tap();
  await expect(page.locator('.dc-split')).toHaveCount(0, { timeout: 15_000 });

  await page.getByRole('button', { name: 'Export' }).first().tap();
  const ex = page.getByRole('dialog', { name: 'Export document' });
  await ex.getByRole('radio', { name: /^DOCX/ }).tap();
  const [d] = await Promise.all([page.waitForEvent('download'), ex.locator('.ed-dialog-foot').getByRole('button', { name: 'Download' }).tap()]);
  expect(d.suggestedFilename()).toBe('full-name-cv.docx');
  await ex.getByRole('radio', { name: /^PDF/ }).tap();
  await ex.locator('.ed-dialog-foot').getByRole('button', { name: 'Share or save to phone' }).tap();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: string[] }).__shared), { timeout: 60_000 }).toEqual(['full-name-cv.pdf']);
});

test('on-screen keyboard: sheets lift above it and the focused field stays visible', async ({ page }) => {
  // Fake visualViewport so the keyboard can be opened headlessly (iOS overlays it instead of resizing the page).
  await page.addInitScript(() => {
    const t = new EventTarget() as EventTarget & { height: number; width: number; offsetTop: number; offsetLeft: number; scale: number };
    Object.assign(t, { height: window.innerHeight, width: window.innerWidth, offsetTop: 0, offsetLeft: 0, scale: 1 });
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => t });
    (window as unknown as { __kb: (h: number) => void }).__kb = (h: number) => { t.height = window.innerHeight - h; t.dispatchEvent(new Event('resize')); };
  });
  await page.goto('/editor/#t=social/announcement/ig-portrait');
  await page.locator('.ed-tabbar button', { hasText: /Design|Edit/ }).tap();
  const sheet = page.locator('.ed-right[data-open]');
  const field = sheet.locator('textarea').last();
  await field.tap();
  const kb = 300;
  await page.evaluate((h) => (window as unknown as { __kb: (h: number) => void }).__kb(h), kb);
  await expect(page.locator('.ed')).toHaveAttribute('data-kb', '');
  await expect(page.locator('.ed-tabbar')).toBeHidden();
  const vh = page.viewportSize()!.height;
  const sb = (await sheet.boundingBox())!;
  expect(sb.y + sb.height).toBeLessThanOrEqual(vh - kb + 1);
  await page.waitForTimeout(500);
  const fb = (await field.boundingBox())!;
  expect(fb.y + Math.min(fb.height, 40)).toBeLessThanOrEqual(vh - kb + 1);
});

/** Controls smaller than 40px in either dimension, on coarse pointers (inline prose links and canvas internals excluded). */
async function smallTargets(page: Page) {
  return page.evaluate(() => {
    const sel = 'button, [role="button"], [role="tab"], select, a[href], input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="hidden"]):not([type="file"]), textarea';
    const out: string[] = [];
    for (const e of document.querySelectorAll<HTMLElement>(sel)) {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') continue;
      if (e.closest('.ed-board, [data-xhost], .ed-xhost, [aria-hidden="true"], [data-touch-dup]')) continue;
      // Links inside a sentence are exempt from target size (WCAG 2.5.8): the parent has text besides the link.
      if (e.tagName === 'A' && e.parentElement && (e.parentElement.textContent || '').trim().length > (e.textContent || '').trim().length + 8) continue;
      if (r.width < 40 || r.height < 40) out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    return [...new Set(out)];
  });
}

for (const route of ['/', '/playbook/', '/design-system/', '/voice/', '/assets/', '/editor/', '/documents/#type=report']) {
  test(`touch targets, 16px fields and no sideways scroll: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    const o = await page.evaluate(() => ({ sw: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth), vw: document.documentElement.clientWidth }));
    expect(o.sw, 'horizontal overflow').toBeLessThanOrEqual(o.vw);
    expect(await smallTargets(page)).toEqual([]);
    const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), textarea, select')]
      .filter((e) => e.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.className + ' ' + getComputedStyle(e).fontSize));
    expect(small, 'fields under 16px zoom the page on iOS').toEqual([]);
  });
}

test('editor sheets and dialogs pass the touch and field checks', async ({ page }) => {
  await page.goto('/editor/#t=social/announcement/sq');
  for (const tab of ['Pages', /Design|Edit/]) {
    await page.locator('.ed-tabbar button', { hasText: tab }).tap();
    await expect(page.locator('.ed-panel[data-open]')).toBeVisible();
    expect(await smallTargets(page), String(tab)).toEqual([]);
  }
  await page.locator('.ed-tabbar button', { hasText: 'Canvas' }).tap();
  await page.getByRole('button', { name: 'Export' }).first().tap();
  expect(await smallTargets(page), 'export dialog').toEqual([]);
});
