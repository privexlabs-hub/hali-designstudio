/* Hali Brand Studio — client-side export engine (PNG / JPEG / SVG / ZIP / JSON).
   Libraries are bundled and loaded on demand; fonts are embedded from the self-hosted WOFF2 files, so export works offline. */
import { downloadBlob } from './brand';

export type ImageFormat = 'png' | 'jpg' | 'svg';

export const loadHtmlToImage = () => import('html-to-image');
export const loadJSZip = () => import('jszip').then((m) => m.default);

/** Font faces embedded into captured images (must match src/styles/tokens/fonts.css). */
const FONT_FILES: [string, number, 'normal' | 'italic', string][] = [
  ['Geist', 400, 'normal', 'Geist-Regular'], ['Geist', 500, 'normal', 'Geist-Medium'], ['Geist', 600, 'normal', 'Geist-SemiBold'], ['Geist', 700, 'normal', 'Geist-Bold'],
  ['Geist', 400, 'italic', 'Geist-Italic'], ['Geist', 500, 'italic', 'Geist-MediumItalic'], ['Geist', 600, 'italic', 'Geist-SemiBoldItalic'], ['Geist', 700, 'italic', 'Geist-BoldItalic'],
  ['Geist Mono', 400, 'normal', 'GeistMono-Regular'], ['Geist Mono', 500, 'normal', 'GeistMono-Medium'], ['Geist Mono', 600, 'normal', 'GeistMono-SemiBold'],
];

export const blobToDataURL = (blob: Blob) =>
  new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); });

let fontCSSPromise: Promise<string> | null = null;
export function fontCSS(): Promise<string> {
  if (fontCSSPromise) return fontCSSPromise;
  fontCSSPromise = (async () => {
    try {
      const faces = await Promise.all(FONT_FILES.map(async ([family, weight, style, file]) => {
        const data = await blobToDataURL(await (await fetch('/fonts/' + file + '.woff2')).blob());
        return `@font-face{font-family:"${family}";src:url(${data}) format("woff2");font-weight:${weight};font-style:${style};}`;
      }));
      return faces.join('\n');
    } catch (e) {
      console.warn('Font embedding failed; export will use fallback fonts.', e);
      fontCSSPromise = null;
      return '';
    }
  })();
  return fontCSSPromise;
}

const waitImages = (node: HTMLElement) =>
  Promise.all([...node.querySelectorAll('img')].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));

export interface CaptureOptions { format: ImageFormat; scale?: number; quality?: number; w: number; h: number; bg?: string }

export async function capture(node: HTMLElement, o: CaptureOptions): Promise<Blob> {
  const h2i = await loadHtmlToImage();
  await waitImages(node);
  if (document.fonts) await document.fonts.ready;
  const opts = {
    width: o.w, height: o.h, pixelRatio: o.scale || 1, cacheBust: false, fontEmbedCSS: await fontCSS(),
    style: { transform: 'none', margin: '0', left: '0', top: '0' }, skipAutoScale: true,
  };
  if (o.format === 'svg') {
    const url = await h2i.toSvg(node, opts);
    return new Blob([decodeURIComponent(url.split(',').slice(1).join(','))], { type: 'image/svg+xml' });
  }
  if (o.format === 'jpg') {
    const url = await h2i.toJpeg(node, { ...opts, quality: o.quality || 0.92, backgroundColor: o.bg || '#FFFFFF' });
    return await (await fetch(url)).blob();
  }
  const blob = await h2i.toBlob(node, opts);
  if (!blob) throw new Error('The image could not be rendered.');
  return blob;
}

export const download = downloadBlob;

export interface ZipFile { name: string; blob: Blob | string; binary?: boolean }
export async function zip(files: ZipFile[]): Promise<Blob> {
  const JSZip = await loadJSZip();
  const z = new JSZip();
  // ArrayBuffers work in every JSZip environment (Blobs only in browsers).
  for (const f of files) z.file(f.name, typeof f.blob === 'string' ? f.blob : await f.blob.arrayBuffer());
  return z.generateAsync({ type: 'blob' });
}

export const slug = (s: string | undefined) =>
  String(s || 'design').toLowerCase().replace(/[—–]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
export const ext = (f: string) => (f === 'jpg' ? 'jpg' : f === 'svg' ? 'svg' : 'png');

/** Waits for n animation frames (lets React commit and the browser lay out before capture/measure). */
export const frames = (n: number) => new Promise<void>((res) => { const step = (k: number) => (k <= 0 ? res() : requestAnimationFrame(() => step(k - 1))); step(n); });

/* ---------- Phones: share sheet, memory-aware scale, iOS ---------- */

export interface OutFile { name: string; blob: Blob }

const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

/** iPhone / iPad (iPadOS reports a Mac user agent but has touch). */
export const isIOS = () => isBrowser() && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
export const isTouch = () => isBrowser() && window.matchMedia('(pointer: coarse)').matches;

const toFile = (f: OutFile) => new File([f.blob], f.name, { type: f.blob.type || 'application/octet-stream' });

/** True when the browser can hand files to the system share sheet (Save to Photos, Instagram, WhatsApp…). */
export function canShareFiles(): boolean {
  if (!isBrowser() || typeof navigator.canShare !== 'function' || typeof File === 'undefined') return false;
  try { return navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })] }); } catch { return false; }
}

/**
 * Picks what to share: the files themselves when there are up to 10 and the browser accepts them (images then go
 * straight to Photos or an app), otherwise one ZIP.
 */
export async function shareSet(files: OutFile[], zipName: string): Promise<OutFile[]> {
  if (files.length === 1) return files;
  if (files.length <= 10 && typeof navigator.canShare === 'function') {
    try { if (navigator.canShare({ files: files.map(toFile) })) return files; } catch { /* fall through to ZIP */ }
  }
  return [{ name: zipName, blob: await zip(files) }];
}

/** Opens the share sheet. Resolves 'shared', 'cancelled' (user closed it) or 'blocked' (needs a fresh tap). */
export async function shareFiles(files: OutFile[], title: string): Promise<'shared' | 'cancelled' | 'blocked'> {
  try {
    await navigator.share({ files: files.map(toFile), title });
    return 'shared';
  } catch (e) {
    const n = (e as Error)?.name;
    if (n === 'AbortError') return 'cancelled';
    if (n === 'NotAllowedError') return 'blocked';
    throw e;
  }
}

/**
 * Pixel ratio for layout-faithful captures (PDF, PNG pages, covers). Phones with little memory, or long documents
 * on touch devices, drop from 2× to 1.5× so the browser does not run out of memory mid-export.
 */
export function rasterScale(pages: number): number {
  if (!isBrowser()) return 2;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if ((mem !== undefined && mem <= 4) || (isTouch() && pages > 12)) return 1.5;
  return 2;
}
