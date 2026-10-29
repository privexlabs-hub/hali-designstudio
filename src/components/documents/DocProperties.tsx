'use client';
import { Button, Icon, IconButton, Switch } from '@/components/ds';
import { BLOCKS, SCHEMES, SIZES, TYPES, type Block, type BlockType, type Doc, type PageScheme, type SizeId } from '@/lib/documents';
import { Field, Over, Seg } from '@/components/editor/shared';

const SW: [string, string][] = [['Ink', '#1C1A18'], ['Graphite', '#5C5751'], ['Slate', '#736D65'], ['Paper', '#FBFAF7'], ['White', '#FFFFFF'], ['Deep Sea', '#285B57'], ['Sea 300', '#86B9B3'], ['Sea 100', '#D3E6E3'], ['Blue 500', '#3462B8'], ['Amber 700', '#7A520A'], ['Red 600', '#A33424']];
const TEXTY: BlockType[] = ['heading', 'para', 'kicker', 'meta', 'quote'];
const NO_ALIGN: BlockType[] = ['spacer', 'divider', 'toc', 'stats', 'kv', 'timeline', 'people', 'table', 'chart'];

type FieldDef = [label: string, key: 'text' | 'sub' | 'cite' | 'title' | 'caption', rows: number, help?: string];
const FIELDS: Record<BlockType, FieldDef[]> = {
  heading: [['Heading', 'text', 2]], para: [['Paragraph', 'text', 6]], kicker: [['Overline', 'text', 1]], meta: [['Text', 'text', 2]], title: [['Title', 'text', 2], ['Subtitle', 'sub', 2]],
  quote: [['Quote', 'text', 3], ['Attribution', 'cite', 1]], callout: [['Title', 'title', 1], ['Text', 'text', 3]], list: [['Items', 'text', 5, 'One item per line.']],
  image: [['Caption', 'caption', 2]], table: [['Rows', 'text', 6, 'One row per line; separate cells with |. The first row is the header.'], ['Caption', 'caption', 1]],
  stats: [['Statistics', 'text', 4, 'One per line: value | label. Use only confirmed or illustrative figures.']], chart: [['Bars', 'text', 5, 'One per line: label: number. Labels with "proposed" draw dashed.'], ['Caption', 'caption', 1]],
  kv: [['Details', 'text', 5, 'One per line: label | value']], timeline: [['Timeline', 'text', 5, 'One per line: when | what happens']], people: [['People', 'text', 5, 'One per line: name | role | one line']],
  cta: [['Button label', 'text', 1, 'Name the exact action.'], ['Supporting line', 'sub', 1]], toc: [], divider: [], spacer: [], logo: [],
};

export interface DocPropsApi {
  updBlock(id: string, fn: (b: Block) => void, tag?: string): void;
  moveBlock(id: string, dir: 1 | -1): void;
  moveBlockPage(id: string, dir: 1 | -1): void;
  dupBlock(id: string): void;
  delBlock(id: string): void;
  deselect(): void;
  pickImage(): void;
  addBlock(t: BlockType): void;
  commit(fn: (d: Doc) => void, tag?: string): void;
  setSize(s: SizeId): void;
  resetAsk: boolean;
  setResetAsk(v: boolean): void;
  doReset(): void;
}

