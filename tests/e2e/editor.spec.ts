import { expect, test } from '@playwright/test';
import { freshStorage, isPhone, openSheet, readDownload, zipNames } from './helpers';

test.beforeEach(async ({ page }) => { await freshStorage(page); });

test('deep link creates a design and the canvas renders', async ({ page }) => {
  await page.goto('/editor/#t=article/editorial/x-article');
  await expect(page.locator('.ed-name')).toHaveValue(/Editorial — X article image/);
  await expect(page.locator('.ed-size')).toContainText('1500 × 600');
  await expect(page).toHaveURL(/\/editor\/$/);
});

test('#new opens the gallery on a category and creating closes it', async ({ page }) => {
  await page.goto('/editor/#new=avatar');
  const dlg = page.getByRole('dialog', { name: 'Choose a template' });
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[aria-current="true"]')).toContainText('Avatars');
  await dlg.getByRole('button', { name: /Initials/ }).click();
  await expect(dlg).toBeHidden();
  await expect(page.locator('.ed-size')).toContainText('400 × 400');
});

test('drag moves an element, undo restores it, size change keeps edited text', async ({ page }) => {
  await page.goto('/editor/#t=social/announcement/sq');
  await expect(page.locator('.ed-name')).toHaveValue(/Announcement/);
  const title = page.locator('.ed-vp .ed-board [data-el]').filter({ hasText: 'Proposals now carry' }).first();
  const box = (await title.boundingBox())!;
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  if (isPhone(page)) {
    // touch drag via pointer events
    await title.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: start.x, clientY: start.y, isPrimary: true, bubbles: true });
    for (let i = 1; i <= 5; i++) await page.evaluate(([x, y]) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y })), [start.x + i * 6, start.y + i * 8]);
    await page.evaluate(([x, y]) => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y })), [start.x + 30, start.y + 40]);
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 30, start.y + 40, { steps: 6 });
    await page.mouse.up();
  }
  const moved = (await title.boundingBox())!;
  expect(Math.round(moved.y - box.y)).toBeGreaterThan(20);
  await page.getByRole('button', { name: 'Undo' }).click();
  const back = (await title.boundingBox())!;
  expect(Math.abs(back.y - box.y)).toBeLessThan(2);

  // edit the title text in the panel, then change size: the text survives the re-flow
  await openSheet(page, 'Edit');
  await page.locator('.ed-right .ed-textarea').first().fill('My edited headline');
  await page.getByRole('button', { name: 'Deselect' }).click();
  await openSheet(page, 'Design');
  await page.locator('.ed-right select:has(option[value="story"])').selectOption('story');
  await expect(page.locator('.ed-size')).toContainText('1080 × 1920');
  await expect(page.locator('.ed-vp .ed-board').first()).toContainText('My edited headline');
});

test('resize with a handle changes the element size', async ({ page }) => {
  test.skip(isPhone(page), 'mouse handle drag');
  await page.goto('/editor/#t=social/announcement/sq');
  const title = page.locator('.ed-vp .ed-board [data-el]').filter({ hasText: 'Proposals now carry' }).first();
  await title.click();
  const before = (await title.boundingBox())!;
  const h = (await page.locator('.ed-handle').nth(4).boundingBox())!; // se
  await page.mouse.move(h.x + 6, h.y + 6);
  await page.mouse.down();
  await page.mouse.move(h.x - 60, h.y + 40, { steps: 5 });
  await page.mouse.up();
  const after = (await title.boundingBox())!;
  expect(after.width).toBeLessThan(before.width - 40);
});

test('pages: add, duplicate and delete', async ({ page }) => {
  await page.goto('/editor/#t=carousel/carousel/sq');
  await openSheet(page, 'Pages');
  await expect(page.locator('.ed-pagecard')).toHaveCount(5);
  await page.getByRole('button', { name: 'Duplicate page' }).click();
  await openSheet(page, 'Pages');
  await expect(page.locator('.ed-pagecard')).toHaveCount(6);
  await page.getByRole('button', { name: 'Delete page' }).click();
  await openSheet(page, 'Pages');
  await expect(page.locator('.ed-pagecard')).toHaveCount(5);
  await page.getByRole('button', { name: 'Add page' }).click();
  await page.getByRole('menuitem', { name: 'Blank page' }).click();
  await openSheet(page, 'Pages');
  await expect(page.locator('.ed-pagecard')).toHaveCount(6);
});

test('design persists across reloads', async ({ page }) => {
  await page.goto('/editor/#t=ads/offer/mpu');
  await expect(page.locator('.ed-size')).toContainText('300 × 250');
  await page.locator('.ed-name').fill('Persisted design');
  await page.waitForTimeout(800);
  await page.reload();
  await expect(page.locator('.ed-name')).toHaveValue('Persisted design');
});

