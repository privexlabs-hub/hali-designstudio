'use client';
import { Alert, Button, Icon } from '@/components/ds';
import { Dialog, Over, Seg } from './shared';

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'json';
export type ExportScope = 'page' | 'all' | 'sizes' | 'designs';
export interface ExportSettings { format: ExportFormat; scale: 1 | 2 | 3; quality: number; scope: ExportScope }
export interface ScopeOption { id: ExportScope; label: string; meta: string }

const FORMATS: [ExportFormat, string, string][] = [['png', 'PNG', 'Lossless'], ['jpg', 'JPEG', 'Smaller'], ['svg', 'SVG', 'Vector wrap'], ['json', 'Design', 'Editable file']];
export const FORMAT_NOTES: Record<ExportFormat, string> = {
  png: 'Lossless, keeps exact brand colours. Best for social and web.',
  jpg: 'Smaller files with no transparency. Background uses the page colour.',
  svg: 'Vector wrapper with embedded fonts. Opens in browsers; design tools may not support embedded HTML text.',
  json: 'Editable design file. Re-open it here with Import design file.',
};

export function ExportDialog({ exp, setExp, scopes, scope, w, h, filename, exporting, done, msg, cta, onRun, onShare, shareReady, onImport, onClose }: {
  exp: ExportSettings;
  setExp: (p: Partial<ExportSettings>) => void;
  scopes: ScopeOption[];
  scope: ExportScope;
  w: number;
  h: number;
  filename: string;
  exporting: boolean;
  done: boolean;
  msg: { tone: 'success' | 'error'; text: string } | null;
  cta: string;
  onRun: () => void;
  /** Present when the device can share files (Save to Photos, Instagram, WhatsApp…). */
  onShare?: () => void;
  shareReady?: boolean;
  onImport: (f: File) => void;
  onClose: () => void;
}) {
  const raster = exp.format === 'png' || exp.format === 'jpg';
  return (
    <Dialog label="Export" title="Export" onClose={onClose} maxWidth={520} sheet>
      <div className="ed-dialog-body" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="ed-sec">
          <Over>Format</Over>
          <div role="radiogroup" aria-label="Format" className="ed-choices" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))' }}>
            {FORMATS.map(([id, label, hint]) => (
              <button key={id} type="button" role="radio" aria-checked={exp.format === id} className="ed-choice" onClick={() => setExp({ format: id })}>
                <span className="ed-choice-t">{label}</span><span className="ed-choice-h">{hint}</span>
              </button>
            ))}
          </div>
        </div>
        {raster && (
          <div className="ed-sec">
            <Over>Resolution</Over>
            <Seg label="Resolution" value={exp.scale} onChange={(n) => setExp({ scale: n })} options={([1, 2, 3] as const).map((n) => ({ id: n, label: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{n}× · {w * n}×{h * n}</span> }))} />
          </div>
        )}
        {raster && w * h * exp.scale * exp.scale > 40e6 && (
          <span className="ed-hint" role="note">At {exp.scale}× each page is {Math.round((w * h * exp.scale * exp.scale) / 1e6)} megapixels. On a phone, 1× or 2× exports more reliably.</span>
        )}
        {exp.format === 'jpg' && (
          <label className="ed-field">
            <span className="ed-over">JPEG quality · {exp.quality}%</span>
            <input type="range" min={50} max={100} value={exp.quality} onChange={(e) => setExp({ quality: +e.target.value })} />
          </label>
        )}
        <div className="ed-sec">
          <Over>What to export</Over>
          <div role="radiogroup" aria-label="Scope" className="ed-choices">
            {scopes.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={scope === o.id} className="ed-choice ed-choice-row" onClick={() => setExp({ scope: o.id })}>
                <span style={{ font: '500 13px/1.3 var(--font-sans)' }}>{o.label}</span><span className="ed-choice-m">{o.meta}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="ed-file">
          <span className="ed-over" style={{ fontSize: 11 }}>File</span>
          <span className="ed-file-name">{filename}</span>
          <span className="ed-hint">{FORMAT_NOTES[exp.format]}</span>
        </div>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <label className="ed-link" style={{ alignSelf: 'flex-start' }}>
          <Icon name="file-up" size={16} />Import design file
          <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onImport(f); }} />
        </label>
      </div>
      <div className="ed-dialog-foot">
        {onShare && (
          <Button variant="secondary" iconStart="share-2" disabled={exporting} onClick={onShare}>{shareReady ? 'Share now' : 'Share or save to phone'}</Button>
        )}
        <Button variant="commit" iconStart="download" loading={exporting} success={done} onClick={onRun}>{cta}</Button>
      </div>
    </Dialog>
  );
}
