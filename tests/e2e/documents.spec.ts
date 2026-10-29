import { expect, test } from '@playwright/test';
import JSZip from 'jszip';
import { freshStorage, isPhone, openSheet, readDownload, zipNames } from './helpers';

test.beforeEach(async ({ page }) => { await freshStorage(page); });

const TYPES: [string, number][] = [['book', 30], ['report', 12], ['whitepaper', 12], ['proposal', 11], ['casestudy', 9], ['presentation', 17], ['article', 13], ['newsletter', 12], ['resume', 2]];

test('every document type loads with its starter pages and no overflow', async ({ page }) => {
  test.setTimeout(180_000);
  for (const [t, n] of TYPES) {
    await page.goto('/documents/#type=' + t);
    await expect(page.locator('.ed-vp .dc-pagewrap')).toHaveCount(n);
    await page.waitForTimeout(400);
    await expect(page.locator('.dc-split'), t).toHaveCount(0);
    await expect(page.locator('.dc-overflow'), t).toHaveCount(0);
  }
});

test('#new opens the chooser and creating a document closes it', async ({ page }) => {
  await page.goto('/documents/#new');
  const dlg = page.getByRole('dialog', { name: 'Documents' });
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button', { name: /Presentation/ }).click();
  await expect(dlg).toBeHidden();
  await expect(page.locator('.ed-size')).toContainText('Slide 16:9');
});

test('overflowing content is flowed onto new pages', async ({ page }) => {
  await page.goto('/documents/#type=resume');
  await expect(page.locator('.ed-vp .dc-pagewrap')).toHaveCount(2);
  // Select the profile paragraph on page 1 and make it very long via the panel.
  await page.locator('.ed-vp [data-bid]').filter({ hasText: 'professional summary' }).first().click();
  await openSheet(page, 'Edit');
  const long = Array.from({ length: 30 }, (_, i) => 'Sentence ' + (i + 1) + ' describes a scope, a request, a change and an approval in plain words.').join(' ');
  await page.locator('.ed-right textarea').first().fill(long);
  await page.getByRole('button', { name: 'Deselect block' }).click();
  await openSheet(page, 'Canvas');
  await expect(page.locator('.dc-split')).toHaveCount(1);
  await openSheet(page, 'Pages');
  await page.getByRole('button', { name: 'Flow onto new pages' }).click();
  await expect(page.locator('.dc-split')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator('.ed-vp .dc-pagewrap')).toHaveCount(3);
  await expect(page.locator('.ed-vp .dc-pagewrap').nth(1)).toContainText('continued');
});

test('inline editing on the page commits on blur and undo restores', async ({ page }) => {
  await page.goto('/documents/#type=article');
  const title = page.locator('.ed-vp [data-bid]').filter({ hasText: 'How to price a change' }).first();
  await title.click();
  const editable = title.locator('[contenteditable="true"]').first();
  await expect(editable).toBeVisible();
  await editable.fill('Edited on the page');
  await page.locator('.ed-toolbar .ed-size').click();
  await expect(page.locator('.ed-vp')).toContainText('Edited on the page');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.ed-vp')).not.toContainText('Edited on the page');
});

async function exportAs(page: import('@playwright/test').Page, label: RegExp) {
  await page.getByRole('button', { name: 'Export' }).first().click();
  const dlg = page.getByRole('dialog', { name: 'Export document' });
  await dlg.getByRole('radio', { name: label }).click();
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 120_000 }), dlg.getByRole('button', { name: /^Download$/ }).click()]);
  return { d, buf: await readDownload(d), dlg };
}

test('resume exports DOCX, Markdown, text, HTML, PDF and a PNG ZIP', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('/documents/#type=resume');
  await expect(page.locator('.ed-vp .dc-pagewrap')).toHaveCount(2);
  const docx = await exportAs(page, /^DOCX/);
  expect(docx.d.suggestedFilename()).toBe('full-name-cv.docx');
  const z = await JSZip.loadAsync(docx.buf);
  expect(await z.file('word/document.xml')!.async('string')).toContain('<w:body>');
  await page.keyboard.press('Escape');
  const md = await exportAs(page, /^Markdown/);
  expect(md.buf.toString()).toContain('# [Full name] — CV');
  await page.keyboard.press('Escape');
  const txt = await exportAs(page, /^Text/);
  expect(txt.buf.toString()).not.toContain('**');
  await page.keyboard.press('Escape');
  const html = await exportAs(page, /^HTML/);
  const h = html.buf.toString();
  expect(h).toContain('<!DOCTYPE html>');
  expect(h).toContain('@font-face');
  expect((h.match(/class="pg"/g) || []).length).toBe(2);
  await page.keyboard.press('Escape');
  const pdf = await exportAs(page, /^PDF/);
  expect(pdf.buf.subarray(0, 5).toString()).toBe('%PDF-');
  await page.keyboard.press('Escape');
  const png = await exportAs(page, /^PNG/);
  expect(png.d.suggestedFilename()).toBe('full-name-cv-pages.zip');
  expect(await zipNames(png.buf)).toEqual(['full-name-cv-p01.png', 'full-name-cv-p02.png']);
});

test('presentation exports PPTX', async ({ page }) => {
  test.skip(isPhone(page), 'covered on desktop');
  test.setTimeout(240_000);
  await page.goto('/documents/#type=presentation');
  const { d, buf } = await exportAs(page, /^PPTX/);
  expect(d.suggestedFilename().endsWith('.pptx')).toBe(true);
  const z = await JSZip.loadAsync(buf);
  expect(Object.keys(z.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))).toHaveLength(17);
});

test('book exports EPUB', async ({ page }) => {
  test.skip(isPhone(page), 'covered on desktop');
  test.setTimeout(240_000);
  await page.goto('/documents/#type=book');
  const { d, buf } = await exportAs(page, /^EPUB/);
  expect(d.suggestedFilename()).toBe('scope-that-holds.epub');
  const z = await JSZip.loadAsync(buf);
  expect(Object.keys(z.files)[0]).toBe('mimetype');
  expect(z.file('OEBPS/images/cover.png')).toBeTruthy();
  expect(Object.keys(z.files).some((n) => /OEBPS\/images\/img-\d+\.png/.test(n))).toBe(true);
});

test('document file save and open round-trip', async ({ page }) => {
  await page.goto('/documents/#type=proposal');
  await page.getByRole('button', { name: 'Export' }).first().click();
  const dlg = page.getByRole('dialog', { name: 'Export document' });
  const [d] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Save document file' }).click()]);
  expect(d.suggestedFilename()).toBe('project-name-proposal.hali-doc.json');
  const file = await d.path();
  await dlg.locator('input[type="file"]').setInputFiles(file!);
  await expect(page.locator('.ed-notice')).toContainText('Opened');
});
