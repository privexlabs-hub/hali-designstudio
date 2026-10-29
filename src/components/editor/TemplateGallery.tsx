'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, EmptyState, Tabs } from '@/components/ds';
import { CAT, CATEGORIES, FMT, newDoc, type Design } from '@/lib/templates';
import { Thumb } from './Artwork';
import { Dialog } from './shared';
import s from './gallery.module.css';

export interface GalleryState { tab: 'templates' | 'mine'; cat: string; fmt: string | null; group?: string | null }

/** Platform labels for the grouped size pills. */
const FMT_GROUP_LABEL: Record<string, string> = { Social: 'Any platform', Editorial: 'Pinterest' };

/** Renders its children only once the box is near the visible area (keeps large galleries fast). */
function Lazy({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const n = ref.current;
    if (!n || show) return;
    if (typeof IntersectionObserver === 'undefined') { setShow(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(n);
    return () => io.disconnect();
  }, [show]);
  return <span ref={ref} className={className}>{show ? children : null}</span>;
}

export function TemplateGallery({ state, setState, onClose, onCreate, saved, currentId, delAsk, onOpen, onDup, onDel }: {
  state: GalleryState;
  setState: (s: Partial<GalleryState>) => void;
  onClose: () => void;
  onCreate: (cat: string, tpl: string, fmt: string) => void;
  saved: Design[] | null;
  currentId: string;
  delAsk: string | null;
  onOpen: (id: string) => void;
  onDup: (id: string) => void;
  onDel: (id: string) => void;
}) {
  const thumbs = useRef(new Map<string, Design>());
  const catsRef = useRef<HTMLElement>(null);
  // Keep the selected category visible in the horizontal category bar on phones.
  useEffect(() => {
    catsRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [state.cat, state.tab]);
  const gCat = CAT[state.cat] || CAT.social;
  const gFmt = state.fmt && gCat.formats.includes(state.fmt) ? state.fmt : gCat.formats[0];
  const groups = [...new Set(gCat.templates.map((t) => t.group).filter(Boolean))] as string[];
  const group = state.group && groups.includes(state.group) ? state.group : null;
  const shown = group ? gCat.templates.filter((t) => t.group === group) : gCat.templates;
  // Size pills grouped by platform (consecutive formats sharing FMT.group).
  const fmtGroups: { name: string; ids: string[] }[] = [];
  gCat.formats.forEach((id) => {
    const g = FMT[id].group, last = fmtGroups[fmtGroups.length - 1];
    if (last && last.name === g) last.ids.push(id); else fmtGroups.push({ name: g, ids: [id] });
  });
  const groupedFmts = fmtGroups.length > 1 && fmtGroups.length < gCat.formats.length;
  const thumbDoc = (tplId: string) => {
    const k = gCat.id + '|' + tplId + '|' + gFmt;
    let d = thumbs.current.get(k);
    if (!d) { d = newDoc(gCat.id, tplId, gFmt); thumbs.current.set(k, d); }
    return d;
  };

  return (
    <Dialog
      label="Choose a template"
      title="Templates"
      onClose={onClose}
      maxWidth={1200}
      compactTitle
      height="min(860px, 100%)"
      actions={<div className={s.tabs}><Tabs label="Gallery" items={[{ id: 'templates', label: 'Templates' }, { id: 'mine', label: 'My designs' }]} value={state.tab} onChange={(id) => setState({ tab: id as GalleryState['tab'] })} style={{ borderBottom: 0 }} /></div>}
    >
      {state.tab === 'templates' ? (
        <div className={s.split}>
          <nav ref={catsRef} aria-label="Categories" className={s.cats}>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className={s.cat} aria-current={c.id === gCat.id} onClick={() => setState({ cat: c.id, fmt: null, group: null })}>
                <span className={s.catName}>{c.name}</span>
                <span className={s.catMeta}>{c.templates.length} templates · {c.formats.length} sizes</span>
              </button>
            ))}
          </nav>
          <div className={s.content}>
            <div className={s.fmts} role="group" aria-label="Size">
              {fmtGroups.map((g) => (
                <span key={g.name + g.ids[0]} className={s.fmtGroup}>
                  {groupedFmts && <span className={s.fmtLabel}>{FMT_GROUP_LABEL[g.name] || g.name}</span>}
                  {g.ids.map((id) => (
                    <button key={id} type="button" className={s.fmt} aria-pressed={id === gFmt} aria-label={FMT[id].name + ', ' + FMT[id].w + ' by ' + FMT[id].h} title={FMT[id].name} onClick={() => setState({ fmt: id })}>
                      {groupedFmts ? FMT[id].name.replace(/^.*? · /, '').replace(FMT[id].group + ' ', '') : FMT[id].name} · {FMT[id].w}×{FMT[id].h}
                    </button>
                  ))}
                </span>
              ))}
            </div>
            {groups.length > 0 && (
              <div className={s.fmts} role="group" aria-label="Filter templates">
                {[null, ...groups].map((g) => (
                  <button key={g || 'all'} type="button" className={s.chip} aria-pressed={g === group} onClick={() => setState({ group: g })}>
                    {g || 'All'}{' '}<span className={s.chipCount}>{g ? gCat.templates.filter((t) => t.group === g).length : gCat.templates.length}</span>
                  </button>
                ))}
              </div>
            )}
            <div className={s.grid}>
              {shown.map((t) => {
                const d = thumbDoc(t.id);
                return (
                  <button key={t.id} type="button" className={s.card} onClick={() => onCreate(gCat.id, t.id, gFmt)}>
                    <Lazy className={s.thumb}><Thumb doc={d} page={d.pages[0]} pi={0} bw={180} bh={160} /></Lazy>
                    <span className={s.name}>{t.name}</span>
                    <span className={s.meta}>{d.pages.length > 1 ? d.pages.length + ' pages · ' + d.w + '×' + d.h : d.w + '×' + d.h}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={s.content}>
          {saved && !saved.length && <EmptyState icon="layout-template" title="No saved designs yet">Designs save automatically in this browser as you edit.</EmptyState>}
          <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
            {(saved || []).map((d) => {
              const cur = d.id === currentId;
              return (
                <div key={d.id} className={s.saved} data-current={cur || undefined}>
                  <button type="button" className={s.savedThumb} onClick={() => onOpen(d.id)} aria-label={'Open ' + d.name}><Thumb doc={d} page={d.pages[0]} pi={0} bw={200} bh={140} /></button>
                  <span className={s.name}>{d.name}</span>
                  <span className={s.meta}>{d.pages.length + (d.pages.length > 1 ? ' pages' : ' page')} · {new Date(d.updated).toLocaleString()}</span>
                  <div className={s.actions}>
                    <Button variant="secondary" size="sm" onClick={() => onOpen(d.id)}>{cur ? 'Open (current)' : 'Open'}</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDup(d.id)}>Duplicate</Button>
                    <Button variant={delAsk === d.id ? 'danger' : 'ghost'} size="sm" disabled={cur} onClick={() => onDel(d.id)}>{delAsk === d.id ? 'Confirm delete' : 'Delete'}</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Dialog>
  );
}