function BlockProps({ doc, b, loc, api }: { doc: Doc; b: Block; loc: { pi: number; bi: number }; api: DocPropsApi }) {
  const size = SIZES[doc.size];
  const set = <K extends keyof Block>(k: K, v: Block[K]) => api.updBlock(b.id, (x) => { x[k] = v; });
  const blocks = doc.pages[loc.pi].blocks;
  return (
    <div className="ed-pad">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={BLOCKS[b.t][1]} size={16} style={{ color: 'var(--icon-secondary)' }} />
        <span style={{ flex: 1, font: '600 14px/1.3 var(--font-sans)' }}>{BLOCKS[b.t][0]} · page {loc.pi + 1}</span>
        <IconButton icon="x" label="Deselect block" size="sm" onClick={api.deselect} />
      </div>
      <div className="ed-row" role="toolbar" aria-label="Block actions">
        <IconButton icon="arrow-up" label="Move up" variant="secondary" size="sm" disabled={loc.bi === 0} onClick={() => api.moveBlock(b.id, -1)} />
        <IconButton icon="arrow-down" label="Move down" variant="secondary" size="sm" disabled={loc.bi === blocks.length - 1} onClick={() => api.moveBlock(b.id, 1)} />
        <IconButton icon="arrow-up-to-line" label="Move to previous page" variant="secondary" size="sm" disabled={loc.pi === 0} onClick={() => api.moveBlockPage(b.id, -1)} />
        <IconButton icon="arrow-down-to-line" label="Move to next page" variant="secondary" size="sm" disabled={loc.pi === doc.pages.length - 1} onClick={() => api.moveBlockPage(b.id, 1)} />
        <IconButton icon="copy-plus" label="Duplicate block" variant="secondary" size="sm" onClick={() => api.dupBlock(b.id)} />
        <IconButton icon="trash-2" label="Delete block (Delete key)" variant="secondary" size="sm" onClick={() => api.delBlock(b.id)} />
      </div>
      {TEXTY.includes(b.t) && (
        <Field label="Block type">
          <select className="ed-select" value={b.t} onChange={(e) => { const t = e.target.value as BlockType; api.updBlock(b.id, (x) => { x.t = t; if (t === 'heading' && !x.level) x.level = 2; }); }}>
            {([['heading', 'Heading'], ['para', 'Paragraph'], ['kicker', 'Overline'], ['meta', 'Metadata'], ['quote', 'Pull quote']] as const).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </Field>
      )}
      {FIELDS[b.t].map(([label, key, rowsN, help]) => (
        <label key={key} className="ed-field">
          <span className="ed-over">{label}</span>
          <textarea className="ed-textarea" rows={rowsN} value={(b[key] as string) || ''} onChange={(e) => { const v = e.target.value; api.updBlock(b.id, (x) => { x[key] = v; }, 'f' + key); }} />
          {help && <span className="ed-hint" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{help}</span>}
        </label>
      ))}
      {b.t === 'image' && (
        <div className="ed-row">
          <Button variant="secondary" size="sm" iconStart="image-up" onClick={api.pickImage}>{b.src ? 'Replace image' : 'Upload image'}</Button>
          {b.src && <Button variant="ghost" size="sm" onClick={() => set('src', '')}>Remove</Button>}
        </div>
      )}
      {!NO_ALIGN.includes(b.t) && (
        <div className="ed-sec">
          <Over>Alignment</Over>
          <Seg
            label="Alignment"
            value={b.align}
            onChange={(v) => set('align', v)}
            options={[['left', 'Left', 'align-left'], ['center', 'Centre', 'align-center'], ['right', 'Right', 'align-right'], ...(b.t === 'para' ? [['justify', 'Justify', 'align-justify']] : [])].map(([id, title, icon]) => ({ id: id as Block['align'], title, label: <Icon name={icon} size={14} /> }))}
          />
        </div>
      )}
      {b.t === 'heading' && <div className="ed-sec"><Over>Level</Over><Seg label="Level" value={b.level} onChange={(v) => set('level', v)} options={[1, 2, 3].map((n) => ({ id: n as 1 | 2 | 3, label: 'H' + n }))} /></div>}
      {b.t === 'list' && <div className="ed-sec"><Over>List style</Over><Seg label="List style" value={b.ordered ? 'num' : 'bul'} onChange={(v) => set('ordered', v === 'num')} options={[{ id: 'bul', label: 'Bullets' }, { id: 'num', label: 'Numbered' }]} /></div>}
      {b.t === 'callout' && <div className="ed-sec"><Over>Tone</Over><Seg label="Tone" value={b.tone} onChange={(v) => set('tone', v)} options={(['note', 'info', 'attention', 'success'] as const).map((id) => ({ id, label: id[0].toUpperCase() + id.slice(1) }))} /></div>}
      {b.t === 'divider' && <div className="ed-sec"><Over>Line</Over><Seg label="Line" value={b.dash} onChange={(v) => set('dash', v)} options={(['dotted', 'dashed', 'solid'] as const).map((id) => ({ id, label: id[0].toUpperCase() + id.slice(1) }))} /></div>}
      {b.t === 'image' && <div className="ed-sec"><Over>Fit</Over><Seg label="Fit" value={b.fit} onChange={(v) => set('fit', v)} options={[{ id: 'cover' as const, label: 'Fill' }, { id: 'contain' as const, label: 'Fit' }]} /></div>}
      {b.t === 'logo' && <div className="ed-sec"><Over>Logo</Over><Seg label="Logo" value={b.variant} onChange={(v) => set('variant', v)} options={(['lockup', 'symbol', 'wordmark', 'stacked'] as const).map((id) => ({ id, label: id[0].toUpperCase() + id.slice(1) }))} /></div>}
      {b.t === 'para' && (
        <div className="ed-sec">
          <Over>Style</Over>
          <div className="ed-row">
            <button type="button" className="ed-toggle" aria-pressed={!!b.italic} onClick={() => set('italic', !b.italic)}>Italic</button>
            <button type="button" className="ed-toggle" aria-pressed={!!b.dropcap} onClick={() => set('dropcap', !b.dropcap)}>Drop cap</button>
          </div>
        </div>
      )}
      <label className="ed-field">
        <span className="ed-over">Size · {Math.round((b.scale || 1) * 100)}%</span>
        <input type="range" min={0.5} max={2} step={0.05} value={b.scale || 1} onChange={(e) => { const v = +e.target.value; api.updBlock(b.id, (x) => { x.scale = v; }, 'scale'); }} />
      </label>
      {(b.t === 'image' || b.t === 'spacer') && (
        <label className="ed-field">
          <span className="ed-over">Height · {b.h}px</span>
          <input type="range" min={b.t === 'image' ? 80 : 8} max={b.t === 'image' ? Math.round((size.h || 1200) * 0.8) : 600} step={b.t === 'image' ? 10 : 4} value={b.h || 40} onChange={(e) => { const v = +e.target.value; api.updBlock(b.id, (x) => { x.h = v; }, 'h'); }} />
        </label>
      )}
      <div className="ed-sec">
        <Over>Text colour · {b.color || 'auto'}</Over>
        <div className="ed-swatches" role="group" aria-label="Text colour">
          <button type="button" className="ed-toggle" style={{ height: 22, padding: '0 6px', fontSize: 11 }} aria-pressed={!b.color} title="Use the page default" aria-label="Use the page default colour" onClick={() => set('color', '')}>Auto</button>
          {SW.map(([name, hex]) => (
            <button key={hex} type="button" className="ed-swatch" title={name + ' ' + hex} aria-label={name + ' ' + hex} aria-pressed={(b.color || '').toUpperCase() === hex} style={{ background: hex }} onClick={() => set('color', hex)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageProps({ doc, pi, kindName, api }: { doc: Doc; pi: number; kindName: (k: string) => string; api: DocPropsApi }) {
  const page = doc.pages[pi];
  const T = TYPES[doc.type];
  return (
    <div className="ed-pad" style={{ gap: 16 }}>
      <div className="ed-sec">
        <Over>Page {String(pi + 1).padStart(2, '0')} · {kindName(page.kind)}</Over>
        <input className="ed-input" aria-label="Page name" value={page.name} onChange={(e) => { const v = e.target.value; api.commit((d) => { d.pages[pi].name = v; }, 'pn' + pi); }} />
        <span className="ed-hint">Background</span>
        <Seg
          label="Background"
          value={page.bg}
          onChange={(v) => api.commit((d) => { d.pages[pi].bg = v; })}
          options={(Object.keys(SCHEMES) as PageScheme[]).map((id) => ({ id, label: <><span style={{ width: 10, height: 10, borderRadius: 2, background: SCHEMES[id].bg, border: '1px solid var(--border-strong)' }} />{SCHEMES[id].name}</> }))}
        />
        <span className="ed-hint">Vertical position</span>
        <Seg label="Vertical position" value={page.valign} onChange={(v) => api.commit((d) => { d.pages[pi].valign = v; })} options={[{ id: 'top' as const, label: 'Top' }, { id: 'center' as const, label: 'Middle' }, { id: 'bottom' as const, label: 'Bottom' }]} />
        <Switch size="sm" label="Show page number" checked={!!page.number} onChange={() => api.commit((d) => { d.pages[pi].number = !d.pages[pi].number; })} />
        <Switch size="sm" label="Show running header" checked={!!page.header} onChange={() => api.commit((d) => { d.pages[pi].header = !d.pages[pi].header; })} />
      </div>
      <div className="ed-sec">
        <Over>Add block to this page</Over>
        <div className="dc-blockgrid">
          {(Object.entries(BLOCKS) as [BlockType, typeof BLOCKS[BlockType]][]).map(([k, v]) => (
            <button key={k} type="button" className="ed-tool" title={v[0]} onClick={() => api.addBlock(k)}><Icon name={v[1]} size={16} />{v[0]}</button>
          ))}
        </div>
        <span className="ed-hint" style={{ color: 'var(--text-tertiary)' }}>Select a block on the page, then type to edit it there. Structured blocks (lists, tables, timelines) edit in this panel.</span>
      </div>
      <div className="ed-sec">
        <Over>Document</Over>
        <label className="ed-field" style={{ gap: 4 }}><span className="ed-hint">Author</span>
          <input className="ed-input" value={doc.author || ''} onChange={(e) => { const v = e.target.value; api.commit((d) => { d.author = v; }, 'author'); }} />
        </label>
        <label className="ed-field" style={{ gap: 4 }}><span className="ed-hint">Page size</span>
          <select className="ed-select" value={doc.size} onChange={(e) => api.setSize(e.target.value as SizeId)}>
            {T.sizes.map((id) => <option key={id} value={id}>{SIZES[id].name}</option>)}
          </select>
        </label>
        <label className="ed-field" style={{ gap: 4 }}><span className="ed-hint">Page numbering starts on</span>
          <select className="ed-select" value={String(doc.numberFrom)} onChange={(e) => { const v = +e.target.value; api.commit((d) => { d.numberFrom = v; }); }}>
            {doc.pages.map((p, i) => <option key={p.id} value={String(i)}>Page {i + 1} · {p.name}</option>)}
            <option value="99">No page numbers</option>
          </select>
        </label>
        <Switch size="sm" label="Running header with the document title" checked={!!doc.header} onChange={() => api.commit((d) => { d.header = !d.header; })} />
        {!api.resetAsk ? (
          <Button variant="secondary" size="sm" iconStart="rotate-ccw" style={{ alignSelf: 'flex-start' }} onClick={() => api.setResetAsk(true)}>Reset to template</Button>
        ) : (
          <>
            <span className="ed-hint" style={{ fontSize: 13 }}>This replaces every page with the original template. You can undo it.</span>
            <div className="ed-row">
              <Button variant="danger" size="sm" onClick={api.doReset}>Reset document</Button>
              <Button variant="ghost" size="sm" onClick={() => api.setResetAsk(false)}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function DocProperties({ doc, pi, sel, kindName, api }: { doc: Doc; pi: number; sel: { b: Block; pi: number; bi: number } | null; kindName: (k: string) => string; api: DocPropsApi }) {
  return sel ? <BlockProps doc={doc} b={sel.b} loc={sel} api={api} /> : <PageProps doc={doc} pi={pi} kindName={kindName} api={api} />;
}
