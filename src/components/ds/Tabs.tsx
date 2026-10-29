'use client';
import { useRef, type CSSProperties, type KeyboardEvent } from 'react';

export interface TabItem { id: string; label: string; count?: number; attention?: boolean }

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  label?: string;
  style?: CSSProperties;
}

export function Tabs({ items, value, onChange, label, style }: TabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const i = items.findIndex((t) => t.id === value);
    let n = -1;
    if (e.key === 'ArrowRight') n = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = items.length - 1;
    if (n < 0) return;
    e.preventDefault();
    onChange?.(items[n].id);
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[n]?.focus();
  };
  return (
    <div ref={ref} role="tablist" aria-label={label} className="hds-tabs" style={style} onKeyDown={onKey}>
      {items.map((t) => {
        const sel = t.id === value;
        return (
          <button key={t.id} type="button" role="tab" aria-selected={sel} tabIndex={sel ? 0 : -1} className="hds-tab" onClick={() => onChange?.(t.id)}>
            {t.label}
            {t.count != null && <span className="hds-tab-count" data-attention={t.attention || undefined}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
