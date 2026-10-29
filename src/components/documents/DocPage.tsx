'use client';
import { memo, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { SCALE, SCHEMES, SIZES, type Block, type Doc, type DocPage as Page, type DocScheme, type Scale, type Size } from '@/lib/documents';
import { chartRows, lines, pageLabel, rows, toc } from '@/lib/docexport';

/* Document page renderer. The same component draws editable canvas pages, the navigator, and the
   off-screen export pages (`data-xpage`), so PDF/PNG/PPTX/HTML match the canvas. Visual blocks carry
   `data-raster` and text nodes `data-txt`, which the PPTX export uses to place pictures and text boxes. */

export const FONT = { sans: '"Geist", ui-sans-serif, system-ui, sans-serif', mono: '"Geist Mono", ui-monospace, monospace' };
const LOGOF: Record<string, [string, string, number]> = { lockup: ['hali-lockup-horizontal.svg', 'hali-lockup-horizontal-reverse.svg', 1.2], symbol: ['hali-symbol.svg', 'hali-symbol-light.svg', 1.6], wordmark: ['hali-wordmark.svg', 'hali-wordmark-reverse.svg', 1], stacked: ['hali-lockup-stacked.svg', 'hali-lockup-stacked-reverse.svg', 3] };
export const TONES: Record<string, [string, string]> = { note: ['#DDD9D0', 'notebook-pen'], info: ['#3462B8', 'info'], attention: ['#C98A12', 'clock'], success: ['#3A8A4A', 'circle-check'] };

export interface DocInteractive {
  sel: string | null;
  /** Edit text directly on the page (false on phones, where the page is too small to type into). */
  inline: boolean;
  select(id: string, pi: number): void;
  /** Tapping an already selected block (phones open the editing panel instead of editing inline). */
  reselect(id: string): void;
  commitField(id: string, field: keyof Block, value: string): void;
  pageClick(pi: number): void;
  overflow: boolean;
}

type TxtField = 'text' | 'sub' | 'cite' | 'title';

function Txt({ b, field, style, ix, tag }: { b: Block; field: TxtField; style: CSSProperties; ix?: DocInteractive; tag?: string }) {
  const editing = !!ix && ix.sel === b.id && ix.inline;
  const Tag = (tag || 'div') as 'div';
  const value = (b[field] as string) || '';
  if (!editing) return <Tag data-txt="1" style={style}>{value}</Tag>;
  return (
    <Tag
      data-txt="1"
      style={{ ...style, outline: 'none', cursor: 'text' }}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(ev) => { const v = ev.currentTarget.innerText.replace(/\n$/, ''); if (v !== value) ix!.commitField(b.id, field, v); }}
      onKeyDown={(ev) => { if (ev.key === 'Escape') ev.currentTarget.blur(); ev.stopPropagation(); }}
    >
      {value}
    </Tag>
  );
}

interface Cx { sc: Scale; size: Size }

