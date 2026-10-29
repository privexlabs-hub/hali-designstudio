import type { Download, Page } from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs';

export async function freshStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    for (const n of ['hali-studio', 'hali-docs']) await new Promise((r) => { const q = indexedDB.deleteDatabase(n); q.onsuccess = q.onerror = q.onblocked = () => r(null); });
  });
}

export async function readDownload(d: Download): Promise<Buffer> {
  const p = await d.path();
  return fs.readFileSync(p!);
}

export async function zipNames(buf: Buffer): Promise<string[]> {
  const z = await JSZip.loadAsync(buf);
  return Object.keys(z.files).filter((n) => !z.files[n].dir).sort();
}

export const isPhone = (page: Page) => (page.viewportSize()?.width || 1440) < 960;

/** On phones the panels live in bottom sheets opened from the tab bar. */
export async function openSheet(page: Page, name: 'Pages' | 'Edit' | 'Design' | 'Canvas') {
  if (!isPhone(page)) return;
  const tab = page.locator('.ed-tabbar button', { hasText: name === 'Edit' || name === 'Design' ? /Edit|Design/ : name });
  if ((await tab.getAttribute('aria-pressed')) !== 'true') await tab.click();
}
