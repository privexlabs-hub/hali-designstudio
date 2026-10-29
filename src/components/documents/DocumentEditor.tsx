'use client';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Icon, IconButton, Logo } from '@/components/ds';
import { Menu } from '@/components/shell/Menu';
import { MobileActionBar } from '@/components/editor/MobileActionBar';
import { Dialog, SheetHandle } from '@/components/editor/shared';
import { useHistory } from '@/hooks/useHistory';
import { useVisualViewport } from '@/hooks/useVisualViewport';
import { useMediaQuery, prefersReducedMotion } from '@/hooks/useMediaQuery';
import { BLOCKS, DOC_TYPES, KIND_NAMES, SIZES, TYPES, makePage, newDocument, uid, type Block, type BlockType, type Doc, type DocType, type ExportFormat, type SizeId } from '@/lib/documents';
import { docx, epub, htmlFile, markdown, pdf, plain, pptx, printNodes } from '@/lib/docexport';
import { canShareFiles, capture, download, frames, isIOS, rasterScale, shareFiles, shareSet, slug, zip, type OutFile } from '@/lib/export';
import { createDocStore, StorageFullError } from '@/lib/storage';
import { useTheme } from '@/lib/theme';
import { DocExportPage, DocPageView, type DocInteractive } from './DocPage';
import { DocNavigator } from './DocNavigator';
import { DocProperties, type DocPropsApi } from './DocProperties';

type Sheet = 'pages' | 'edit' | null;
type Notice = { tone: 'success' | 'attention' | 'error'; text: string; storage?: boolean } | null;
type Msg = { tone: 'success' | 'error' | 'info'; text: string } | null;

const store = createDocStore<Doc>('hali-docs', 'hali-docs:docs', 'hali-docs:current');

const FMTS: Record<ExportFormat, [string, string]> = {
  pdf: ['PDF', 'Every page as it looks here, page order preserved. Text is rendered as image.'],
  print: ['Print', 'Opens the print dialog — save as PDF for selectable text and exact page sizes.'],
  docx: ['DOCX', 'Editable Word document with headings, lists, tables, images and page breaks.'],
  pptx: ['PPTX', 'Editable PowerPoint: text stays editable; charts, tables and images are placed as pictures.'],
  epub: ['EPUB', 'Reflowable ebook with chapters, contents, cover and images.'],
  html: ['HTML', 'A single web page with every page laid out as designed.'],
  md: ['Markdown', 'Clean structured text for CMSs and AI tools.'],
  txt: ['Text', 'Plain text, no formatting.'],
  png: ['PNG', 'One image per page at 2×; several pages download as a ZIP.'],
};
const PAGE_SCOPED: ExportFormat[] = ['pdf', 'print', 'png', 'html', 'md', 'txt', 'docx'];

function validDoc(d: unknown): d is Doc {
  const x = d as Doc;
  return !!x && typeof x === 'object' && Array.isArray(x.pages) && x.pages.length > 0 && !!TYPES[x.type] && x.pages.every((p) => p && Array.isArray(p.blocks));
}

function findBlock(d: Doc, id: string) {
  for (let i = 0; i < d.pages.length; i++) {
    const j = d.pages[i].blocks.findIndex((b) => b.id === id);
    if (j >= 0) return { pi: i, bi: j, b: d.pages[i].blocks[j] };
  }
  return null;
}

/** Measures which fixed-size pages overflow their body (last block's bottom past the body height). */
function measureOverflow(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  document.querySelectorAll<HTMLElement>('[data-canvas] [data-page-body]').forEach((body) => {
    const last = (body.firstElementChild?.lastElementChild as HTMLElement | null) || null;
    if (last && last.offsetTop + last.offsetHeight > body.clientHeight + 1) out[body.getAttribute('data-pid')!] = true;
  });
  return out;
}

