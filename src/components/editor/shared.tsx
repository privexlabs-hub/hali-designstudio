'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconButton } from '@/components/ds';

/* Small building blocks shared by both editors' panels and dialogs. */

export const SWATCHES: [string, string][] = [
  ['Ink', '#1C1A18'], ['Paper', '#FBFAF7'], ['White', '#FFFFFF'], ['Sand n-50', '#F5F3EE'], ['Stone n-200', '#DDD9D0'], ['Grey n-500', '#736D65'], ['Grey n-600', '#5C5751'],
  ['Deep Sea', '#285B57'], ['Sea 700', '#1E4744'], ['Sea 300', '#86B9B3'], ['Sea 100', '#D3E6E3'], ['Blue 500 (proposed)', '#3462B8'], ['Amber 500 (awaiting)', '#C98A12'], ['Green 500 (success)', '#3A8A4A'], ['Red 500 (problem)', '#C2412D'],
];

export function Over({ children }: { children: ReactNode }) {
  return <span className="ed-over">{children}</span>;
}

export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return <label className="ed-field"><span className="ed-over">{label}</span>{children}</label>;
}

/**
 * Number input with a text draft (so partial input such as "-" or "0." is never thrown away) and, on touch
 * screens, − / + steppers: they allow negative values on phone keypads that have no minus key, and hold to repeat.
 */
export function NumberField({ label, value, onChange, min, max, step = 1 }: { label: ReactNode; value: number | undefined; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  const [draft, setDraft] = useState<string | null>(null);
  const latest = useRef(value ?? 0);
  latest.current = value ?? 0;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const decimals = (String(step).split('.')[1] || '').length;
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const bump = (dir: 1 | -1) => {
    const n = clamp(+(latest.current + dir * step).toFixed(decimals));
    latest.current = n;
    onChange(n);
  };
  const stop = () => clearTimeout(timer.current);
  const hold = (dir: 1 | -1) => {
    bump(dir);
    let delay = 380;
    const again = () => { bump(dir); delay = Math.max(60, delay * 0.8); timer.current = setTimeout(again, delay); };
    timer.current = setTimeout(again, delay);
  };
  useEffect(() => stop, []);
  const stepper = (dir: 1 | -1) => (
    <button
      type="button"
      className="ed-step"
      aria-label={(dir < 0 ? 'Decrease ' : 'Increase ') + (typeof label === 'string' ? label : 'value')}
      onPointerDown={(e) => { e.preventDefault(); hold(dir); }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bump(dir); } }}
    >
      {dir < 0 ? '−' : '+'}
    </button>
  );
  return (
    <Field label={label}>
      <span className="ed-num">
        {stepper(-1)}
        <input
          className="ed-input"
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          value={draft ?? (value ?? '')}
          onFocus={(e) => { setDraft(String(value ?? '')); e.currentTarget.select(); }}
          onChange={(e) => {
            const t = e.target.value.replace(',', '.').replace(/[^0-9.-]/g, '');
            setDraft(t);
            const n = parseFloat(t);
            if (!isNaN(n) && /^-?\d*\.?\d*$/.test(t)) onChange(clamp(n));
          }}
          onBlur={() => setDraft(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setDraft(null); bump(e.key === 'ArrowUp' ? 1 : -1); }
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
        {stepper(1)}
      </span>
    </Field>
  );
}

export interface SegOption<T extends string | number> { id: T; label?: ReactNode; title?: string }
export function Seg<T extends string | number>({ label, options, value, onChange }: { label: string; options: SegOption<T>[]; value: T | undefined; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="ed-seg">
      {options.map((o) => (
        <button key={String(o.id)} type="button" title={o.title} aria-label={o.title} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label ?? String(o.id)}</button>
      ))}
    </div>
  );
}

export function Swatches({ value, onPick, custom, noneLabel, onNone, label }: {
  value: string | undefined; onPick: (hex: string) => void; custom?: { value: string; onChange: (hex: string) => void }; noneLabel?: string; onNone?: () => void; label: string;
}) {
  const cur = (value || '').toUpperCase();
  return (
    <div className="ed-swatches" role="group" aria-label={label}>
      {onNone && <button type="button" className="ed-swatch" data-none="" title={noneLabel || 'None'} aria-label={noneLabel || 'None'} aria-pressed={!value || value === 'transparent'} onClick={onNone} />}
      {SWATCHES.map(([name, hex]) => (
        <button key={hex} type="button" className="ed-swatch" title={name + ' ' + hex} aria-label={name + ' ' + hex} aria-pressed={cur === hex} style={{ background: hex }} onClick={() => onPick(hex)} />
      ))}
      {custom && <input type="color" className="ed-color" value={custom.value} onChange={(e) => custom.onChange(e.target.value)} aria-label={'Custom ' + label.toLowerCase()} />}
    </div>
  );
}

/** Drag handle for a bottom sheet: drag to resize between snap points, drag down to close. */
export function SheetHandle({ sheetRef, onClose }: { sheetRef: React.RefObject<HTMLElement | null>; onClose: () => void }) {
  const st = useRef<{ y: number; h: number; id: number } | null>(null);
  const snap = (h: number) => {
    const vh = window.innerHeight;
    const pts = [0.45 * vh, 0.9 * vh];
    return pts.reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a));
  };
  return (
    <div
      className="ed-sheet-handle"
      role="separator"
      aria-label="Drag to resize panel"
      onPointerDown={(e) => {
        const el = sheetRef.current;
        if (!el) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        st.current = { y: e.clientY, h: el.getBoundingClientRect().height, id: e.pointerId };
      }}
      onPointerMove={(e) => {
        const s = st.current, el = sheetRef.current;
        if (!s || !el || s.id !== e.pointerId) return;
        el.style.setProperty('--sheet-h', Math.max(80, s.h + (s.y - e.clientY)) + 'px');
      }}
      onPointerUp={(e) => {
        const s = st.current, el = sheetRef.current;
        st.current = null;
        if (!s || !el) return;
        const h = s.h + (s.y - e.clientY);
        if (h < window.innerHeight * 0.22) { el.style.removeProperty('--sheet-h'); onClose(); return; }
        el.style.setProperty('--sheet-h', snap(h) + 'px');
      }}
      onPointerCancel={() => { st.current = null; }}
      onDoubleClick={() => { const el = sheetRef.current; if (!el) return; const tall = el.getBoundingClientRect().height > window.innerHeight * 0.6; el.style.setProperty('--sheet-h', (tall ? 0.45 : 0.9) * window.innerHeight + 'px'); }}
    />
  );
}

/** Modal dialog with focus management, Escape to close and a scrim. `sheet` docks it to the bottom on phones. */
export function Dialog({ label, title, onClose, children, maxWidth, sheet, height, actions, compactTitle }: {
  label: string; title: ReactNode; onClose: () => void; children: ReactNode; maxWidth: number; sheet?: boolean; height?: string; actions?: ReactNode; compactTitle?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const n = ref.current;
    n?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab' || !n) return;
      const f = [...n.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.({ preventScroll: true }); };
  }, [onClose]);
  return (
    <div className="ed-scrim" data-sheet={sheet || undefined} onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="ed-dialog" style={{ maxWidth, height }}>
        <div className="ed-dialog-head">
          <h2 className="ed-dialog-title" data-compact={compactTitle || undefined}>{title}</h2>
          {actions}
          <IconButton icon="x" label="Close" size="sm" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
