import { expect, test } from '@playwright/test';
import { freshStorage, readDownload, zipNames } from './helpers';

test('theme persists across reloads and applies before first paint', async ({ page }) => {
  await freshStorage(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch light or dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/playbook/', { waitUntil: 'commit' });
  await page.waitForFunction(() => document.documentElement.dataset.theme !== undefined);
  // The inline head script sets the attribute before the body is parsed.
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('copy chips copy values and show the toast', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/design-system/#colour');
  await page.getByRole('button', { name: 'Copy Deep Sea #285B57' }).click();
  await expect(page.locator('.st-toast')).toContainText('Copied #285B57');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('#285B57');
});

test('voice downloads respect the filter', async ({ page }) => {
  await page.goto('/voice/');
  await page.getByRole('button', { name: 'Needs confirmation' }).click();
  const wide = (page.viewportSize()?.width || 0) >= 720;
  const [d] = await Promise.all([
    page.waitForEvent('download'),
    wide ? page.getByRole('button', { name: 'Markdown' }).click() : (async () => { await page.getByRole('button', { name: 'Download' }).click(); await page.getByRole('menuitem', { name: 'Download Markdown' }).click(); })(),
  ]);
  expect(d.suggestedFilename()).toBe('hali-brand-voice-and-knowledge.md');
  const md = (await readDownload(d)).toString();
  expect(md.startsWith('# Hali — Brand voice and knowledge reference')).toBe(true);
  expect(md).toContain('*Needs confirmation*');
  expect(md).not.toContain('*Verified*');
});

test('asset library builds a ZIP with the right paths', async ({ page }) => {
  await page.goto('/assets/');
  await page.locator('section', { hasText: 'Template graphics' }).getByRole('button', { name: 'Select group' }).click();
  await page.getByRole('checkbox', { name: 'Select' }).first().check();
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Download 8 as ZIP/ }).click()]);
  expect(d.suggestedFilename()).toBe('hali-brand-assets.zip');
  const names = await zipNames(await readDownload(d));
  expect(names).toContain('logo/hali-lockup-horizontal.svg');
  expect(names.filter((n) => n.startsWith('graphics/'))).toHaveLength(7);
  await expect(page.getByRole('status').filter({ hasText: 'Downloaded 8 files' })).toBeVisible();
});

test('playbook contrast table computes grades', async ({ page }) => {
  await page.goto('/playbook/#access');
  const rows = page.locator('[role="table"][aria-label="Contrast pairs"] [role="row"]');
  await expect(rows).toHaveCount(11);
  await expect(rows.filter({ hasText: 'Ink on Paper' })).toContainText('AAA');
  await expect(rows.filter({ hasText: 'Ash on Paper' })).toContainText('Fail');
});

test('section nav jumps and tracks the active chapter', async ({ page }) => {
  await page.goto('/design-system/');
  const nav = page.locator('.st-side:visible, .st-bar:visible').first();
  await nav.getByRole('link', { name: /Governance/ }).click();
  await expect(page).toHaveURL(/#governance$/);
  await expect(nav.locator('[aria-current="true"]')).toContainText('Governance');
});

test('phone header collapses the studio nav into a menu', async ({ page }) => {
  test.skip((page.viewportSize()?.width || 0) >= 640, 'phone only');
  await page.goto('/voice/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('.st-menu').getByRole('link', { name: 'Assets' }).click();
  await expect(page).toHaveURL(/\/assets\/$/);
});