export function DocumentEditor() {
  const H = useHistory<Doc>(null);
  const doc = H.doc;
  const [theme, toggleTheme] = useTheme();
  const narrow = useMediaQuery('(max-width: 959px)');

  const [pi, setPi] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [zoom, setZoom] = useState<'fit' | number>('fit');
  const [vw, setVw] = useState(900);
  const [preview, setPreview] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [addAt, setAddAt] = useState<number | null>(null);
  const [resetAsk, setResetAsk] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [overflow, setOverflow] = useState<Record<string, boolean>>({});
  const [gallery, setGallery] = useState(false);
  const [saved, setSaved] = useState<Doc[] | null>(null);
  const [delAsk, setDelAsk] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exp, setExpState] = useState<{ format: ExportFormat | null; scope: 'all' | 'page' }>({ format: null, scope: 'all' });
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportMsg, setExportMsg] = useState<Msg>(null);
  const [exportDoc, setExportDoc] = useState<Doc | null>(null);
  const [prepared, setPrepared] = useState<OutFile[] | null>(null);
  const shareable = useMemo(() => canShareFiles(), []);

  const vpRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const leftRef = useRef<HTMLElement>(null);
  const rightRef = useRef<HTMLElement>(null);
  const scrollLock = useRef(0);

  useVisualViewport(rootRef, !!doc);

  const curPi = doc ? Math.min(pi, doc.pages.length - 1) : 0;
  const S = useRef({ doc, pi: curPi, sel, narrow });
  S.current = { doc, pi: curPi, sel, narrow };

  /* ---------- persistence + deep links ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      let d: Doc | undefined;
      try {
        const cur = await store.getCurrent();
        d = (cur && (await store.get(cur))) || (await store.list())[0];
      } catch { /* storage unavailable */ }
      if (!alive) return;
      const h = decodeURIComponent(location.hash.slice(1)), m = /^type=([\w-]+)/.exec(h);
      let open = !d;
      if (m && TYPES[m[1] as DocType]) { d = newDocument(m[1] as DocType); open = false; history.replaceState(null, '', location.pathname + location.search); }
      else if (/^new/.test(h)) { open = true; history.replaceState(null, '', location.pathname + location.search); }
      H.replace(d && validDoc(d) ? d : newDocument('book'), { reset: true });
      if (open) { setGallery(true); store.list().then(setSaved).catch(() => setSaved([])); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!doc) return;
    const onHash = () => {
      const h = decodeURIComponent(location.hash.slice(1)), m = /^type=([\w-]+)/.exec(h);
      if (m && TYPES[m[1] as DocType]) { H.replace(newDocument(m[1] as DocType), { reset: true }); setPi(0); setSel(null); setZoom('fit'); setOverflow({}); history.replaceState(null, '', location.pathname); }
      else if (/^new/.test(h)) { openGallery(); history.replaceState(null, '', location.pathname); }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [doc === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(async () => {
      try { await store.put(doc); await store.setCurrent(doc.id); setNotice((n) => (n && n.storage ? null : n)); }
      catch (e) { if (e instanceof StorageFullError) setNotice({ storage: true, tone: 'attention', text: 'Browser storage is full, so this version is not saved. Use Export → Save document file to keep it.' }); }
    }, 300);
    return () => clearTimeout(t);
  }, [doc]);

  const refreshSaved = useCallback(async () => { try { setSaved(await store.list()); } catch { setSaved([]); } }, []);
  const openGallery = () => { setGallery(true); setDelAsk(null); refreshSaved(); };

  /* ---------- history ---------- */
  const stamp = (d: Doc) => { d.updated = Date.now(); };
  const commit = useCallback((fn: (d: Doc) => void, tag?: string | null) => H.commit(fn, tag, stamp), [H]);
  const updBlock = useCallback((id: string, fn: (b: Block) => void, tag?: string) => {
    commit((d) => { const f = findBlock(d, id); if (f) fn(f.b); }, tag ? tag + id : null);
  }, [commit]);
  const undo = useCallback(() => { H.undo(); }, [H]);
  const redo = useCallback(() => { H.redo(); }, [H]);

  /* ---------- viewport + zoom ---------- */
  useEffect(() => {
    const n = vpRef.current;
    if (!n) return;
    const ro = new ResizeObserver(() => setVw(n.offsetWidth));
    ro.observe(n);
    setVw(n.offsetWidth);
    return () => ro.disconnect();
  }, [doc === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = doc ? SIZES[doc.size] || SIZES.a4 : SIZES.a4;
  const scale = zoom === 'fit' ? Math.max(0.1, Math.min(1, (vw - (narrow ? 32 : 64)) / size.w)) : zoom;

  /** Phones: open the editing panel and focus the selected block's first field. */
  const openBlockEditor = () => {
    setSheet('edit');
    setTimeout(() => { const r = rightRef.current; (r?.querySelector<HTMLElement>('textarea') || r?.querySelector<HTMLElement>('select, input'))?.focus({ preventScroll: false }); }, 80);
  };

  const scrollToPage = useCallback((i: number, bid?: string) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const vp = vpRef.current, el = bid ? vp?.querySelector<HTMLElement>('[data-bid="' + bid + '"]') : pageEls.current[i];
      if (!vp || !el) return;
      const vr = vp.getBoundingClientRect(), er = el.getBoundingClientRect();
      const top = vp.scrollTop + (er.top - vr.top) - (er.height < vp.clientHeight ? (vp.clientHeight - er.height) / 2 : 16);
      const left = vp.scrollLeft + (er.left - vr.left) - Math.max(16, (vp.clientWidth - er.width) / 2);
      scrollLock.current = Date.now();
      vp.scrollTo({ top: Math.max(0, top), left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }));
  }, []);

  const selectPage = useCallback((i: number, scroll = true) => {
    setPi(i); setSel(null); setResetAsk(false);
    if (scroll) scrollToPage(i);
  }, [scrollToPage]);

  /* ---------- overflow: measure after every layout-affecting change ---------- */
  const checkOverflow = useCallback(() => {
    const out = measureOverflow();
    setOverflow((prev) => {
      const a = Object.keys(out).sort().join(','), b = Object.keys(prev).sort().join(',');
      return a === b ? prev : out;
    });
    return out;
  }, []);
  useLayoutEffect(() => {
    if (!doc) return;
    const r = requestAnimationFrame(() => checkOverflow());
    return () => cancelAnimationFrame(r);
  }, [doc, scale, vw, preview, checkOverflow]);
  useEffect(() => {
    if (!doc || !document.fonts) return;
    let alive = true;
    document.fonts.ready.then(() => { if (alive) checkOverflow(); });
    return () => { alive = false; };
  }, [doc === null, checkOverflow]); // eslint-disable-line react-hooks/exhaustive-deps

  const splitPage = useCallback((pid: string, silent?: boolean) => {
    const body = document.querySelector<HTMLElement>('[data-canvas] [data-page-body][data-pid="' + pid + '"]');
    if (!body || !body.firstElementChild) return false;
    const kids = [...body.firstElementChild.children] as HTMLElement[];
    const lim = body.clientHeight;
    const k = kids.findIndex((c) => c.offsetTop + c.offsetHeight > lim);
    if (k < 0) return false;
    if (k === 0) {
      if (!silent) setNotice({ tone: 'attention', text: 'The first block on this page is taller than the page. Shorten it, reduce its size or split it into two blocks.' });
      return false;
    }
    commit((d) => {
      const i = d.pages.findIndex((p) => p.id === pid);
      const p = d.pages[i];
      const moved = p.blocks.splice(k);
      d.pages.splice(i + 1, 0, { id: uid(), kind: 'continued', name: p.name.replace(/( · continued)?$/, ' · continued'), bg: p.bg, valign: 'top', number: p.number, header: p.header, blocks: moved });
    });
    return true;
  }, [commit]);

  const fixAll = useCallback(async () => {
    for (let n = 0; n < 40; n++) {
      await frames(3);
      const ov = checkOverflow();
      await frames(1);
      const ids = Object.keys(ov);
      if (!ids.length) break;
      const first = S.current.doc!.pages.map((p) => p.id).find((id) => ids.includes(id));
      if (!first || !splitPage(first, true)) {
        setNotice({ tone: 'attention', text: 'Some pages still overflow because a single block is taller than the page. Shorten those blocks.' });
        break;
      }
    }
  }, [checkOverflow, splitPage]);

  /* ---------- page + block operations ---------- */
  const movePage = useCallback((i: number, j: number) => {
    const d = S.current.doc;
    if (!d || j < 0 || j >= d.pages.length || i === j) return;
    commit((dd) => { const [p] = dd.pages.splice(i, 1); dd.pages.splice(j, 0, p); });
    selectPage(j);
  }, [commit, selectPage]);
  const dupPage = (i: number) => {
    commit((d) => { const p = JSON.parse(JSON.stringify(d.pages[i])); p.id = uid(); p.name += ' copy'; p.blocks.forEach((b: Block) => { b.id = uid(); }); d.pages.splice(i + 1, 0, p); });
    selectPage(i + 1);
  };
  const delPage = (i: number) => {
    const d = S.current.doc;
    if (!d || d.pages.length < 2) return;
    commit((dd) => { dd.pages.splice(i, 1); });
    selectPage(Math.max(0, Math.min(i, d.pages.length - 2)));
  };
  const insertPage = (at: number, kind: string) => {
    const d = S.current.doc;
    if (!d) return;
    const p = makePage(d.type, kind);
    commit((dd) => { dd.pages.splice(at, 0, p); });
    setAddAt(null);
    selectPage(at);
  };

  const addBlock = (t: BlockType) => {
    const { pi: p, sel: s } = S.current;
    const b = BLOCKS[t][2]();
    commit((d) => { const blocks = d.pages[p].blocks; const j = s ? blocks.findIndex((x) => x.id === s) : -1; blocks.splice(j >= 0 ? j + 1 : blocks.length, 0, b); });
    setSel(b.id);
    if (S.current.narrow) setSheet('edit');
    scrollToPage(p, b.id);
    if (t === 'image') setTimeout(() => fileRef.current?.click(), 60);
  };
  const delBlock = useCallback((id: string) => { commit((d) => { const f = findBlock(d, id); if (f) d.pages[f.pi].blocks.splice(f.bi, 1); }); setSel(null); }, [commit]);
  const dupBlock = (id: string) => {
    const nid = uid();
    commit((d) => { const f = findBlock(d, id); if (!f) return; const c: Block = JSON.parse(JSON.stringify(f.b)); c.id = nid; d.pages[f.pi].blocks.splice(f.bi + 1, 0, c); });
    setSel(nid);
  };
  const moveBlock = (id: string, dir: 1 | -1) => commit((d) => {
    const f = findBlock(d, id); if (!f) return;
    const bl = d.pages[f.pi].blocks, j = f.bi + dir;
    if (j < 0 || j >= bl.length) return;
    [bl[f.bi], bl[j]] = [bl[j], bl[f.bi]];
  });
  const moveBlockPage = (id: string, dir: 1 | -1) => {
    const d0 = S.current.doc!;
    const f0 = findBlock(d0, id);
    if (!f0) return;
    const np = f0.pi + dir;
    if (np < 0 || np >= d0.pages.length) return;
    commit((d) => { const f = findBlock(d, id)!; const [b] = d.pages[f.pi].blocks.splice(f.bi, 1); if (dir > 0) d.pages[np].blocks.unshift(b); else d.pages[np].blocks.push(b); });
    setPi(np);
    scrollToPage(np, id);
  };

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      if (mod && k === 'z' && !typing) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && k === 'y' && !typing) { e.preventDefault(); redo(); return; }
      if (typing || document.querySelector('[role="dialog"]')) return;
      if (e.key === 'Escape') { setSel(null); setSheet(null); return; }
      if (S.current.sel && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); delBlock(S.current.sel); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [undo, redo, delBlock]);

  /* ---------- canvas interaction ---------- */
  const ix = useMemo(() => ({
    select: (id: string, p: number) => { setSel(id); setPi(p); },
    reselect: () => { if (S.current.narrow) openBlockEditor(); },
    commitField: (id: string, field: keyof Block, value: string) => updBlock(id, (x) => { (x as unknown as Record<string, unknown>)[field] = value; }),
    pageClick: (p: number) => { if (S.current.sel || S.current.pi !== p) { setSel(null); setPi(p); } },
  }), [updBlock]);

  const scrollRaf = useRef(0);
  const onViewportScroll = () => {
    if (Date.now() - scrollLock.current < 700 || scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = 0;
      const vp = vpRef.current, d = S.current.doc;
      if (!vp || !d || S.current.sel) return;
      const c = vp.getBoundingClientRect(), mid = c.top + c.height / 2;
      let best = S.current.pi, bd = 1e9;
      pageEls.current.forEach((n, k) => {
        if (!n || k >= d.pages.length) return;
        const r = n.getBoundingClientRect();
        const dd = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (dd < bd) { bd = dd; best = k; }
      });
      if (best !== S.current.pi) setPi(best);
    });
  };

  /* ---------- images / files ---------- */
  const onImageFile = (f: File | undefined) => {
    const id = S.current.sel;
    if (!f || !id) return;
    if (!f.type.startsWith('image/')) { setNotice({ tone: 'attention', text: 'Choose an image file (PNG, JPEG, SVG, WebP or GIF).' }); return; }
    if (f.size > 8e6) { setNotice({ tone: 'attention', text: 'That image is over 8 MB. Use a smaller file so the document can be saved in this browser.' }); return; }
    const fr = new FileReader();
    fr.onload = () => updBlock(id, (x) => { if (x.t === 'image') x.src = fr.result as string; });
    fr.readAsDataURL(f);
  };
  const importJSON = (f: File) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result as string);
        if (!validDoc(d)) throw new Error('bad');
        d.id = 'doc' + Date.now().toString(36); d.updated = Date.now();
        H.replace(d, { reset: true });
        setPi(0); setSel(null); setExportOpen(false); setZoom('fit'); setOverflow({});
        setNotice({ tone: 'success', text: 'Opened "' + d.title + '".' });
      } catch {
        setExportMsg({ tone: 'error', text: 'That file is not a Hali document file. Choose a .hali-doc.json file saved from this editor.' });
      }
    };
    fr.readAsText(f);
  };

  /* ---------- export ---------- */
  const T = doc ? TYPES[doc.type] : TYPES.book;
  const fmt: ExportFormat = exp.format && T.exports.includes(exp.format) ? exp.format : T.exports[0];
  const pageScoped = PAGE_SCOPED.includes(fmt);
  const scope = pageScoped ? exp.scope : 'all';
  const setExp = (p: Partial<typeof exp>) => { setExpState((e) => ({ ...e, ...p })); setExportMsg(null); setExportDone(false); setPrepared(null); };

  const runExport = async (mode: 'download' | 'share' = 'download') => {
    const full = S.current.doc;
    if (!full) return;
    if (mode === 'share' && prepared) {
      const r = await shareFiles(prepared, full.title);
      if (r === 'shared') { setPrepared(null); setExportMsg({ tone: 'success', text: 'Shared ' + prepared.map((f) => f.name).join(', ') + '.' }); }
      return;
    }
    const p0 = S.current.pi;
    const d = scope === 'page' ? { ...full, pages: [full.pages[p0]] } : full;
    const sz = SIZES[d.size];
    const base = slug(d.title) + (scope === 'page' ? '-p' + String(p0 + 1).padStart(2, '0') : '');
    const scale = rasterScale(d.pages.length);
    // iOS prints the parent page from an iframe: open the print tab now, while the tap still counts.
    const printWin = fmt === 'print' && isIOS() ? window.open('', '_blank') : null;
    setExporting(true); setExportDone(false); setExportMsg(null); setPrepared(null);
    const progress = (a: number, b: number) => setExportMsg({ tone: 'info', text: 'Rendering page ' + a + ' of ' + b + '…' });
    try {
      let blob: Blob | undefined, name = '', extra = '';
      let pngs: OutFile[] | null = null;
      const nodes = async () => {
        setExportDoc(d);
        await frames(3);
        if (document.fonts) await document.fonts.ready;
        await Promise.all([...document.querySelectorAll<HTMLImageElement>('[data-xhost] img')].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
        return [...document.querySelectorAll<HTMLElement>('[data-xhost] [data-xpage]')];
      };
      if (fmt === 'md') { blob = new Blob([markdown(d)], { type: 'text/markdown' }); name = base + '.md'; }
      else if (fmt === 'txt') { blob = new Blob([plain(d)], { type: 'text/plain' }); name = base + '.txt'; }
      else if (fmt === 'docx') { blob = await docx(d, sz.h ? sz : SIZES.a4); name = base + '.docx'; }
      else if (fmt === 'html') { const n = await nodes(); blob = new Blob([await htmlFile(d, n, false)], { type: 'text/html' }); name = base + '.html'; }
      else if (fmt === 'print') {
        const n = await nodes();
        await printNodes(d, n, printWin);
        setExporting(false); setExportDoc(null);
        setExportMsg({ tone: 'success', text: printWin ? 'The pages opened in a new tab with the print dialog. To save a PDF on iPhone, pinch out on the preview, then share or save it.' : 'The print dialog opened. Choose "Save as PDF" as the destination for a PDF with selectable text.' });
        return;
      } else if (fmt === 'pdf') { const n = await nodes(); blob = await pdf(d, n, progress, scale); name = base + '.pdf'; }
      else if (fmt === 'pptx') { const n = await nodes(); blob = await pptx(d, n, progress, scale); name = base + '.pptx'; }
      else if (fmt === 'epub') {
        const n = await nodes();
        const cover = await capture(n[0], { format: 'png', scale, w: n[0].offsetWidth, h: n[0].offsetHeight });
        blob = await epub(d, cover); name = base + '.epub';
      } else if (fmt === 'png') {
        const n = await nodes();
        const files: OutFile[] = [];
        for (let i = 0; i < n.length; i++) {
          progress(i + 1, n.length);
          files.push({ name: base + '-p' + String((scope === 'page' ? p0 : i) + 1).padStart(2, '0') + '.png', blob: await capture(n[i], { format: 'png', scale, w: n[i].offsetWidth, h: n[i].offsetHeight }) });
        }
        if (mode === 'share') pngs = files;
        if (files.length === 1) { blob = files[0].blob; name = files[0].name; }
        else { blob = await zip(files); name = base + '-pages.zip'; extra = ' (' + files.length + ' pages)'; }
      }
      if (!blob || !blob.size) throw new Error('The file came out empty.');
      if (mode === 'share') {
        setExportDoc(null);
        const set = pngs ? await shareSet(pngs, name) : [{ name, blob }];
        setExporting(false);
        const r = await shareFiles(set, d.title);
        if (r === 'shared') setExportMsg({ tone: 'success', text: 'Shared ' + (set.length === 1 ? set[0].name : set.length + ' files') + '.' });
        else if (r === 'blocked') { setPrepared(set); setExportMsg({ tone: 'success', text: (set.length === 1 ? set[0].name : set.length + ' files') + ' ready. Tap Share now to open the share sheet.' }); }
        return;
      }
      download(blob, name);
      setExporting(false); setExportDone(true); setExportDoc(null);
      setExportMsg({ tone: 'success', text: 'Downloaded ' + name + extra + '.' });
      setTimeout(() => setExportDone(false), 2400);
    } catch (err) {
      setExporting(false); setExportDoc(null);
      setExportMsg({ tone: 'error', text: 'Export failed: ' + ((err as Error)?.message || err) + ' Try again, or choose another format.' });
    }
  };

  if (!doc) {
    return <div className="ed" aria-busy="true"><div className="ed-head"><Logo variant="symbol" height={28} /><span className="ed-head-tag">Loading documents…</span></div></div>;
  }

  /* ---------- derived ---------- */
  const found = sel ? findBlock(doc, sel) : null;
  const kinds = KIND_NAMES(doc.type);
  const kindName = (k: string) => (kinds.find((x) => x.id === k) || { name: k === 'continued' ? 'Continued' : k }).name;
  const word = size.type === 'slide' ? 'Slides' : size.h ? 'Pages' : 'Sections';
  const extn = ({ pdf: '.pdf', print: ' (print dialog)', docx: '.docx', pptx: '.pptx', epub: '.epub', html: '.html', md: '.md', txt: '.txt', png: scope === 'page' || doc.pages.length === 1 ? '.png' : '-pages.zip' } as Record<ExportFormat, string>)[fmt];
  const fileBase = slug(doc.title) + (scope === 'page' ? '-p' + String(curPi + 1).padStart(2, '0') : '');
  const exportNote = fmt === 'docx' && !size.h ? 'Web and email layouts are exported onto A4 pages.' : fmt === 'pptx' ? 'Text uses Geist; install Geist (free) for an exact match in PowerPoint.' : fmt === 'epub' ? 'EPUB reflows text for e-readers, so fixed page layout and page numbers are replaced by the reader\'s own.' : fmt === 'md' || fmt === 'txt' ? 'Layout and colour are not kept in text formats; structure and order are.' : 'Uses the current edited content.';
  const rasterFmt = fmt === 'pdf' || fmt === 'png' || fmt === 'epub' || fmt === 'pptx';
  const lowScale = rasterFmt && rasterScale(scope === 'page' ? 1 : doc.pages.length) < 2;
  const fullNote = exportNote
    + (lowScale ? ' Pages are captured at 1.5× on this device to keep the export reliable.' : '')
    + (fmt === 'print' && isIOS() ? ' On iPhone and iPad the pages open in a new tab with the print dialog.' : '');

  const api: DocPropsApi = {
    updBlock, moveBlock, moveBlockPage, dupBlock, delBlock,
    deselect: () => setSel(null),
    pickImage: () => fileRef.current?.click(),
    addBlock,
    commit: (fn, tag) => commit(fn, tag),
    setSize: (s: SizeId) => { commit((d) => { d.size = s; }); setZoom('fit'); },
    resetAsk, setResetAsk,
    doReset: () => {
      const n = newDocument(doc.type);
      H.replace({ ...n, id: doc.id, title: doc.title, author: doc.author, size: doc.size }, { record: true });
      setResetAsk(false); setSel(null); setPi(0);
      scrollToPage(0);
    },
  };

  const showActions = narrow && !!found && !preview && !sheet;
  const togglePreview = () => { setPreview(!preview); setSel(null); setSheet(null); };
  const openExport = () => { setExportOpen(true); setExportMsg(null); setExportDone(false); };

  return (
    <div ref={rootRef} className="ed" data-preview={preview || undefined} data-actionbar={showActions || undefined}>
      <header className="ed-head">
        <Link href="/" className="ed-home" aria-label="Brand Studio home" title="Brand Studio home"><Logo variant="symbol" height={28} /></Link>
        <input className="ed-name" aria-label="Document title" value={doc.title} onChange={(e) => { const v = e.target.value; commit((d) => { d.title = v; }, 'title'); }} />
        <span className="ed-head-tag ed-hide-xs" style={{ display: narrow ? 'none' : undefined }}>{T.name}</span>
        <div className="ed-spacer" />
        <Button variant="secondary" size="sm" iconStart="files" className="ed-only-wide" onClick={openGallery}>Documents</Button>
        <IconButton icon="files" label="Documents" size="sm" className="ed-only-narrow ed-hide-xxs" onClick={openGallery} />
        <IconButton icon="undo-2" label="Undo" size="sm" disabled={!H.canUndo} onClick={undo} />
        <IconButton icon="redo-2" label="Redo" size="sm" disabled={!H.canRedo} onClick={redo} />
        <IconButton icon={preview ? 'pencil' : 'eye'} label={preview ? 'Exit preview' : 'Preview'} size="sm" pressed={preview} className="ed-only-wide" onClick={togglePreview} />
        <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label="Switch light or dark theme" size="sm" className="ed-only-wide" onClick={toggleTheme} />
        <span className="ed-only-narrow">
          <Menu
            label="More"
            items={[
              { label: preview ? 'Exit preview' : 'Preview', icon: preview ? 'pencil' : 'eye', onSelect: togglePreview },
              { label: theme === 'dark' ? 'Light theme' : 'Dark theme', icon: theme === 'dark' ? 'sun' : 'moon', onSelect: toggleTheme },
              { label: 'Documents', icon: 'files', onSelect: openGallery },
              { label: 'Rename document', icon: 'pencil-line', onSelect: () => { const n = rootRef.current?.querySelector<HTMLInputElement>('.ed-name'); n?.focus(); n?.select(); } },
            ]}
            trigger={({ open, toggle }) => <IconButton icon="ellipsis-vertical" label="More" size="sm" pressed={open} onClick={toggle} />}
          />
        </span>
        <Button variant="primary" size="sm" iconStart="download" className="ed-only-wide" onClick={openExport}>Export</Button>
        <IconButton icon="download" label="Export" size="sm" variant="secondary" className="ed-only-narrow" onClick={openExport} />
      </header>

      {notice && <div className="ed-notice"><Alert tone={notice.tone} onDismiss={() => setNotice(null)}>{notice.text}</Alert></div>}

      <div className="ed-body">
        <aside ref={leftRef} aria-label="Pages" className="ed-panel ed-left" data-open={sheet === 'pages' || undefined}>
          <SheetHandle sheetRef={leftRef} onClose={() => setSheet(null)} />
          <DocNavigator
            doc={doc} pi={curPi} word={word} addAt={addAt} kinds={kinds} kindName={kindName} overflow={overflow} typeName={T.name}
            onSelect={(i) => { selectPage(i); if (narrow) setSheet(null); }}
            onMove={movePage} onDup={dupPage} onDel={delPage} setAddAt={setAddAt} onInsert={insertPage}
            onFixAll={() => { fixAll(); if (narrow) setSheet(null); }}
          />
        </aside>

        <main className="ed-main">
          <div className="ed-toolbar">
            <span className="ed-size">{size.name + (size.h ? '' : ' · height grows with content')}</span>
            <div style={{ flex: 1 }} />
            <IconButton icon="zoom-out" label="Zoom out" size="sm" onClick={() => setZoom(Math.max(0.1, scale / 1.2))} />
            <button type="button" className="ed-zoom" title="Fit width" onClick={() => { setZoom('fit'); scrollToPage(curPi); }}>{Math.round(scale * 100)}%</button>
            <IconButton icon="zoom-in" label="Zoom in" size="sm" onClick={() => setZoom(Math.min(2, scale * 1.2))} />
          </div>
          <div ref={vpRef} className="ed-vp" data-canvas="1" onScroll={onViewportScroll}>
            <div className="ed-vp-inner" style={{ gap: 32, alignItems: 'center' }}>
              {doc.pages.map((p, i) => {
                const ov = !!overflow[p.id] && !preview;
                const pageIx: DocInteractive | undefined = preview ? undefined : { ...ix, sel: i === found?.pi ? sel : null, overflow: ov, inline: !narrow || scale >= 0.6 };
                return (
                  <div key={p.id} ref={(n) => { pageEls.current[i] = n; }} className="dc-pagewrap">
                    <div className="dc-pagehead">
                      <button type="button" className="ed-page-label" aria-current={i === curPi} onClick={() => { if (curPi !== i) setPi(i); }}>{String(i + 1).padStart(2, '0')} · {p.name}</button>
                      {ov && <button type="button" className="dc-split" onClick={() => splitPage(p.id)}><Icon name="triangle-alert" size={12} />Content overflows · move to next page</button>}
                    </div>
                    <div className="dc-frame" data-active={i === curPi && !preview ? '' : undefined}>
                      <DocPageView doc={doc} p={p} i={i} scale={scale} ix={pageIx} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <aside ref={rightRef} aria-label="Properties" className="ed-panel ed-right" data-open={sheet === 'edit' || undefined}>
          <SheetHandle sheetRef={rightRef} onClose={() => setSheet(null)} />
          <div className="ed-scroll">
            <DocProperties doc={doc} pi={curPi} sel={found} kindName={kindName} api={api} />
          </div>
        </aside>
      </div>

      {showActions && found && (
        <MobileActionBar
          label="Selected block"
          items={[
            { icon: 'pencil-line', label: 'Edit', onClick: openBlockEditor, primary: true },
            { icon: 'arrow-up', label: 'Up', onClick: () => moveBlock(found.b.id, -1), disabled: found.bi === 0 },
            { icon: 'arrow-down', label: 'Down', onClick: () => moveBlock(found.b.id, 1), disabled: found.bi === doc.pages[found.pi].blocks.length - 1 },
            { icon: 'copy-plus', label: 'Duplicate', onClick: () => dupBlock(found.b.id) },
            { icon: 'trash-2', label: 'Delete', onClick: () => delBlock(found.b.id) },
            { icon: 'check', label: 'Done', onClick: () => setSel(null) },
          ]}
        />
      )}

      <nav aria-label="Editor panels" className="ed-tabbar">
        {([['pages', word, 'layers'], ['canvas', 'Canvas', 'file'], ['edit', found ? 'Edit' : 'Page', 'sliders-horizontal']] as const).map(([id, label, icon]) => {
          const on = (sheet || 'canvas') === id;
          return (
            <button key={id} type="button" className="ed-tab" aria-pressed={on} onClick={() => setSheet(id === 'canvas' || sheet === id ? null : id)}>
              <Icon name={icon} size={18} />{label}
            </button>
          );
        })}
      </nav>

      {gallery && (
        <Dialog label="Documents" title="Documents" onClose={() => setGallery(false)} maxWidth={980} height="min(780px, 100%)">
          <div className="ed-dialog-body" style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24, background: 'var(--surface-page)' }}>
            <div className="ed-sec">
              <h3 className="st-h4">New document</h3>
              <div className="dc-types">
                {DOC_TYPES.map((id) => {
                  const t = TYPES[id];
                  return (
                    <button key={id} type="button" className="dc-type" onClick={() => {
                      H.replace(newDocument(id), { reset: true });
                      setGallery(false); setPi(0); setSel(null); setZoom('fit'); setOverflow({});
                      setTimeout(() => scrollToPage(0), 80);
                    }}>
                      <span className="dc-type-icon"><Icon name={t.icon} size={17} /></span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                        <span style={{ font: '500 14px/1.3 var(--font-sans)' }}>{t.name}</span>
                        <span style={{ font: '400 11px/1.3 var(--font-mono)', color: 'var(--text-tertiary)' }}>{t.start.length} starter pages · {Object.keys(t.kinds).length} page types · {t.sizes.map((z) => SIZES[z].name.split(' ·')[0]).join(', ')}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="ed-sec">
              <h3 className="st-h4">Saved in this browser</h3>
              {saved && !saved.length && <span className="st-small">No saved documents yet. Documents save automatically as you edit.</span>}
              {(saved || []).map((d) => {
                const cur = d.id === doc.id;
                return (
                  <div key={d.id} className="dc-saved">
                    <span style={{ flex: 1, minWidth: 'min(200px, 100%)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ font: '500 14px/1.3 var(--font-sans)', overflowWrap: 'anywhere' }}>{d.title}</span>
                      <span style={{ font: '400 11px/1.3 var(--font-mono)', color: 'var(--text-tertiary)' }}>{(TYPES[d.type] || { name: d.type }).name} · {d.pages.length} pages · {new Date(d.updated).toLocaleString()}</span>
                    </span>
                    <div className="ed-row">
                      <Button variant="secondary" size="sm" onClick={async () => { const x = await store.get(d.id); if (!x) return; H.replace(x, { reset: true }); setGallery(false); setPi(0); setSel(null); setZoom('fit'); setOverflow({}); }}>{cur ? 'Open (current)' : 'Open'}</Button>
                      <Button variant="ghost" size="sm" onClick={async () => { const x = await store.get(d.id); if (!x) return; H.replace({ ...JSON.parse(JSON.stringify(x)), id: 'doc' + Date.now().toString(36), title: x.title + ' (copy)', updated: Date.now() }, { reset: true }); setGallery(false); setPi(0); setSel(null); }}>Duplicate</Button>
                      <Button variant={delAsk === d.id ? 'danger' : 'ghost'} size="sm" disabled={cur} onClick={async () => { if (delAsk !== d.id) { setDelAsk(d.id); return; } await store.remove(d.id); setDelAsk(null); refreshSaved(); }}>{delAsk === d.id ? 'Confirm delete' : 'Delete'}</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Dialog>
      )}

      {exportOpen && (
        <Dialog label="Export document" title={'Export ' + T.name.toLowerCase()} onClose={() => { setExportOpen(false); setPrepared(null); }} maxWidth={560} sheet>
          <div className="ed-dialog-body" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div role="radiogroup" aria-label="Format" className="ed-choices">
              {T.exports.map((id) => (
                <button key={id} type="button" role="radio" aria-checked={fmt === id} className="ed-choice dc-fmt" onClick={() => setExp({ format: id })}>
                  <span style={{ font: '600 13px/1 var(--font-mono)' }}>{FMTS[id][0]}</span>
                  <span className="ed-choice-h" style={{ fontSize: 12, lineHeight: 1.4 }}>{FMTS[id][1]}</span>
                </button>
              ))}
            </div>
            {pageScoped && doc.pages.length > 1 && (
              <div role="group" aria-label="Pages" className="ed-seg">
                <button type="button" aria-pressed={scope === 'all'} onClick={() => setExp({ scope: 'all' })}>Whole document · {doc.pages.length} {word.toLowerCase()}</button>
                <button type="button" aria-pressed={scope === 'page'} onClick={() => setExp({ scope: 'page' })}>Current page only · {curPi + 1}</button>
              </div>
            )}
            <div className="ed-file">
              <span className="ed-over" style={{ fontSize: 11 }}>File</span>
              <span className="ed-file-name">{fileBase + extn}</span>
              <span className="ed-hint" style={{ lineHeight: 1.45 }}>{fullNote}</span>
            </div>
            {exportMsg && <Alert tone={exportMsg.tone}>{exportMsg.text}</Alert>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="ed-row" style={{ gap: 12 }}>
                <button type="button" className="ed-link" style={{ border: 0, background: 'transparent', padding: 0 }} onClick={() => download(new Blob([JSON.stringify(doc, null, 1)], { type: 'application/json' }), slug(doc.title) + '.hali-doc.json')}>
                  <Icon name="file-down" size={16} />Save document file
                </button>
                <label className="ed-link">
                  <Icon name="file-up" size={16} />Open document file
                  <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) importJSON(f); }} />
                </label>
              </div>
            </div>
          </div>
          <div className="ed-dialog-foot">
            {shareable && fmt !== 'print' && (
              <Button variant="secondary" iconStart="share-2" disabled={exporting} onClick={() => runExport('share')}>{prepared ? 'Share now' : 'Share or save to phone'}</Button>
            )}
            <Button variant="commit" iconStart="download" loading={exporting} success={exportDone} onClick={() => runExport('download')}>{exporting ? 'Exporting…' : fmt === 'print' ? 'Open print dialog' : 'Download'}</Button>
          </div>
        </Dialog>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; onImageFile(f); }} />
      <div aria-hidden="true" className="ed-xhost">
        {exportDoc && (
          <div data-xhost="1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {exportDoc.pages.map((p, i) => <DocExportPage key={p.id + i} doc={exportDoc} p={p} i={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