for (const [fmt, label, extn] of [['png', 'PNG', '.png'], ['svg', 'SVG', '.svg'], ['jpg', 'JPEG', '.jpg'], ['json', 'Design', '.hali.json']] as const) {
  test(`export current page as ${fmt}`, async ({ page }) => {
    await page.goto('/editor/#t=social/quote/sq');
    await page.getByRole('button', { name: 'Export' }).first().click();
    const dlg = page.getByRole('dialog', { name: 'Export' });
    await dlg.getByRole('radio', { name: new RegExp(label) }).click();
    const [d] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: /^Download$/ }).click()]);
    expect(d.suggestedFilename().endsWith(extn)).toBe(true);
    const buf = await readDownload(d);
    expect(buf.length).toBeGreaterThan(fmt === 'json' ? 200 : 1000);
    if (fmt === 'png') expect(buf.subarray(1, 4).toString()).toBe('PNG');
    if (fmt === 'json') { const j = JSON.parse(buf.toString()); expect(j.pages.length).toBe(1); expect(j.fmt).toBe('sq'); }
    await expect(dlg.getByRole('status')).toContainText('Downloaded');
  });
}

test('export every size as a ZIP and round-trip a design file', async ({ page }) => {
  await page.goto('/editor/#t=social/cta/sq');
  await page.getByRole('button', { name: 'Export' }).first().click();
  const dlg = page.getByRole('dialog', { name: 'Export' });
  await dlg.getByRole('radio', { name: /Every size/ }).click();
  const [d] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download ZIP' }).click()]);
  expect(d.suggestedFilename()).toBe('call-to-action-all-sizes.zip');
  const names = await zipNames(await readDownload(d));
  expect(names).toHaveLength(21);
  for (const n of ['call-to-action-1080x1080.png', 'call-to-action-1080x1350.png', 'call-to-action-1080x1920.png', 'call-to-action-1280x720.png', 'call-to-action-1600x900.png', 'call-to-action-1200x630.png', 'call-to-action-1000x1500.png', 'call-to-action-1200x1200.png']) expect(names).toContain(n);
  // Same-size platform formats get distinct names.
  expect(names).toContain('call-to-action-1080x1080-2.png');

  await dlg.getByRole('radio', { name: /Design/ }).click();
  await dlg.getByRole('radio', { name: /Current page/ }).click();
  const [j] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: /^Download$/ }).click()]);
  const file = await j.path();
  await page.locator('.ed-name').fill('Changed');
  await dlg.locator('input[type="file"]').setInputFiles(file!);
  await expect(page.locator('.ed-notice')).toContainText('Imported');
  await expect(page.locator('.ed-name')).toHaveValue(/Call to action/);
});

test('celebrations: filter by group, create at a platform size, re-flow keeps edits', async ({ page }) => {
  await page.goto('/editor/#new=celebrations');
  const dlg = page.getByRole('dialog', { name: 'Choose a template' });
  await expect(dlg.locator('[aria-current="true"]')).toContainText('Celebrations & holidays');
  const filter = dlg.getByRole('group', { name: 'Filter templates' });
  await filter.getByRole('button', { name: /^Nigeria/ }).click();
  await expect(dlg.locator('button', { hasText: 'Nigeria Independence Day' })).toBeVisible();
  await expect(dlg.locator('button', { hasText: 'Merry Christmas' })).toHaveCount(0);
  await filter.getByRole('button', { name: /^All/ }).click();
  await dlg.getByRole('group', { name: 'Size' }).getByRole('button', { name: 'Instagram story, 1080 by 1920' }).click();
  await dlg.locator('button', { hasText: 'Merry Christmas' }).first().click();
  await expect(dlg).toBeHidden();
  await expect(page.locator('.ed-size')).toContainText('Instagram story · 1080 × 1920');
  await expect(page.locator('.ed-vp .ed-safe').first()).toBeVisible();
  await openSheet(page, 'Design');
  await page.locator('.ed-right textarea').filter({ hasText: 'Thank you for a year' }).fill('A calm and restful Christmas to you.');
  await page.locator('.ed-right select:has(option[value="x-post"])').selectOption('x-post');
  await expect(page.locator('.ed-size')).toContainText('1600 × 900');
  await expect(page.locator('.ed-vp .ed-board').first()).toContainText('A calm and restful Christmas to you.');
});

test('happy new month: the month select re-flows the design', async ({ page }) => {
  await page.goto('/editor/#t=celebrations/cel-new-month/ig-portrait');
  await openSheet(page, 'Design');
  await page.locator('.ed-right').getByRole('combobox', { name: 'Month' }).selectOption('March');
  await openSheet(page, 'Canvas');
  await expect(page.locator('.ed-vp .ed-board').first()).toContainText('March');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.ed-vp .ed-board').first()).not.toContainText('March');
});