function BlockView({ b, pi, doc, c, cx, ix }: { b: Block; pi: number; doc: Doc; c: DocScheme; cx: Cx; ix?: DocInteractive }) {
  const { sc, size } = cx;
  const k = b.scale || 1, col = b.color || c.fg, al = b.align || 'left';
  const base: CSSProperties = { textAlign: al, color: col, margin: 0 };
  const gap = sc.gap;
  const sel = !!ix && ix.sel === b.id;
  const wrap = (kids: ReactNode, st?: CSSProperties, raster?: boolean) => (
    <div
      data-bid={b.id}
      data-raster={raster ? '1' : undefined}
      onClick={ix ? (ev) => { ev.stopPropagation(); if (ix.sel !== b.id) ix.select(b.id, pi); else ix.reselect(b.id); } : undefined}
      style={{ position: 'relative', marginBottom: gap, outline: sel ? '2px solid #3462B8' : 'none', outlineOffset: 4, cursor: ix ? (sel ? 'text' : 'pointer') : 'default', borderRadius: 2, ...st }}
    >
      {kids}
    </div>
  );
  const mono: CSSProperties = { fontFamily: FONT.mono, fontSize: sc.small * k, fontWeight: 500, letterSpacing: '0.04em', color: b.color || c.muted, lineHeight: 1.4 };

  switch (b.t) {
    case 'heading': {
      const s = (b.level === 1 ? sc.h1 : b.level === 2 ? sc.h2 : sc.h3) * k;
      return wrap(<Txt b={b} field="text" ix={ix} tag={'h' + Math.min(6, (b.level || 2) + 1)} style={{ ...base, fontSize: s, fontWeight: 600, lineHeight: 1.15, letterSpacing: b.level === 1 ? '-0.025em' : '-0.015em', textWrap: 'balance' } as CSSProperties} />,
        { marginTop: b.level === 1 ? 0 : gap * 0.5, marginBottom: gap * (b.level === 1 ? 0.9 : 0.55) });
    }
    case 'title':
      return wrap(<>
        <Txt b={b} field="text" ix={ix} style={{ ...base, fontSize: sc.title * k, fontWeight: 600, lineHeight: 1.04, letterSpacing: '-0.035em', textWrap: 'balance' } as CSSProperties} />
        {(b.sub || sel) && <Txt b={b} field="sub" ix={ix} style={{ ...base, fontSize: sc.h3 * k * (size.type === 'slide' ? 1 : 1.05), color: b.color || c.muted, lineHeight: 1.35, marginTop: gap * 0.8, textWrap: 'pretty' } as CSSProperties} />}
      </>, { marginBottom: gap * 1.4 });
    case 'kicker':
      return wrap(<Txt b={b} field="text" ix={ix} style={{ ...base, ...mono, textTransform: 'uppercase', letterSpacing: '0.07em' }} />, { marginBottom: gap * 0.6 });
    case 'meta':
      return wrap(<Txt b={b} field="text" ix={ix} style={{ ...base, ...mono, fontWeight: 400, letterSpacing: 0, whiteSpace: 'pre-line' }} />, { marginBottom: gap * 0.5 });
    case 'para': {
      const st = { ...base, fontSize: sc.body * k, lineHeight: sc.lh, textAlign: al, hyphens: al === 'justify' ? 'auto' : 'manual', fontStyle: b.italic ? 'italic' : 'normal', whiteSpace: 'pre-line', textWrap: 'pretty' } as CSSProperties;
      if (b.dropcap && !sel && b.text) {
        return wrap(<div data-txt="1" style={st}><span style={{ float: 'left', fontSize: sc.body * k * 3.3, lineHeight: 0.82, fontWeight: 600, marginRight: 6, marginTop: 4, color: c.accent }}>{b.text[0]}</span>{b.text.slice(1)}</div>);
      }
      return wrap(<Txt b={b} field="text" ix={ix} style={st} />);
    }
    case 'quote':
      return wrap(<>
        <Txt b={b} field="text" ix={ix} style={{ ...base, fontSize: (size.type === 'slide' ? sc.h2 : sc.h2 * 1.05) * k, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.02em', textWrap: 'balance' } as CSSProperties} />
        {(b.cite || sel) && <Txt b={b} field="cite" ix={ix} style={{ ...base, ...mono, marginTop: gap * 0.7, textTransform: 'uppercase' }} />}
      </>, { borderLeft: al === 'left' ? '3px solid ' + c.accent : 'none', paddingLeft: al === 'left' ? gap : 0, marginTop: gap * 0.6, marginBottom: gap * 1.2 });
    case 'callout': {
      const tn = TONES[b.tone || 'note'] || TONES.note;
      return wrap(
        <div style={{ border: '1.5px solid ' + tn[0], borderRadius: 10, padding: gap * 1.1, background: c.surface }}>
          <Txt b={b} field="title" ix={ix} style={{ fontSize: sc.body * k, fontWeight: 600, color: b.color || c.fg, marginBottom: 6, lineHeight: 1.3 }} />
          <Txt b={b} field="text" ix={ix} style={{ fontSize: sc.body * k * 0.95, lineHeight: sc.lh, color: b.color || c.fg, whiteSpace: 'pre-line' }} />
        </div>,
      );
    }
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul';
      return wrap(<L data-txt="1" style={{ ...base, fontSize: sc.body * k, lineHeight: sc.lh, paddingLeft: sc.body * 1.6 }}>{lines(b.text).map((l, j) => <li key={j} style={{ marginBottom: gap * 0.3, paddingLeft: 4 }}>{l}</li>)}</L>);
    }
    case 'image':
      return wrap(<>
        {b.src
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={b.src} alt={b.caption || ''} style={{ display: 'block', width: '100%', height: (b.h || 280) * k, objectFit: b.fit || 'cover', borderRadius: 6 }} />
          : <div style={{ height: (b.h || 280) * k, borderRadius: 6, border: '1px solid ' + c.line, background: 'repeating-linear-gradient(45deg, ' + c.line + ' 0 2px, transparent 2px 18px)', display: 'grid', placeItems: 'center', fontFamily: FONT.mono, fontSize: sc.small, color: c.muted, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', padding: 8 }}>{ix ? 'Select, then upload an image' : ''}</div>}
        {b.caption && <div style={{ ...mono, fontWeight: 400, letterSpacing: 0, marginTop: 8, textAlign: al }}>{b.caption}</div>}
      </>, {}, true);
    case 'table': {
      const r = rows(b.text);
      return wrap(<>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: sc.body * 0.9 * k, lineHeight: 1.4, color: col }}>
          <tbody>
            {r.map((x, j) => (
              <tr key={j}>{x.map((cell, m) => {
                const C = j === 0 ? 'th' : 'td';
                return <C key={m} style={{ textAlign: 'left', padding: (gap * 0.45) + 'px ' + (gap * 0.6) + 'px', borderBottom: '1px solid ' + c.line, borderTop: j === 0 ? '1.5px solid ' + c.fg : 'none', fontWeight: j === 0 ? 600 : (x.length > 1 && /total/i.test(x[0]) ? 600 : 400), verticalAlign: 'top' }}>{cell}</C>;
              })}</tr>
            ))}
          </tbody>
        </table>
        {b.caption && <div style={{ ...mono, fontWeight: 400, letterSpacing: 0, marginTop: 8 }}>{b.caption}</div>}
      </>, {}, true);
    }
    case 'stats':
      return wrap(
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(' + Math.round(sc.h1 * 3.2) + 'px, 1fr))', gap }}>
          {rows(b.text).map((r, j) => (
            <div key={j} style={{ borderTop: '2px solid ' + c.accent, paddingTop: gap * 0.6 }}>
              <div style={{ fontSize: sc.h1 * 1.1 * k, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.05, color: b.color || c.accent, fontVariantNumeric: 'tabular-nums' }}>{r[0]}</div>
              <div style={{ fontSize: sc.small * 1.1 * k, color: c.muted, marginTop: 6, lineHeight: 1.35 }}>{r[1] || ''}</div>
            </div>
          ))}
        </div>, {}, true);
    case 'chart': {
      const cr = chartRows(b.text), mx = Math.max(1, ...cr.map((r) => r[1]));
      const fmtv = (v: number) => (b.unit === '$' ? '$' : '') + v.toLocaleString() + (b.unit === '%' ? '%' : '');
      return wrap(<>
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap * 0.6 }}>
          {cr.map((r, j) => {
            const prop = /propos|potential/i.test(r[0]);
            return (
              <div key={j} style={{ display: 'grid', gridTemplateColumns: '28% minmax(0,1fr) auto', gap: gap * 0.6, alignItems: 'center', fontSize: sc.small * 1.1 * k, color: col }}>
                <span style={{ color: c.muted }}>{r[0]}</span>
                <span style={{ height: sc.body * 1.1 * k, width: Math.max(2, r[1] / mx * 100) + '%', background: prop ? 'transparent' : c.accent, border: prop ? '1.5px dashed #3462B8' : 'none', borderRadius: 3, boxSizing: 'border-box' }} />
                <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtv(r[1])}</span>
              </div>
            );
          })}
        </div>
        {b.caption && <div style={{ ...mono, fontWeight: 400, letterSpacing: 0, marginTop: 10 }}>{b.caption}</div>}
      </>, {}, true);
    }
    case 'kv':
      return wrap(
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 32%) minmax(0, 1fr)', fontSize: sc.body * 0.95 * k, lineHeight: 1.45 }}>
          {rows(b.text).flatMap((r, j) => [
            <div key={'a' + j} style={{ color: c.muted, padding: (gap * 0.45) + 'px 0', borderTop: '1px solid ' + c.line }}>{r[0]}</div>,
            <div key={'b' + j} style={{ color: col, padding: (gap * 0.45) + 'px 0', borderTop: '1px solid ' + c.line }}>{r.slice(1).join(' · ')}</div>,
          ])}
        </div>, {}, true);
    case 'timeline': {
      const all = rows(b.text);
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {all.map((r, j) => (
            <div key={j} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 30%) 18px minmax(0, 1fr)', gap: gap * 0.5, fontSize: sc.body * 0.95 * k, lineHeight: 1.45 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: sc.small * 1.05 * k, color: c.muted, paddingTop: 2 }}>{r[0]}</div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 4, top: 6, width: 9, height: 9, borderRadius: '50%', background: c.accent }} />
                {j < all.length - 1 && <span style={{ position: 'absolute', left: 8, top: 18, bottom: 0, borderLeft: '1.5px solid ' + c.line }} />}
              </div>
              <div style={{ color: col, paddingBottom: gap * 0.9 }}>{r.slice(1).join(' · ')}</div>
            </div>
          ))}
        </div>, {}, true);
    }
    case 'people':
      return wrap(
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(' + Math.round(sc.body * 11) + 'px, 1fr))', gap }}>
          {rows(b.text).map((r, j) => (
            <div key={j} style={{ display: 'flex', gap: gap * 0.7, alignItems: 'flex-start', borderTop: '1px solid ' + c.line, paddingTop: gap * 0.7 }}>
              <span style={{ flex: 'none', width: sc.body * 2.6, height: sc.body * 2.6, borderRadius: '50%', background: c.surface, border: '1px solid ' + c.line, display: 'grid', placeItems: 'center', fontSize: sc.small * k, fontWeight: 600, color: c.accent }}>
                {(r[0] || '').replace(/[[\]]/g, '').split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase()}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: sc.body * 0.92 * k, lineHeight: 1.4 }}>
                <span style={{ fontWeight: 600, color: col }}>{r[0]}</span>
                <span style={{ color: c.muted }}>{r[1] || ''}</span>
                {r[2] && <span style={{ color: col }}>{r[2]}</span>}
              </div>
            </div>
          ))}
        </div>, {}, true);
    case 'cta': {
      const dark = c.tone === 'reverse';
      return wrap(<>
        <div style={{ display: 'flex', justifyContent: al === 'center' ? 'center' : al === 'right' ? 'flex-end' : 'flex-start' }}>
          <span style={{ display: 'inline-block', padding: (sc.body * 0.7 * k) + 'px ' + (sc.body * 1.4 * k) + 'px', borderRadius: 8, background: dark ? '#FBFAF7' : '#1C1A18', color: dark ? '#1C1A18' : '#FFFFFF', fontSize: sc.body * k, fontWeight: 500, lineHeight: 1 }}>{b.text}</span>
        </div>
        {b.sub && <div style={{ ...mono, fontWeight: 400, letterSpacing: 0, marginTop: 10, textAlign: al }}>{b.sub}</div>}
      </>, { marginTop: gap * 0.4 }, true);
    }
    case 'divider':
      return wrap(<div style={{ borderTop: Math.max(2, Math.round(sc.body / 7)) + 'px ' + (b.dash || 'solid') + ' ' + (b.color || c.accent), width: '100%' }} />, { paddingTop: 4, paddingBottom: 4 }, true);
    case 'spacer':
      return wrap(null, { height: (b.h || 40) * k, marginBottom: 0, background: sel ? 'rgba(52,98,184,.08)' : 'transparent' });
    case 'toc':
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {toc(doc).map((t, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: (gap * 0.35) + 'px 0', fontSize: sc.body * (t.level === 0 ? 1.02 : 0.98) * k, fontWeight: t.level === 0 ? 600 : 400, color: col, borderBottom: '1px solid ' + c.line }}>
              <span style={{ flex: '0 1 auto' }}>{t.title}</span>
              <span style={{ flex: 1, borderBottom: '1.5px dotted ' + c.muted, transform: 'translateY(-4px)', minWidth: 16 }} />
              <span style={{ fontFamily: FONT.mono, fontSize: sc.small * k, color: c.muted }}>{String(t.page)}</span>
            </div>
          ))}
        </div>, {}, true);
    case 'logo': {
      const f = LOGOF[b.variant || 'lockup'] || LOGOF.lockup;
      // eslint-disable-next-line @next/next/no-img-element
      return wrap(<img src={'/assets/logo/' + f[c.tone === 'reverse' ? 1 : 0]} alt="Hali" style={{ display: 'block', height: sc.h2 * f[2] * k, margin: al === 'center' ? '0 auto' : al === 'right' ? '0 0 0 auto' : 0 }} />, {}, true);
    }
    default:
      return null;
  }
}

