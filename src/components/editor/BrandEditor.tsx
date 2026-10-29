'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Alert, Button, IconButton, Logo, Icon } from '@/components/ds';
import { Menu } from '@/components/shell/Menu';
import { useHistory } from '@/hooks/useHistory';
import { useVisualViewport } from '@/hooks/useVisualViewport';
import { useMediaQuery, prefersReducedMotion } from '@/hooks/useMediaQuery';
import { canShareFiles, capture, download, ext, frames, shareFiles, shareSet, slug, zip, type OutFile } from '@/lib/export';
import { createDocStore, readPref, StorageFullError, writePref } from '@/lib/storage';
import { CAT, FMT, SCHEMES, buildPages, findTemplate, make, newDoc, reflow, uid, type Design, type El, type Page, type SchemeId } from '@/lib/templates';
import { useTheme } from '@/lib/theme';
import { Artwork, pageBgOf, type BoardHandlers, type HandleDir } from './Artwork';
import { ExportDialog, type ExportSettings, type ScopeOption } from './ExportDialog';
import { PagesPanel } from './PagesPanel';
import { PropertiesPanel, type PropertiesApi } from './PropertiesPanel';
import { MobileActionBar } from './MobileActionBar';
import { SheetHandle } from './shared';
import { TemplateGallery, type GalleryState } from './TemplateGallery';

type Sheet = 'pages' | 'edit' | null;
type Notice = { tone: 'success' | 'attention' | 'error'; text: string; storage?: boolean } | null;
interface Drag { mode: 'move' | 'resize'; dir?: HandleDir; pi: number; id: string; sx: number; sy: number; o: { x: number; y: number; w: number; h: number }; s: number; moved: boolean; base: Design; pointer: number; wasSelected: boolean; touch: boolean }

const store = createDocStore<Design>('hali-studio', 'hali-studio:docs', 'hali-studio:current');
const STORAGE_FULL = 'Browser storage is full, so this version is not saved. Export a design file to keep it, or delete old designs.';
const baseName = (d: Design) => d.name.replace(/ — .*$/, '');

function validDesign(d: unknown): d is Design {
  const x = d as Design;
  return !!x && typeof x === 'object' && Array.isArray(x.pages) && x.pages.length > 0 && !!x.w && !!x.h && !!CAT[x.cat]
    && x.pages.every((p) => p && Array.isArray(p.els));
}

