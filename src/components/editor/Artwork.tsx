'use client';
import { memo, useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { FMT, logoSrc, type Design, type El, type Page } from '@/lib/templates';

/* Artwork renderer: one design page at a given scale. The same component draws the canvas boards,
   page and gallery thumbnails, and the off-screen export nodes, so exports match what is on screen. */

export const FONT = { sans: '"Geist", ui-sans-serif, system-ui, sans-serif', mono: '"Geist Mono", ui-monospace, monospace' };

export type HandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/** Callbacks for an editable board. Kept in one stable object so memoised elements don't re-render. */
export interface BoardHandlers {
  elDown(ev: RPointerEvent<HTMLElement>, pi: number, el: El): void;
  elDoubleClick(pi: number, el: El): void;
  handleDown(ev: RPointerEvent<HTMLElement>, dir: HandleDir, pi: number, el: El): void;
  boardDown(pi: number): void;
  commitText(pi: number, id: string, text: string): void;
  stopEditing(): void;
}

export interface Interactive {
  handlers: BoardHandlers;
  sel: string | null;
  editing: string | null;
  showSafeArea: boolean;
  guides?: { x?: number; y?: number } | null;
}

export function pageBgOf(p: Page): string {
  const b = p.els.find((x) => x.role === 'background' && x.type === 'shape');
  return (b && b.s.bg) || p.bg || '#FFFFFF';
}

function EditableText({ text, onDone, onCancel }: { text: string; onDone: (t: string) => void; onCancel: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const n = ref.current;
    if (!n) return;
    n.focus();
    const r = document.createRange();
    r.selectNodeContents(n);
    const sl = getSelection();
    sl?.removeAllRanges();
    sl?.addRange(r);
  }, []);
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      style={{ outline: 'none', cursor: 'text', minHeight: '1em' }}
      onPointerDown={(ev) => ev.stopPropagation()}
      onKeyDown={(ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.currentTarget.blur(); } ev.stopPropagation(); }}
      onBlur={(ev) => { const t = ev.currentTarget.innerText.replace(/\n$/, ''); if (t !== text) onDone(t); else onCancel(); }}
    >
      {text}
    </div>
  );
}

interface ElProps { el: El; pi: number; total: number; ix?: { handlers: BoardHandlers; editing: boolean } }

const ElementView = memo(function ElementView({ el, pi, total, ix }: ElProps) {
  if (el.hidden) return null;
  const s = el.s || {};
  const style: CSSProperties = {
    position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h, opacity: s.opacity ?? 1,
    transform: el.rot ? 'rotate(' + el.rot + 'deg)' : undefined, boxSizing: 'border-box',
  };
  const events = ix ? {
    onPointerDown: (ev: RPointerEvent<HTMLElement>) => ix.handlers.elDown(ev, pi, el),
    onDoubleClick: () => ix.handlers.elDoubleClick(pi, el),
  } : {};
  if (ix) Object.assign(style, { cursor: ix.editing ? 'text' : 'move', touchAction: 'none' });

  if (el.type === 'text') {
    const text = el.auto === 'pagenum' ? String(pi + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0') : el.text || '';
    Object.assign(style, {
      display: 'flex', flexDirection: 'column', justifyContent: s.valign === 'center' ? 'center' : s.valign === 'bottom' ? 'flex-end' : 'flex-start',
      padding: s.pad || 0, background: s.bg || 'transparent', borderRadius: s.radius || 0, border: s.border || 'none', color: s.color,
      fontFamily: FONT[s.font || 'sans'] || FONT.sans, fontSize: s.size, fontWeight: s.weight, lineHeight: s.lh, letterSpacing: (s.ls || 0) + 'em',
      textAlign: s.align, textTransform: s.upper ? 'uppercase' : 'none', fontStyle: s.italic ? 'italic' : 'normal',
      whiteSpace: 'pre-wrap', overflowWrap: 'break-word', textWrap: 'pretty',
    } as CSSProperties);
    return (
      <div data-el={el.id} style={style} {...events}>
        {ix?.editing
          ? <EditableText text={text} onDone={(t) => ix.handlers.commitText(pi, el.id, t)} onCancel={() => ix.handlers.stopEditing()} />
          : <div>{text}</div>}
      </div>
    );
  }
  if (el.type === 'shape') {
    Object.assign(style, { background: s.bg, borderRadius: s.radius, border: s.border || 'none' });
    return <div data-el={el.id} style={style} {...events} />;
  }
  if (el.type === 'line') {
    const t = s.thick || 1;
    Object.assign(style, { height: Math.max(el.h, t), borderTop: t + 'px ' + (s.dash || 'solid') + ' ' + s.color });
    return <div data-el={el.id} style={style} {...events} />;
  }
  if (el.type === 'image') {
    Object.assign(style, {
      borderRadius: s.radius, overflow: 'hidden', border: s.border || 'none',
      background: el.src ? (s.bg || 'transparent') : 'repeating-linear-gradient(45deg, ' + s.hatch + ' 0 2px, transparent 2px 18px)',
    });
    return (
      <div data-el={el.id} style={style} {...events}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {el.src && <img src={el.src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: s.fit || 'cover', display: 'block' }} />}
        {!el.src && ix && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', font: '500 ' + Math.max(12, Math.min(el.w, el.h) * 0.05) + 'px/1.2 ' + FONT.mono, color: '#736D65', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', padding: 8 }}>
            {s.label || 'Image'}
          </div>
        )}
        {!!s.overlay && <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,26,24,' + s.overlay / 100 + ')' }} />}
      </div>
    );
  }
  if (el.type === 'logo') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-el={el.id} src={logoSrc(el.logo, el.tone)} alt="Hali" draggable={false} style={{ ...style, objectFit: 'contain', display: 'block' }} {...events} />;
  }
  return null;
});