/** The page at 1:1 (layout and overflow measurement always happen at natural size). */
function PageInner({ doc, p, i, ix, exportNode }: { doc: Doc; p: Page; i: number; ix?: DocInteractive; exportNode?: boolean }) {
  const size = SIZES[doc.size] || SIZES.a4, sc = SCALE[size.type], c = SCHEMES[p.bg] || SCHEMES.paper;
  const [mt, mr, mb, ml] = size.m, fixed = !!size.h;
  const num = pageLabel(doc, i);
  const cx: Cx = { sc, size };
  return (
    <div
      data-xpage={exportNode ? '1' : undefined}
      onClick={ix ? () => ix.pageClick(i) : undefined}
      style={{ position: 'relative', width: size.w, height: fixed ? size.h! : 'auto', background: c.bg, color: c.fg, fontFamily: FONT.sans, boxSizing: 'border-box', overflow: fixed && !ix ? 'hidden' : 'visible', flex: 'none' }}
    >
      <div
        data-page-body="1"
        data-pid={p.id}
        style={fixed
          ? { position: 'absolute', left: ml, right: mr, top: mt, bottom: mb, display: 'flex', flexDirection: 'column', overflow: ix ? 'visible' : 'hidden' }
          : { padding: mt + 'px ' + mr + 'px ' + mb + 'px ' + ml + 'px', display: 'flex', flexDirection: 'column', minHeight: 120 }}
      >
        <div style={{ marginTop: p.valign === 'top' ? 0 : 'auto', marginBottom: p.valign === 'center' ? 'auto' : 0, display: 'flow-root' }}>
          {p.blocks.length
            ? p.blocks.map((b) => <BlockView key={b.id} b={b} pi={i} doc={doc} c={c} cx={cx} ix={ix} />)
            : ix ? <div style={{ padding: 24, border: '1.5px dashed ' + c.line, borderRadius: 8, fontFamily: FONT.mono, fontSize: sc.small, color: c.muted, textAlign: 'center' }}>Empty page — add a block from the panel</div> : null}
        </div>
      </div>
      {fixed && doc.header && p.header && (
        <div data-txt="1" style={{ position: 'absolute', left: ml, right: mr, top: Math.round(mt * 0.42), fontFamily: FONT.mono, fontSize: sc.small * 0.9, color: c.muted, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
      )}
      {fixed && num && (
        <div data-txt="1" style={{ position: 'absolute', left: ml, right: mr, bottom: Math.round(mb * 0.38), textAlign: size.type === 'slide' ? 'right' : 'center', fontFamily: FONT.mono, fontSize: sc.small * 0.95, color: c.muted }}>{String(num)}</div>
      )}
      {ix && fixed && ix.overflow && <div style={{ position: 'absolute', left: 0, right: 0, bottom: mb, borderTop: '2px dashed #C98A12', pointerEvents: 'none' }} />}
    </div>
  );
}

/** A page scaled with a transform inside a box of the scaled size (standard alternative to CSS `zoom`). */
export const DocPageView = memo(function DocPageView({ doc, p, i, scale, ix }: { doc: Doc; p: Page; i: number; scale: number; ix?: DocInteractive }) {
  const size = SIZES[doc.size] || SIZES.a4;
  const inner = useRef<HTMLDivElement>(null);
  const [autoH, setAutoH] = useState(400);
  useLayoutEffect(() => {
    if (size.h || !inner.current) return;
    const n = inner.current;
    const ro = new ResizeObserver(() => setAutoH(n.offsetHeight));
    ro.observe(n);
    setAutoH(n.offsetHeight);
    return () => ro.disconnect();
  }, [size.h]);
  const h = size.h || autoH;
  return (
    <div style={{ width: Math.round(size.w * scale), height: Math.round(h * scale), position: 'relative', flex: 'none' }}>
      <div ref={inner} style={{ position: 'absolute', left: 0, top: 0, transform: scale === 1 ? 'none' : 'scale(' + scale + ')', transformOrigin: '0 0' }}>
        <PageInner doc={doc} p={p} i={i} ix={ix} />
      </div>
    </div>
  );
});

/** Unscaled export page (rendered off-screen, captured by the exporters). */
export function DocExportPage({ doc, p, i }: { doc: Doc; p: Page; i: number }) {
  return <PageInner doc={doc} p={p} i={i} exportNode />;
}