export function BrandEditor({ snap: snapDefault = true, showSafeArea: safeDefault = true }: { snap?: boolean; showSafeArea?: boolean }) {
  const H = useHistory<Design>(null);
  const doc = H.doc;
  const [theme, toggleTheme] = useTheme();
  const narrow = useMediaQuery('(max-width: 959px)');

  const [pi, setPi] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [zoom, setZoom] = useState<'fit' | number>('fit');
  const [vpSize, setVpSize] = useState({ w: 900, h: 700 });
  const [preview, setPreview] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [addAt, setAddAt] = useState<number | null>(null);
  const [resetAsk, setResetAsk] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number } | null>(null);
  const [snap, setSnap] = useState(snapDefault);
  const [safeArea, setSafeArea] = useState(safeDefault);

  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [saved, setSaved] = useState<Design[] | null>(null);
  const [delAsk, setDelAsk] = useState<string | null>(null);

  const [exportOpen, setExportOpen] = useState(false);
  const [exp, setExpState] = useState<ExportSettings>({ format: 'png', scale: 1, quality: 92, scope: 'page' });
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [exportDoc, setExportDoc] = useState<Design | null>(null);

  const vpRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const leftRef = useRef<HTMLElement>(null);
  const rightRef = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
  const scrollLock = useRef(0);
  const pinch = useRef<{ d: number; s: number } | null>(null);

  useVisualViewport(rootRef, !!doc);

  const curPi = doc ? Math.min(pi, doc.pages.length - 1) : 0;
  const page: Page | undefined = doc?.pages[curPi];
  const el: El | null = (page && page.els.find((x) => x.id === sel)) || null;

  /* ---------- persistence ---------- */
  useEffect(() => {
    setSnap(readPref('hali-studio:snap', snapDefault));
    setSafeArea(readPref('hali-studio:safe-area', safeDefault));
  }, [snapDefault, safeDefault]);

  useEffect(() => {
    let alive = true;
    (async () => {
      let d: Design | undefined;
      try {
        const cur = await store.getCurrent();
        d = (cur && (await store.get(cur))) || (await store.list())[0];
      } catch { /* storage unavailable: start fresh */ }
      if (!alive) return;
      H.replace(d && validDesign(d) ? d : newDoc('social', 'announcement', 'sq'), { reset: true });
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(async () => {
      try {
        await store.put(doc);
        await store.setCurrent(doc.id);
        setNotice((n) => (n && n.storage ? null : n));
      } catch (e) {
        if (e instanceof StorageFullError) setNotice({ tone: 'attention', text: STORAGE_FULL, storage: true });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [doc]);

  const refreshSaved = useCallback(async () => { try { setSaved(await store.list()); } catch { setSaved([]); } }, []);

  /* ---------- history helpers ---------- */
  const stamp = (d: Design) => { d.updated = Date.now(); };
  const commit = useCallback((mut: (d: Design) => void, tag?: string | null) => H.commit(mut, tag, stamp), [H]);
  const updEl = useCallback((p: number, id: string, fn: (x: El) => void, ov: string[], tag?: string) => {
    commit((d) => {
      const x = d.pages[p]?.els.find((e) => e.id === id);
      if (!x) return;
      fn(x);
      x.ov = x.ov || {};
      ov.forEach((k) => { x.ov![k] = true; });
    }, tag);
  }, [commit]);

  const replaceDoc = useCallback((d: Design, opts: { record?: boolean; reset?: boolean }) => H.replace(d, opts), [H]);

  /* ---------- viewport / zoom ---------- */
  useEffect(() => {
    const n = vpRef.current;
    if (!n) return;
    const ro = new ResizeObserver(() => setVpSize({ w: n.offsetWidth, h: n.offsetHeight }));
    ro.observe(n);
    setVpSize({ w: n.offsetWidth, h: n.offsetHeight });
    return () => ro.disconnect();
  }, [doc === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const scale = useMemo(() => {
    if (!doc) return 1;
    if (zoom !== 'fit') return zoom;
    const s = narrow
      ? Math.min((vpSize.w - 32) / doc.w, (vpSize.h - 96) / doc.h)
      : Math.min((vpSize.w - 64) / doc.w, (vpSize.h - 96) / doc.h);
    return Math.max(0.04, Math.min(s, doc.w < 700 ? 2 : 1));
  }, [doc, zoom, vpSize, narrow]);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const scrollToPage = useCallback((i: number) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const vp = vpRef.current, e = pageEls.current[i];
      if (!vp || !e) return;
      const vr = vp.getBoundingClientRect(), er = e.getBoundingClientRect();
      const top = vp.scrollTop + (er.top - vr.top) - Math.max(16, (vp.clientHeight - er.height) / 2);
      const left = vp.scrollLeft + (er.left - vr.left) - Math.max(16, (vp.clientWidth - er.width) / 2);
      scrollLock.current = Date.now();
      vp.scrollTo({ top: Math.max(0, top), left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }));
  }, []);

  const selectPage = useCallback((i: number, scroll = true) => {
    setPi(i); setSel(null); setEditing(null); setResetAsk(false);
    if (scroll) scrollToPage(i);
  }, [scrollToPage]);

  /* ---------- deep links ---------- */
  const createFrom = useCallback((cat: string, tpl: string, fmt: string) => {
    replaceDoc(newDoc(cat, tpl, fmt), { reset: true });
    setGallery(null); setPi(0); setSel(null); setEditing(null); setZoom('fit'); setSheet(null);
    setTimeout(() => scrollToPage(0), 60);
  }, [replaceDoc, scrollToPage]);

  useEffect(() => {
    if (!doc) return;
    const read = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      const m = /^t=([\w-]+)\/([\w-]+)(?:\/([\w-]+))?/.exec(h), g = /^new(?:=([\w-]+))?/.exec(h);
      if (m && CAT[m[1]]) {
        createFrom(m[1], m[2], m[3] && FMT[m[3]] && CAT[m[1]].formats.includes(m[3]) ? m[3] : CAT[m[1]].formats[0]);
        history.replaceState(null, '', location.pathname + location.search);
      } else if (g) {
        setGallery({ tab: 'templates', cat: g[1] && CAT[g[1]] ? g[1] : 'social', fmt: null });
        history.replaceState(null, '', location.pathname + location.search);
      }
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [doc === null]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- element operations ---------- */
  const S = useRef({ doc, pi: curPi, sel, editing, preview, snap, narrow });
  S.current = { doc, pi: curPi, sel, editing, preview, snap, narrow };

  const updSel = useCallback((fn: (x: El) => void, ov: string[], tag?: string) => {
    const { pi: p, sel: id } = S.current;
    if (id) updEl(p, id, fn, ov, tag ? tag + id : undefined);
  }, [updEl]);

  const deleteSel = useCallback(() => {
    const { pi: p, sel: id } = S.current;
    if (!id) return;
    commit((d) => { d.pages[p].els = d.pages[p].els.filter((e) => e.id !== id); });
    setSel(null); setEditing(null);
  }, [commit]);

  const dupSel = useCallback(() => {
    const { doc: d0, pi: p, sel: id } = S.current;
    const src = d0?.pages[p].els.find((e) => e.id === id);
    if (!src) return;
    const n: El = JSON.parse(JSON.stringify(src));
    n.id = uid(); n.role = 'custom-' + n.id; n.custom = true; n.x += 24; n.y += 24;
    commit((d) => { const els = d.pages[p].els; els.splice(els.findIndex((e) => e.id === src.id) + 1, 0, n); });
    setSel(n.id);
  }, [commit]);

  const layer = useCallback((dir: 1 | -1) => {
    const { pi: p, sel: id } = S.current;
    commit((d) => {
      const els = d.pages[p].els, i = els.findIndex((e) => e.id === id), j = i + dir;
      if (i < 0 || j < 0 || j >= els.length) return;
      [els[i], els[j]] = [els[j], els[i]];
    });
  }, [commit]);

  const addEl = useCallback((kind: string) => {
    const d = S.current.doc;
    if (!d) return;
    const c = SCHEMES[d.scheme] || SCHEMES.paper, W = d.w, Hh = d.h, u = Math.min(W, Hh * 1.6) / 1080, M = make;
    let e: El;
    if (kind === 'heading') e = M.T('h', W * 0.1, Hh * 0.4, W * 0.8, 120 * u, 'New heading', { size: Math.round(72 * u), weight: 600, ls: -0.03, lh: 1.08, color: c.fg });
    else if (kind === 'text') e = M.T('t', W * 0.1, Hh * 0.45, W * 0.8, 90 * u, 'New paragraph. Edit it in the panel, or double-click (tap again on touch) on the canvas.', { size: Math.round(30 * u), lh: 1.4, color: c.muted });
    else if (kind === 'label') e = M.T('o', W * 0.1, Hh * 0.1, W * 0.5, 36 * u, 'Overline label', { font: 'mono', size: Math.round(22 * u), upper: true, ls: 0.06, color: c.muted, weight: 500 });
    else if (kind === 'button') e = M.T('b', W * 0.1, Hh * 0.7, 360 * u, 80 * u, 'Create proposal', { size: Math.round(30 * u), weight: 500, color: c.ctaFg, bg: c.ctaBg, radius: Math.round(12 * u), align: 'center', valign: 'center', lh: 1 });
    else if (kind === 'image') e = M.I('i', W * 0.25, Hh * 0.25, W * 0.5, Hh * 0.5, { hatch: c.hatch, radius: Math.round(10 * u) });
    else if (kind === 'shape') e = M.R('s', W * 0.3, Hh * 0.3, W * 0.4, Hh * 0.2, { bg: c.accent, radius: Math.round(10 * u) });
    else if (kind === 'line') e = M.L('l', W * 0.1, Hh * 0.5, W * 0.4, { color: c.accent, dash: 'dashed', thick: Math.max(2, Math.round(4 * u)) });
    else e = M.G('g', W * 0.1, Hh * 0.1, Math.max(20, 56 * u), 'lockup', c.tone);
    e.role = 'custom-' + e.id; e.custom = true;
    const p = S.current.pi;
    commit((dd) => { dd.pages[p].els.push(e); });
    setSel(e.id); setEditing(null);
    if (S.current.narrow) setSheet('edit');
    if (kind === 'image') setTimeout(() => fileRef.current?.click(), 50);
  }, [commit]);

  /* ---------- page operations ---------- */
  const movePage = useCallback((i: number, j: number) => {
    const d = S.current.doc;
    if (!d || j < 0 || j >= d.pages.length || i === j) return;
    commit((dd) => { const [p] = dd.pages.splice(i, 1); dd.pages.splice(j, 0, p); });
    selectPage(j);
  }, [commit, selectPage]);

  const dupPage = useCallback((i: number) => {
    commit((d) => {
      const p: Page = JSON.parse(JSON.stringify(d.pages[i]));
      p.id = uid(); p.name = p.name + ' copy'; p.els.forEach((e) => { e.id = uid(); });
      d.pages.splice(i + 1, 0, p);
    });
    selectPage(i + 1);
  }, [commit, selectPage]);

  const delPage = useCallback((i: number) => {
    const d = S.current.doc;
    if (!d || d.pages.length < 2) return;
    commit((dd) => { dd.pages.splice(i, 1); });
    selectPage(Math.max(0, Math.min(i, d.pages.length - 2)));
  }, [commit, selectPage]);

  const insertPage = useCallback((at: number, key: string) => {
    const d0 = S.current.doc;
    if (!d0) return;
    let pg: Page;
    if (key === '__blank') {
      const c = SCHEMES[d0.scheme] || SCHEMES.paper;
      pg = { id: uid(), key: '', custom: true, name: 'Blank page', els: [make.R('background', 0, 0, d0.w, d0.h, { bg: c.bg })] };
    } else {
      const fresh = buildPages(d0.cat, d0.tpl, d0.fmt, d0.scheme, d0.vars);
      pg = fresh.find((p) => p.key === key) || fresh[0];
    }
    commit((d) => { d.pages.splice(at, 0, pg); });
    setAddAt(null);
    selectPage(at);
  }, [commit, selectPage]);

  /* ---------- canvas interaction ---------- */
  const handlers: BoardHandlers = useMemo(() => ({
    elDown(ev: RPointerEvent<HTMLElement>, p: number, e: El) {
      if (S.current.preview || pinch.current) return;
      ev.stopPropagation();
      if (S.current.editing === e.id) return;
      const wasSelected = S.current.sel === e.id && S.current.pi === p;
      setPi(p); setSel(e.id); setResetAsk(false);
      if (S.current.editing && S.current.editing !== e.id) setEditing(null);
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch { /* not capturable */ }
      drag.current = { mode: 'move', pi: p, id: e.id, sx: ev.clientX, sy: ev.clientY, o: { x: e.x, y: e.y, w: e.w, h: e.h }, s: scaleRef.current, moved: false, base: S.current.doc!, pointer: ev.pointerId, wasSelected, touch: ev.pointerType !== 'mouse' };
    },
    elDoubleClick(p: number, e: El) {
      if (S.current.preview || e.type !== 'text' || e.auto) return;
      setPi(p); setSel(e.id); setEditing(e.id);
    },
    handleDown(ev: RPointerEvent<HTMLElement>, dir: HandleDir, p: number, e: El) {
      ev.stopPropagation(); ev.preventDefault();
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch { /* not capturable */ }
      drag.current = { mode: 'resize', dir, pi: p, id: e.id, sx: ev.clientX, sy: ev.clientY, o: { x: e.x, y: e.y, w: e.w, h: e.h }, s: scaleRef.current, moved: false, base: S.current.doc!, pointer: ev.pointerId, wasSelected: true, touch: ev.pointerType !== 'mouse' };
    },
    boardDown(p: number) {
      if (S.current.pi !== p || S.current.sel) { setPi(p); setSel(null); setEditing(null); }
    },
    commitText(p: number, id: string, text: string) {
      setEditing(null);
      updEl(p, id, (x) => { x.text = text; }, ['text']);
    },
    stopEditing() { setEditing(null); },
  }), [updEl]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const dr = drag.current;
      if (!dr || e.pointerId !== dr.pointer) return;
      const dx = (e.clientX - dr.sx) / dr.s, dy = (e.clientY - dr.sy) / dr.s;
      if (!dr.moved) {
        if (Math.abs(dx) + Math.abs(dy) < (dr.touch ? 6 : 3) / dr.s) return;
        dr.moved = true;
        H.pushHist(dr.base);
      }
      const d = H.docRef.current!;
      let { x, y, w, h } = dr.o;
      let gx: number | undefined, gy: number | undefined;
      if (dr.mode === 'move') {
        x += dx; y += dy;
        if (S.current.snap) {
          const t = 8 / dr.s, W = d.w, Hh = d.h;
          if (Math.abs(x + w / 2 - W / 2) < t) { x = W / 2 - w / 2; gx = W / 2; }
          if (Math.abs(y + h / 2 - Hh / 2) < t) { y = Hh / 2 - h / 2; gy = Hh / 2; }
          if (Math.abs(x) < t) { x = 0; gx = 0; }
          if (Math.abs(y) < t) { y = 0; gy = 0; }
          if (Math.abs(x + w - W) < t) { x = W - w; gx = W; }
          if (Math.abs(y + h - Hh) < t) { y = Hh - h; gy = Hh; }
        }
      } else {
        const dir = dr.dir!;
        if (dir.includes('e')) w = Math.max(8, dr.o.w + dx);
        if (dir.includes('s')) h = Math.max(2, dr.o.h + dy);
        if (dir.includes('w')) { w = Math.max(8, dr.o.w - dx); x = dr.o.x + dr.o.w - w; }
        if (dir.includes('n')) { h = Math.max(2, dr.o.h - dy); y = dr.o.y + dr.o.h - h; }
        if (e.shiftKey && dir.length === 2) { const r = dr.o.w / dr.o.h; if (w / h > r) w = h * r; else h = w / r; if (dir.includes('w')) x = dr.o.x + dr.o.w - w; if (dir.includes('n')) y = dr.o.y + dr.o.h - h; }
      }
      setGuides(gx !== undefined || gy !== undefined ? { x: gx, y: gy } : null);
      const R = Math.round;
      H.setLive({
        ...d,
        pages: d.pages.map((p, i) => i !== dr.pi ? p : { ...p, els: p.els.map((x0) => x0.id !== dr.id ? x0 : { ...x0, x: R(x), y: R(y), w: R(w), h: R(h), ov: { ...x0.ov, geom: true } }) }),
        updated: Date.now(),
      });
    };
    const up = (e: PointerEvent) => {
      const dr = drag.current;
      if (!dr || e.pointerId !== dr.pointer) return;
      drag.current = null;
      setGuides(null);
      if (!dr.moved && dr.touch && dr.wasSelected && dr.mode === 'move') {
        const x = H.docRef.current?.pages[dr.pi]?.els.find((q) => q.id === dr.id);
        if (x && x.type === 'text' && !x.auto) setEditing(x.id);
      }
    };
    const cancel = (e: PointerEvent) => {
      const dr = drag.current;
      if (!dr || e.pointerId !== dr.pointer) return;
      drag.current = null;
      setGuides(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); };
  }, [H]);

  /* Two-finger pinch zoom on the canvas (one finger still scrolls). */
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      pinch.current = { d: dist(e.touches), s: scaleRef.current };
      drag.current = null;
    };
    const move = (e: TouchEvent) => {
      if (!pinch.current || e.touches.length !== 2) return;
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      const old = scaleRef.current;
      const next = Math.max(0.04, Math.min(4, pinch.current.s * dist(e.touches) / pinch.current.d));
      if (Math.abs(next - old) < 0.001) return;
      const k = next / old;
      setZoom(next);
      requestAnimationFrame(() => { vp.scrollLeft = (vp.scrollLeft + mx) * k - mx; vp.scrollTop = (vp.scrollTop + my) * k - my; });
    };
    const end = (e: TouchEvent) => { if (e.touches.length < 2) pinch.current = null; };
    vp.addEventListener('touchstart', start, { passive: true });
    vp.addEventListener('touchmove', move, { passive: false });
    vp.addEventListener('touchend', end);
    vp.addEventListener('touchcancel', end);
    return () => { vp.removeEventListener('touchstart', start); vp.removeEventListener('touchmove', move); vp.removeEventListener('touchend', end); vp.removeEventListener('touchcancel', end); };
  }, [doc === null]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- undo / keyboard ---------- */
  const undo = useCallback(() => { if (H.undo()) setEditing(null); }, [H]);
  const redo = useCallback(() => { if (H.redo()) setEditing(null); }, [H]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      if (mod && k === 'z' && !typing) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && k === 'y' && !typing) { e.preventDefault(); redo(); return; }
      if (typing || !S.current.doc) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === 'Escape') { setSel(null); setSheet(null); setEditing(null); return; }
      if (!S.current.sel) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSel(); }
      else if (mod && k === 'd') { e.preventDefault(); dupSel(); }
      else if (e.key === 'Enter') {
        const x = S.current.doc.pages[S.current.pi].els.find((q) => q.id === S.current.sel);
        if (x && x.type === 'text' && !x.auto) { e.preventDefault(); setEditing(x.id); }
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const s = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0, dy = e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0;
        updSel((x) => { x.x += dx; x.y += dy; }, ['geom'], 'nudge');
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [undo, redo, deleteSel, dupSel, updSel]);

  /* ---------- scroll: the page nearest the centre becomes current (selection is kept) ---------- */
  const scrollRaf = useRef(0);
  const onViewportScroll = () => {
    if (Date.now() - scrollLock.current < 700 || scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = 0;
      const vp = vpRef.current, d = S.current.doc;
      if (!vp || !d || S.current.sel || S.current.editing) return;
      const c = vp.getBoundingClientRect(), mid = c.top + c.height / 2;
      let best = S.current.pi, bd = 1e9;
      pageEls.current.forEach((n, k) => {
        if (!n || k >= d.pages.length) return;
        const r = n.getBoundingClientRect(), dd = Math.abs(r.top + r.height / 2 - mid);
        if (dd < bd) { bd = dd; best = k; }
      });
      if (best !== S.current.pi) setPi(best);
    });
  };

  /* ---------- images / import ---------- */
  const onImageFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setNotice({ tone: 'attention', text: 'Choose an image file (PNG, JPEG, SVG, WebP or GIF).' }); return; }
    if (f.size > 8e6) { setNotice({ tone: 'attention', text: 'That image is over 8 MB. Use a smaller file so the design can be saved in this browser.' }); return; }
    const fr = new FileReader();
    fr.onload = () => updSel((x) => { if (x.type === 'image') x.src = fr.result as string; }, []);
    fr.readAsDataURL(f);
  };

  const importJSON = (f: File) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result as string);
        if (!validDesign(d)) throw new Error('bad');
        d.id = 'd' + Date.now().toString(36); d.updated = Date.now();
        replaceDoc(d, { reset: true });
        setPi(0); setSel(null); setExportOpen(false); setZoom('fit');
        setNotice({ tone: 'success', text: 'Imported "' + d.name + '".' });
      } catch {
        setExportMsg({ tone: 'error', text: 'That file is not a Hali design file. Choose a .hali.json file exported from this editor.' });
      }
    };
    fr.readAsText(f);
  };

  /* ---------- saved designs ---------- */
  const openGallery = (st: GalleryState) => { setGallery(st); setDelAsk(null); if (st.tab === 'mine') refreshSaved(); };
  const openSaved = async (id: string) => {
    const d = await store.get(id);
    if (!d) return;
    replaceDoc(d, { reset: true });
    setGallery(null); setPi(0); setSel(null); setZoom('fit');
  };
  const dupSaved = async (id: string) => {
    const d = await store.get(id);
    if (!d) return;
    const n: Design = { ...JSON.parse(JSON.stringify(d)), id: 'd' + Date.now().toString(36), name: d.name + ' (copy)', updated: Date.now() };
    replaceDoc(n, { reset: true });
    setGallery(null); setPi(0); setSel(null);
  };
  const delSaved = async (id: string) => {
    if (delAsk !== id) { setDelAsk(id); return; }
    await store.remove(id);
    setDelAsk(null);
    refreshSaved();
  };

  /* ---------- export ---------- */
  const setExp = (p: Partial<ExportSettings>) => { setExpState((e) => ({ ...e, ...p })); setExportDone(false); setExportMsg(null); setPrepared(null); };
  const exportScopes: ScopeOption[] = [];
  if (doc) {
    const cat = CAT[doc.cat];
    exportScopes.push({ id: 'page', label: 'Current page', meta: '1 file' });
    if (doc.pages.length > 1) exportScopes.push({ id: 'all', label: 'All pages, in order', meta: doc.pages.length + ' files · ZIP' });
    if (cat.formats.length > 1) exportScopes.push({ id: 'sizes', label: 'Every size in ' + cat.name.toLowerCase(), meta: cat.formats.length + ' sizes · ZIP' });
    exportScopes.push({ id: 'designs', label: 'All saved designs', meta: (saved ? saved.length : '…') + ' designs · ZIP' });
  }
  const scope = exportScopes.some((o) => o.id === exp.scope) ? exp.scope : 'page';

  /** Prepared share files (the share sheet needs a fresh tap if generating took too long). */
  const [prepared, setPrepared] = useState<OutFile[] | null>(null);
  const shareable = useMemo(() => canShareFiles(), []);

  const runExport = async (mode: 'download' | 'share' = 'download') => {
    if (!doc) return;
    if (mode === 'share' && prepared) {
      const r = await shareFiles(prepared, baseName(doc));
      if (r === 'shared') { setPrepared(null); setExportMsg({ tone: 'success', text: 'Shared ' + (prepared.length === 1 ? prepared[0].name : prepared.length + ' files') + '.' }); }
      return;
    }
    setExporting(true); setExportDone(false); setExportMsg(null); setPrepared(null);
    try {
      let jobs: { doc: Design; pages: number[] }[];
      if (scope === 'page') jobs = [{ doc, pages: [curPi] }];
      else if (scope === 'sizes') jobs = CAT[doc.cat].formats.map((f) => { const d = f === doc.fmt ? doc : reflow(doc, f, doc.scheme); return { doc: d, pages: d.pages.map((_, i) => i) }; });
      else if (scope === 'designs') {
        const all = await store.list();
        if (!all.some((d) => d.id === doc.id)) all.unshift(doc);
        jobs = all.map((d) => { const dd = d.id === doc.id ? doc : d; return { doc: dd, pages: dd.pages.map((_, i) => i) }; });
      } else jobs = [{ doc, pages: doc.pages.map((_, i) => i) }];
      const files: { name: string; blob: Blob }[] = [], used: Record<string, number> = {};
      const uniq = (n: string) => { if (!used[n]) { used[n] = 1; return n; } used[n]++; return n.replace(/(\.[a-z]+)$/, '-' + used[n] + '$1'); };
      for (const job of jobs) {
        const base = slug(baseName(job.doc)) + '-' + job.doc.w + 'x' + job.doc.h;
        if (exp.format === 'json') { files.push({ name: uniq(base + '.hali.json'), blob: new Blob([JSON.stringify(job.doc, null, 1)], { type: 'application/json' }) }); continue; }
        setExportDoc(job.doc);
        await frames(3);
        for (const i of job.pages) {
          const node = document.getElementById('xp-' + i);
          if (!node) throw new Error('Page ' + (i + 1) + ' did not render for export.');
          const blob = await capture(node, { format: exp.format, scale: exp.format === 'svg' ? 1 : exp.scale, quality: exp.quality / 100, w: job.doc.w, h: job.doc.h, bg: pageBgOf(job.doc.pages[i]) });
          if (!blob || !blob.size) throw new Error('The export produced an empty file.');
          const suffix = job.doc.pages.length > 1 ? '-p' + String(i + 1).padStart(2, '0') : '';
          files.push({ name: uniq(base + suffix + (exp.format !== 'svg' && exp.scale !== 1 ? '@' + exp.scale + 'x' : '') + '.' + ext(exp.format)), blob });
        }
      }
      if (!files.length) throw new Error('Nothing to export.');
      const zipName = slug(scope === 'designs' ? 'hali-designs' : baseName(doc)) + (scope === 'sizes' ? '-all-sizes' : '') + '.zip';
      setExportDoc(null);
      if (mode === 'share') {
        const set = await shareSet(files, zipName);
        setExporting(false);
        const r = await shareFiles(set, baseName(doc));
        if (r === 'shared') setExportMsg({ tone: 'success', text: 'Shared ' + (set.length === 1 ? set[0].name : set.length + ' files') + '.' });
        else if (r === 'blocked') { setPrepared(set); setExportMsg({ tone: 'success', text: (set.length === 1 ? set[0].name : set.length + ' files') + ' ready. Tap Share now to open the share sheet.' }); }
        return;
      }
      let name: string;
      if (files.length === 1) { name = files[0].name; download(files[0].blob, name); }
      else { name = zipName; download(await zip(files), name); }
      setExporting(false); setExportDone(true);
      setExportMsg({ tone: 'success', text: 'Downloaded ' + (files.length === 1 ? name : files.length + ' files in ' + name) + '.' });
      setTimeout(() => setExportDone(false), 2400);
    } catch (err) {
      setExporting(false); setExportDoc(null);
      setExportMsg({ tone: 'error', text: 'Export failed: ' + ((err as Error)?.message || err) + ' Try PNG at 1×.' });
    }
  };

  if (!doc || !page) {
    return <div className="ed" aria-busy="true"><div className="ed-head"><Logo variant="symbol" height={28} /><span className="ed-head-tag">Loading designs…</span></div></div>;
  }

  /* ---------- derived view values ---------- */
  const fmt = FMT[doc.fmt];
  const tpl = findTemplate(doc.cat, doc.tpl);
  const layouts = tpl.multi ? buildPages(doc.cat, doc.tpl, doc.fmt, doc.scheme, doc.vars).map((p) => ({ key: p.key, name: p.name })) : [{ key: doc.pages[0].key || 'p1', name: 'Template page' }];
  layouts.push({ key: '__blank', name: 'Blank page' });

  const base = slug(baseName(doc)) + '-' + doc.w + 'x' + doc.h;
  const extn = exp.format === 'json' ? 'hali.json' : ext(exp.format);
  const filename = scope === 'page'
    ? base + (doc.pages.length > 1 && exp.format !== 'json' ? '-p' + String(curPi + 1).padStart(2, '0') : '') + (exp.format !== 'svg' && exp.format !== 'json' && exp.scale !== 1 ? '@' + exp.scale + 'x' : '') + '.' + extn
    : scope === 'all' && exp.format === 'json' ? base + '.hali.json' : (scope === 'designs' ? 'hali-designs' : slug(baseName(doc)) + (scope === 'sizes' ? '-all-sizes' : '')) + '.zip';

  const setPageBg = (hex: string) => commit((d) => {
    const p = d.pages[curPi];
    const b = p.els.find((x) => x.role === 'background' && x.type === 'shape');
    if (b) { b.s.bg = hex; b.ov = { ...(b.ov || {}), bg: true }; } else p.bg = hex;
  }, 'pagebg' + curPi);

  const api: PropertiesApi = {
    updSel,
    updEl: (id, fn, ov, tag) => updEl(curPi, id, fn, ov, tag),
    dupSel, deleteSel, layer,
    deselect: () => { setSel(null); setEditing(null); },
    pickImage: () => fileRef.current?.click(),
    setPageBg,
    setPageName: (v) => commit((d) => { d.pages[curPi].name = v; }, 'pname' + curPi),
    onFormat: (f) => { replaceDoc(reflow(doc, f, doc.scheme), { record: true }); setSel(null); setZoom('fit'); setTimeout(() => scrollToPage(curPi), 60); },
    selectEl: (id) => { setSel(id); setEditing(null); },
    setVars: (v) => { replaceDoc(reflow({ ...doc, vars: { ...doc.vars, ...v } }, doc.fmt, doc.scheme), { record: true }); setSel(null); },
    onScheme: (id: SchemeId) => { if (doc.scheme === id) return; replaceDoc(reflow(doc, doc.fmt, id), { record: true }); setSel(null); },
    editText: (id) => { setEditing(id); if (narrow) setSheet(null); },
    resetAsk, setResetAsk,
    doReset: () => {
      const n = newDoc(doc.cat, doc.tpl, doc.fmt, doc.scheme, { vars: doc.vars });
      replaceDoc({ ...n, id: doc.id, name: doc.name }, { record: true });
      setResetAsk(false); setSel(null); setPi(0);
      setTimeout(() => scrollToPage(0), 60);
    },
  };

  const togglePreview = () => { setPreview(!preview); setSel(null); setEditing(null); setSheet(null); };
  const toggleSnap = () => { writePref('hali-studio:snap', !snap); setSnap(!snap); };
  const toggleSafe = () => { writePref('hali-studio:safe-area', !safeArea); setSafeArea(!safeArea); };
  const canSafe = !!fmt?.safe;
  /** Zooms so the selected element fills most of the viewport, then centres it. */
  const zoomToSel = () => {
    const vp = vpRef.current;
    if (!el || !vp) return;
    const s = Math.max(0.04, Math.min(4, Math.min((vp.clientWidth * 0.8) / Math.max(el.w, 8), (vp.clientHeight * 0.6) / Math.max(el.h, 8))));
    setZoom(s);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrollLock.current = Date.now();
      vp.querySelector<HTMLElement>('[data-el="' + el.id + '"]')?.scrollIntoView({ block: 'center', inline: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }));
  };
  const showActions = narrow && !!el && !preview && !sheet && !editing;
  const openTemplates = () => openGallery({ tab: 'templates', cat: doc.cat, fmt: doc.fmt });

  return (
    <div ref={rootRef} className="ed" data-preview={preview || undefined} data-actionbar={showActions || undefined}>
      <header className="ed-head">
        <Link href="/" className="ed-home" aria-label="Brand Studio home" title="Brand Studio home"><Logo variant="symbol" height={28} /></Link>
        <input ref={nameRef} className="ed-name" aria-label="Design name" enterKeyHint="done" value={doc.name} onChange={(e) => { const v = e.target.value; commit((d) => { d.name = v; }, 'name'); }} />
        <div className="ed-spacer" />
        <Button variant="secondary" size="sm" iconStart="layout-template" className="ed-only-wide" onClick={() => openGallery({ tab: 'templates', cat: doc.cat, fmt: doc.fmt })}>Templates</Button>
        <IconButton icon="layout-template" label="Templates" size="sm" className="ed-only-narrow ed-hide-xxs" onClick={openTemplates} />
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
              { label: 'Templates', icon: 'layout-template', onSelect: openTemplates },
              { label: 'My designs', icon: 'folder-open', onSelect: () => openGallery({ tab: 'mine', cat: doc.cat, fmt: doc.fmt }) },
              { label: 'Rename design', icon: 'pencil-line', onSelect: () => { nameRef.current?.focus(); nameRef.current?.select(); } },
              { label: snap ? 'Turn snapping off' : 'Turn snapping on', icon: 'magnet', onSelect: toggleSnap },
              ...(canSafe ? [{ label: safeArea ? 'Hide safe area' : 'Show safe area', icon: 'scan', onSelect: toggleSafe }] : []),
            ]}
            trigger={({ open, toggle }) => <IconButton icon="ellipsis-vertical" label="More" size="sm" pressed={open} onClick={toggle} />}
          />
        </span>
        <Button variant="primary" size="sm" iconStart="download" className="ed-only-wide" onClick={() => { setExportOpen(true); setExportMsg(null); setExportDone(false); refreshSaved(); }}>Export</Button>
        <IconButton icon="download" label="Export" size="sm" variant="secondary" className="ed-only-narrow" onClick={() => { setExportOpen(true); setExportMsg(null); setExportDone(false); refreshSaved(); }} />
      </header>

      {notice && (
        <div className="ed-notice"><Alert tone={notice.tone} onDismiss={() => setNotice(null)}>{notice.text}</Alert></div>
      )}

      <div className="ed-body">
        <aside ref={leftRef} aria-label="Pages and layers" className="ed-panel ed-left" data-open={sheet === 'pages' || undefined}>
          <SheetHandle sheetRef={leftRef} onClose={() => setSheet(null)} />
          <PagesPanel
            doc={doc} pi={curPi} sel={sel} addAt={addAt} layouts={layouts}
            onSelectPage={(i) => { selectPage(i); if (narrow) setSheet(null); }}
            onMovePage={movePage} onDupPage={dupPage} onDelPage={delPage} setAddAt={setAddAt} onInsertPage={insertPage}
            onAdd={addEl}
            onSelectEl={(id) => { setSel(id); setEditing(null); if (narrow) setSheet('edit'); }}
            onToggleHidden={(id) => updEl(curPi, id, (y) => { y.hidden = !y.hidden; }, ['hidden'])}
          />
        </aside>

        <main className="ed-main">
          <div className="ed-toolbar">
            <span className="ed-size" title={fmt.name + ' · ' + doc.w + ' × ' + doc.h + ' px'}>{fmt.name} · {doc.w} × {doc.h} px</span>
            <div style={{ flex: 1 }} />
            <IconButton icon="magnet" label={snap ? 'Turn snapping off' : 'Turn snapping on'} size="sm" pressed={snap} className="ed-hide-xxs" onClick={toggleSnap} />
            {canSafe && <IconButton icon="scan" label={safeArea ? 'Hide safe area' : 'Show safe area'} size="sm" pressed={safeArea} className="ed-hide-xxs" onClick={toggleSafe} />}
            <IconButton icon="zoom-out" label="Zoom out" size="sm" onClick={() => setZoom(Math.max(0.04, scale / 1.25))} />
            <button type="button" className="ed-zoom" title="Fit to screen" onClick={() => { setZoom('fit'); scrollToPage(curPi); }}>{Math.round(scale * 100)}%</button>
            <IconButton icon="zoom-in" label="Zoom in" size="sm" onClick={() => setZoom(Math.min(4, scale * 1.25))} />
          </div>
          <div
            ref={vpRef}
            className="ed-vp"
            onScroll={onViewportScroll}
            onPointerDown={(e) => { if (e.target === e.currentTarget || e.target === e.currentTarget.firstChild) { setSel(null); setEditing(null); } }}
          >
            <div className="ed-vp-inner">
              {doc.pages.map((p, i) => (
                <div key={p.id} ref={(n) => { pageEls.current[i] = n; }} className="ed-page">
                  <button type="button" className="ed-page-label" aria-current={i === curPi} onClick={() => selectPage(i)}>
                    Page {String(i + 1).padStart(2, '0')} · {p.name}
                  </button>
                  <div className="ed-page-frame" data-active={i === curPi && doc.pages.length > 1 && !preview ? '' : undefined}>
                    <Artwork
                      doc={doc} page={p} pi={i} scale={scale}
                      interactive={preview ? undefined : { handlers, sel: i === curPi ? sel : null, editing: i === curPi ? editing : null, showSafeArea: safeArea, guides: i === curPi ? guides : null }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside ref={rightRef} aria-label="Properties" className="ed-panel ed-right" data-open={sheet === 'edit' || undefined}>
          <SheetHandle sheetRef={rightRef} onClose={() => setSheet(null)} />
          <div className="ed-scroll">
            <PropertiesPanel doc={doc} pi={curPi} el={el} api={api} />
          </div>
        </aside>
      </div>

      {showActions && el && (
        <MobileActionBar
          label="Selected element"
          items={[
            ...(el.type === 'text' && !el.auto ? [{ icon: 'text-cursor-input', label: 'Edit text', onClick: () => { zoomToSel(); setEditing(el.id); }, primary: true }] : []),
            { icon: 'sliders-horizontal', label: 'Style', onClick: () => setSheet('edit') },
            { icon: 'scan-search', label: 'Zoom', onClick: zoomToSel },
            { icon: 'copy-plus', label: 'Duplicate', onClick: dupSel },
            { icon: 'bring-to-front', label: 'Forward', onClick: () => layer(1) },
            { icon: 'trash-2', label: 'Delete', onClick: deleteSel },
            { icon: 'check', label: 'Done', onClick: () => { setSel(null); setEditing(null); } },
          ]}
        />
      )}

      <nav aria-label="Editor panels" className="ed-tabbar">
        {([['pages', 'Pages', 'layers'], ['canvas', 'Canvas', 'frame'], ['edit', el ? 'Edit' : 'Design', 'sliders-horizontal']] as const).map(([id, label, icon]) => {
          const on = (sheet || 'canvas') === id;
          return (
            <button key={id} type="button" className="ed-tab" aria-pressed={on} onClick={() => setSheet(id === 'canvas' ? null : sheet === id ? null : id)}>
              <Icon name={icon} size={18} />{label}
            </button>
          );
        })}
      </nav>

      {gallery && (
        <TemplateGallery
          state={gallery}
          setState={(p) => { const n = { ...gallery, ...p }; setGallery(n); if (p.tab === 'mine') { setDelAsk(null); refreshSaved(); } }}
          onClose={() => setGallery(null)}
          onCreate={createFrom}
          saved={saved}
          currentId={doc.id}
          delAsk={delAsk}
          onOpen={openSaved}
          onDup={dupSaved}
          onDel={delSaved}
        />
      )}

      {exportOpen && (
        <ExportDialog
          exp={exp} setExp={setExp} scopes={exportScopes} scope={scope} w={doc.w} h={doc.h} filename={filename}
          exporting={exporting} done={exportDone} msg={exportMsg}
          cta={exporting ? 'Exporting…' : scope === 'page' || (scope === 'all' && exp.format === 'json') ? 'Download' : 'Download ZIP'}
          onRun={() => runExport('download')} onShare={shareable ? () => runExport('share') : undefined} shareReady={!!prepared}
          onImport={importJSON} onClose={() => { setExportOpen(false); setPrepared(null); }}
        />
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; onImageFile(f); }} />
      <div aria-hidden="true" className="ed-xhost">
        {exportDoc && exportDoc.pages.map((p, i) => <div key={p.id + i}><Artwork doc={exportDoc} page={p} pi={i} scale={1} nodeId={'xp-' + i} /></div>)}
      </div>
    </div>
  );
}