const DIRS_ALL: HandleDir[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const CURSOR: Record<HandleDir, string> = { n: 'ns', s: 'ns', e: 'ew', w: 'ew', nw: 'nwse', se: 'nwse', ne: 'nesw', sw: 'nesw' };

function Selection({ el, pi, scale, handlers }: { el: El; pi: number; scale: number; handlers: BoardHandlers }) {
  const h = Math.max(el.h, (el.s && el.s.thick) || 0);
  const bx = { left: el.x * scale - 1, top: el.y * scale - 1, width: el.w * scale + 2, height: h * scale + 2 };
  const dirs: HandleDir[] = el.type === 'line' ? ['w', 'e'] : DIRS_ALL;
  const pos = (d: HandleDir) => ({
    left: d.includes('w') ? -6 : d.includes('e') ? bx.width - 6 : bx.width / 2 - 6,
    top: d.includes('n') ? -6 : d.includes('s') ? bx.height - 6 : bx.height / 2 - 6,
  });
  return (
    <div className="ed-sel" style={{ ...bx, transform: el.rot ? 'rotate(' + el.rot + 'deg)' : undefined }}>
      {dirs.map((d) => (
        <div
          key={d}
          className="ed-handle"
          role="presentation"
          onPointerDown={(ev) => handlers.handleDown(ev, d, pi, el)}
          style={{ ...pos(d), cursor: CURSOR[d] + '-resize' }}
        />
      ))}
      <div className="ed-dim" style={{ top: bx.height + 6 }}>{el.w + ' × ' + el.h}</div>
    </div>
  );
}

export interface ArtworkProps {
  doc: Pick<Design, 'w' | 'h' | 'fmt' | 'pages'>;
  page: Page;
  pi: number;
  scale: number;
  nodeId?: string;
  interactive?: Interactive;
}

/** One page of artwork, scaled. */
export const Artwork = memo(function Artwork({ doc, page, pi, scale, nodeId, interactive }: ArtworkProps) {
  const total = doc.pages.length;
  const ix = interactive;
  const selEl = ix && ix.sel ? page.els.find((x) => x.id === ix.sel && !x.hidden) : undefined;
  const safe = ix && ix.showSafeArea ? FMT[doc.fmt]?.safe : undefined;
  let extra: ReactNode = null;
  if (ix && ix.guides) {
    extra = (
      <>
        {ix.guides.x !== undefined && <div className="ed-guide" data-axis="x" style={{ left: ix.guides.x * scale }} />}
        {ix.guides.y !== undefined && <div className="ed-guide" data-axis="y" style={{ top: ix.guides.y * scale }} />}
      </>
    );
  }
  return (
    <div
      className="ed-board"
      style={{ position: 'relative', width: Math.round(doc.w * scale), height: Math.round(doc.h * scale), background: pageBgOf(page), flex: 'none' }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div
          id={nodeId}
          onPointerDown={ix ? () => ix.handlers.boardDown(pi) : undefined}
          style={{
            position: 'relative', width: doc.w, height: doc.h, overflow: 'hidden', background: page.bg || '#FFFFFF',
            transform: scale === 1 ? 'none' : 'scale(' + scale + ')', transformOrigin: '0 0', fontFamily: FONT.sans,
          }}
        >
          {page.els.map((el) => (
            <ElementView key={el.id} el={el} pi={pi} total={total} ix={ix ? { handlers: ix.handlers, editing: ix.editing === el.id } : undefined} />
          ))}
        </div>
      </div>
      {safe && (
        <div title="Platform safe area" className="ed-safe" style={{ left: safe.x * scale, top: safe.y * scale, width: safe.w * scale, height: safe.h * scale, borderRadius: doc.fmt === 'avatar' ? '50%' : 0 }} />
      )}
      {extra}
      {ix && selEl && <Selection el={selEl} pi={pi} scale={scale} handlers={ix.handlers} />}
    </div>
  );
});

/** Fits a page into a bw × bh box. */
export function Thumb({ doc, page, pi, bw, bh }: { doc: ArtworkProps['doc']; page: Page; pi: number; bw: number; bh: number }) {
  const s = Math.min(bw / doc.w, bh / doc.h);
  return <Artwork doc={doc} page={page} pi={pi} scale={s} />;
}
