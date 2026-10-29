'use client';
import { Button, Icon, IconButton } from '@/components/ds';
import { CAT, FMT, LOGO, MONTHS, SCHEMES, findTemplate, type Design, type El, type ElStyle, type LogoVariant, type Page, type SchemeId, type TemplateVars } from '@/lib/templates';
import { pageBgOf } from './Artwork';
import { EL_ICON, pretty } from './PagesPanel';
import { Field, NumberField, Over, Seg, Swatches } from './shared';

export const parseBorder = (b?: string) => {
  const m = /^([\d.]+)px\s+(solid|dashed|dotted)\s+(#[0-9a-fA-F]{3,8}|[a-z]+)/.exec(b || '');
  return m ? { w: +m[1], st: m[2], c: m[3] } : { w: 0, st: 'none', c: '#285B57' };
};

type Mut = (x: El) => void;

export interface PropertiesApi {
  updSel(fn: Mut, ov: string[], tag?: string): void;
  updEl(id: string, fn: Mut, ov: string[], tag?: string): void;
  dupSel(): void;
  deleteSel(): void;
  layer(dir: 1 | -1): void;
  deselect(): void;
  pickImage(): void;
  setPageBg(hex: string): void;
  setPageName(name: string): void;
  onFormat(fmt: string): void;
  onScheme(id: SchemeId): void;
  setVars(v: TemplateVars): void;
  selectEl(id: string): void;
  editText(id: string): void;
  resetAsk: boolean;
  setResetAsk(v: boolean): void;
  doReset(): void;
}

const ALIGN: { id: NonNullable<ElStyle['align']>; title: string; icon: string }[] = [
  { id: 'left', title: 'Align left', icon: 'align-left' }, { id: 'center', title: 'Align centre', icon: 'align-center' },
  { id: 'right', title: 'Align right', icon: 'align-right' }, { id: 'justify', title: 'Justify', icon: 'align-justify' },
];
const VALIGN: { id: NonNullable<ElStyle['valign']>; title: string; icon: string }[] = [
  { id: 'top', title: 'Top', icon: 'align-vertical-justify-start' }, { id: 'center', title: 'Middle', icon: 'align-vertical-justify-center' }, { id: 'bottom', title: 'Bottom', icon: 'align-vertical-justify-end' },
];

function ElementProps({ doc, el, api }: { doc: Design; el: El; api: PropertiesApi }) {
  const s = el.s || {};
  const set = <K extends keyof ElStyle>(k: K, v: ElStyle[K], tag?: string) => api.updSel((x) => { x.s[k] = v; }, [k], tag);
  const num = (k: keyof ElStyle) => (n: number) => api.updSel((x) => { (x.s as Record<string, unknown>)[k] = n; }, [k], k);
  const bp = parseBorder(s.border);
  const setBorder = (p: Partial<ReturnType<typeof parseBorder>>) => api.updSel((x) => {
    const b = Object.assign(parseBorder(x.s.border), p);
    x.s.border = b.st === 'none' || !b.w ? '' : b.w + 'px ' + b.st + ' ' + b.c;
  }, ['border']);
  const title = (el.type === 'text' ? 'Text' : el.type[0].toUpperCase() + el.type.slice(1)) + (pretty(el.role) ? ' · ' + pretty(el.role) : '');
  const hasFill = el.type === 'text' || el.type === 'shape';

  return (
    <div className="ed-pad">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={EL_ICON[el.type]} size={16} style={{ color: 'var(--icon-secondary)' }} />
        <span style={{ flex: 1, minWidth: 0, font: '600 14px/1.3 var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <IconButton icon="x" label="Deselect" size="sm" onClick={api.deselect} />
      </div>
      <div className="ed-row" role="toolbar" aria-label="Element actions">
        <IconButton icon="copy-plus" label="Duplicate (Ctrl/⌘ D)" variant="secondary" size="sm" onClick={api.dupSel} />
        <IconButton icon="bring-to-front" label="Bring forward" variant="secondary" size="sm" onClick={() => api.layer(1)} />
        <IconButton icon="send-to-back" label="Send backward" variant="secondary" size="sm" onClick={() => api.layer(-1)} />
        <IconButton icon="align-center-horizontal" label="Centre horizontally on page" variant="secondary" size="sm" onClick={() => api.updSel((x) => { x.x = Math.round((doc.w - x.w) / 2); }, ['geom'])} />
        <IconButton icon="align-center-vertical" label="Centre vertically on page" variant="secondary" size="sm" onClick={() => api.updSel((x) => { x.y = Math.round((doc.h - x.h) / 2); }, ['geom'])} />
        <IconButton icon="trash-2" label="Delete (Delete key)" variant="secondary" size="sm" onClick={api.deleteSel} />
      </div>

      {el.type === 'text' && (
        <div className="ed-sec">
          <Field label="Text">
            <textarea className="ed-textarea" rows={4} value={el.text || ''} disabled={!!el.auto} onChange={(e) => { const t = e.target.value; api.updSel((x) => { x.text = t; }, ['text'], 'text'); }} />
          </Field>
          {!el.auto && <button type="button" className="ed-link" onClick={() => api.editText(el.id)}><Icon name="text-cursor-input" size={16} />Edit on the canvas</button>}
          <div className="ed-grid2">
            <Field label="Font">
              <select className="ed-select" value={s.font || 'sans'} onChange={(e) => set('font', e.target.value as ElStyle['font'])}><option value="sans">Geist</option><option value="mono">Geist Mono</option></select>
            </Field>
            <Field label="Weight">
              <select className="ed-select" value={String(s.weight || 400)} onChange={(e) => set('weight', +e.target.value)}>
                <option value="400">Regular 400</option><option value="500">Medium 500</option><option value="600">Semibold 600</option><option value="700">Bold 700</option>
              </select>
            </Field>
            <NumberField label="Size px" min={4} max={800} value={s.size} onChange={num('size')} />
            <NumberField label="Line height" min={0.6} max={3} step={0.05} value={s.lh} onChange={num('lh')} />
            <NumberField label="Tracking em" min={-0.2} max={0.5} step={0.005} value={s.ls} onChange={num('ls')} />
            <NumberField label="Padding px" min={0} max={400} value={s.pad || 0} onChange={num('pad')} />
          </div>
          <Over>Alignment</Over>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 4, minWidth: 0 }}><Seg label="Horizontal alignment" value={s.align} onChange={(v) => set('align', v)} options={ALIGN.map((o) => ({ id: o.id, title: o.title, label: <Icon name={o.icon} size={15} /> }))} /></div>
            <div style={{ flex: 3, minWidth: 0 }}><Seg label="Vertical alignment" value={s.valign} onChange={(v) => set('valign', v)} options={VALIGN.map((o) => ({ id: o.id, title: o.title, label: <Icon name={o.icon} size={15} /> }))} /></div>
          </div>
          <div className="ed-row">
            <button type="button" className="ed-toggle" aria-pressed={!!s.upper} onClick={() => set('upper', !s.upper)}>UPPERCASE</button>
            <button type="button" className="ed-toggle" aria-pressed={!!s.italic} onClick={() => set('italic', !s.italic)}>Italic</button>
          </div>
          <Over>Text colour · {s.color || '#1C1A18'}</Over>
          <Swatches label="Text colour" value={s.color} onPick={(hex) => set('color', hex)} custom={{ value: s.color || '#1C1A18', onChange: (hex) => set('color', hex, 'color') }} />
        </div>
      )}

      {hasFill && (
        <div className="ed-sec">
          <Over>Fill · {s.bg && s.bg !== 'transparent' ? s.bg : 'none'}</Over>
          <Swatches label="Fill colour" value={s.bg} onPick={(hex) => set('bg', hex)} noneLabel="No fill" onNone={() => set('bg', '')} custom={{ value: /^#/.test(s.bg || '') ? s.bg! : '#FFFFFF', onChange: (hex) => set('bg', hex, 'bg') }} />
          <div className="ed-grid3" style={{ marginTop: 6 }}>
            <Field label="Border">
              <select className="ed-select" value={bp.st} onChange={(e) => setBorder({ st: e.target.value, w: bp.w || 3 })}>
                <option value="none">None</option><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option>
              </select>
            </Field>
            <NumberField label="Width" min={0} max={60} value={bp.w} onChange={(n) => setBorder({ w: n, st: bp.st === 'none' ? 'solid' : bp.st })} />
            <NumberField label="Radius" min={0} max={9999} value={s.radius || 0} onChange={num('radius')} />
          </div>
          {bp.st !== 'none' && (
            <>
              <span className="ed-hint">Border colour</span>
              <Swatches label="Border colour" value={bp.c} onPick={(hex) => setBorder({ c: hex })} />
            </>
          )}
        </div>
      )}

      {el.type === 'line' && (
        <div className="ed-sec">
          <Over>Record line</Over>
          <Seg label="Line style" value={s.dash} onChange={(v) => set('dash', v)} options={(['dotted', 'dashed', 'solid'] as const).map((k) => ({ id: k, label: k[0].toUpperCase() + k.slice(1) }))} />
          <span className="ed-hint">Dotted = suggested by Hali · dashed = not yet agreed · solid = recorded.</span>
          <NumberField label="Thickness px" min={1} max={80} value={s.thick} onChange={(n) => api.updSel((x) => { x.s.thick = Math.max(1, n); x.h = Math.max(1, n); }, ['thick'], 'thick')} />
          <Swatches label="Line colour" value={s.color} onPick={(hex) => set('color', hex)} custom={{ value: s.color || '#285B57', onChange: (hex) => set('color', hex, 'lcolor') }} />
        </div>
      )}

      {el.type === 'image' && (
        <div className="ed-sec">
          <Over>Image</Over>
          <div className="ed-row">
            <Button variant="secondary" size="sm" iconStart="image-up" onClick={api.pickImage}>{el.src ? 'Replace image' : 'Upload image'}</Button>
            {el.src && <Button variant="ghost" size="sm" onClick={() => api.updSel((x) => { x.src = ''; }, [])}>Remove</Button>}
          </div>
          <span className="ed-hint">Use the agency&apos;s own work only. Empty slots show the brand hatch and export as hatch.</span>
          <Seg label="Image fit" value={s.fit} onChange={(v) => set('fit', v)} options={[{ id: 'cover' as const, label: 'Fill / crop' }, { id: 'contain' as const, label: 'Fit whole image' }]} />
          <NumberField label="Corner radius" min={0} max={9999} value={s.radius || 0} onChange={num('radius')} />
          <Field label={'Darken overlay % · ' + (s.overlay || 0)}>
            <input type="range" min={0} max={80} value={s.overlay || 0} onChange={(e) => set('overlay', +e.target.value, 'overlay')} />
          </Field>
        </div>
      )}

      {el.type === 'logo' && (
        <div className="ed-sec">
          <Field label="Logo">
            <select className="ed-select" value={el.logo} onChange={(e) => { const v = e.target.value as LogoVariant; api.updSel((x) => { x.logo = v; x.w = Math.round(x.h * (LOGO[v] || LOGO.lockup).ratio); }, ['logo', 'geom']); }}>
              <option value="lockup">Horizontal lockup</option><option value="stacked">Stacked lockup</option><option value="wordmark">Wordmark</option><option value="symbol">Symbol</option><option value="appicon">App icon (full bleed)</option>
            </select>
          </Field>
          <Field label="Tone">
            <select className="ed-select" value={el.tone} onChange={(e) => { const v = e.target.value; api.updSel((x) => { x.tone = v; }, ['logo']); }}>
              <option value="default">Default (light backgrounds)</option><option value="reverse">Reverse (dark backgrounds)</option><option value="mono">Mono</option><option value="ink">Ink symbol</option><option value="sea">Deep Sea symbol</option>
            </select>
          </Field>
          <span className="ed-hint">Keep clear space equal to the folded corner. Minimum: symbol 16px, lockup 20px tall.</span>
        </div>
      )}

      <div className="ed-sec">
        <Over>Position &amp; size</Over>
        <div className="ed-grid3">
          {([['X', 'x', 1], ['Y', 'y', 1], ['W', 'w', 1], ['H', 'h', 1], ['Rotate °', 'rot', 1], ['Opacity', 'opacity', 0.05]] as const).map(([label, k, step]) => (
            <NumberField
              key={k}
              label={label}
              step={step}
              value={k === 'opacity' ? (s.opacity ?? 1) : ((el[k] as number) || 0)}
              onChange={(n) => api.updSel((x) => { if (k === 'opacity') x.s.opacity = Math.max(0, Math.min(1, n)); else x[k] = Math.round(n); }, k === 'opacity' ? ['opacity'] : ['geom'], 'g' + k)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** The design's year plus the years around today, for the Year select. */
const yearOptions = (cur?: string) => {
  const now = new Date().getFullYear();
  const ys = new Set([now - 1, now, now + 1, now + 2, now + 3].map(String));
  if (cur) ys.add(cur);
  return [...ys].sort();
};

function DesignProps({ doc, page, pi, api }: { doc: Design; page: Page; pi: number; api: PropertiesApi }) {
  const cat = CAT[doc.cat];
  const tmpl = findTemplate(doc.cat, doc.tpl);
  const bg = pageBgOf(page);
  const fields = page.els.filter((x) => x.type === 'text' && !x.auto && x.text);
  return (
    <div className="ed-pad" style={{ gap: 16 }}>
      <div className="ed-sec">
        <Over>Design</Over>
        <span className="ed-hint" style={{ fontSize: 13 }}>{cat.name} · {tmpl ? tmpl.name : doc.tpl}</span>
        <Field label="Size">
          <select className="ed-select" value={doc.fmt} onChange={(e) => api.onFormat(e.target.value)}>
            {cat.formats.map((id) => <option key={id} value={id}>{FMT[id].name} · {FMT[id].w}×{FMT[id].h}</option>)}
          </select>
        </Field>
        <Over>Colour scheme</Over>
        <Seg
          label="Colour scheme"
          value={doc.scheme}
          onChange={api.onScheme}
          options={(Object.keys(SCHEMES) as SchemeId[]).map((id) => ({
            id, label: <><span style={{ width: 12, height: 12, borderRadius: 3, background: SCHEMES[id].bg, border: '1px solid var(--border-strong)' }} />{SCHEMES[id].name}</>,
          }))}
        />
        {(doc.vars?.month !== undefined || doc.vars?.year !== undefined) && (
          <div className="ed-grid2">
            {doc.vars?.month !== undefined && (
              <Field label="Month">
                <select className="ed-select" value={doc.vars.month} onChange={(e) => api.setVars({ month: e.target.value })}>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            )}
            {doc.vars?.year !== undefined && (
              <Field label="Year">
                <select className="ed-select" value={doc.vars.year} onChange={(e) => api.setVars({ year: e.target.value })}>
                  {yearOptions(doc.vars.year).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
            )}
          </div>
        )}
        <span className="ed-hint">Changing size or scheme re-flows the layout and keeps your edited text, images and colours.</span>
      </div>
      <div className="ed-sec">
        <Over>Page {String(pi + 1).padStart(2, '0')}</Over>
        <input className="ed-input" aria-label="Page name" value={page.name} onChange={(e) => api.setPageName(e.target.value)} />
        <span className="ed-hint">Background · {bg}</span>
        <Swatches label="Page background" value={bg} onPick={api.setPageBg} custom={{ value: /^#[0-9a-f]{6}$/i.test(bg) ? bg : '#FFFFFF', onChange: api.setPageBg }} />
      </div>
      <div className="ed-sec">
        <Over>Elements on this page · tap to edit</Over>
        <div role="list">
          {page.els.slice().reverse().map((x) => (
            <div key={x.id} role="listitem" className="ed-layer">
              <button type="button" className="ed-layer-btn" data-hidden={x.hidden || undefined} onClick={() => api.selectEl(x.id)}>
                <Icon name={EL_ICON[x.type]} size={14} />
                <span>{x.type === 'text' ? (x.auto ? 'Page number' : (x.text || '').slice(0, 48) || pretty(x.role) || 'Text') : (pretty(x.role) || x.type[0].toUpperCase() + x.type.slice(1)) + (x.type === 'logo' ? ' · ' + x.logo : '')}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="ed-sec" style={{ gap: 10 }}>
        <Over>Content on this page</Over>
        {fields.map((x) => (
          <label key={x.id} className="ed-field" style={{ gap: 4 }}>
            <span style={{ font: '500 12px/1.2 var(--font-sans)', color: 'var(--text-secondary)' }}>{pretty(x.role) || 'Text'}</span>
            <textarea className="ed-textarea" rows={Math.min(5, Math.max(1, Math.ceil((x.text || '').length / 34)))} value={x.text} onChange={(e) => { const t = e.target.value; api.updEl(x.id, (y) => { y.text = t; }, ['text'], 'text' + x.id); }} />
          </label>
        ))}
        <span className="ed-hint" style={{ color: 'var(--text-tertiary)' }}>Template copy is illustrative. Replace [bracketed] items with confirmed facts.</span>
      </div>
      <div className="ed-sec">
        {!api.resetAsk ? (
          <Button variant="secondary" size="sm" iconStart="rotate-ccw" onClick={() => api.setResetAsk(true)} style={{ alignSelf: 'flex-start' }}>Reset template</Button>
        ) : (
          <>
            <span className="ed-hint" style={{ fontSize: 13 }}>This replaces every page with the original template at the current size. You can undo it.</span>
            <div className="ed-row">
              <Button variant="danger" size="sm" onClick={api.doReset}>Reset to original</Button>
              <Button variant="ghost" size="sm" onClick={() => api.setResetAsk(false)}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PropertiesPanel({ doc, pi, el, api }: { doc: Design; pi: number; el: El | null; api: PropertiesApi }) {
  return el ? <ElementProps doc={doc} el={el} api={api} /> : <DesignProps doc={doc} page={doc.pages[pi]} pi={pi} api={api} />;
}
