'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ds';

export interface MenuItem { label: string; icon?: string; onSelect: () => void; disabled?: boolean }

/** Small popover menu (keyboard + outside-click aware). The trigger is rendered by `trigger`. */
export function Menu({ items, trigger, align = 'end', label }: {
  items: MenuItem[];
  trigger: (p: { open: boolean; toggle: () => void; id: string }) => ReactNode;
  align?: 'start' | 'end';
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    ref.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const els = [...(ref.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])];
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
  };
  return (
    <div ref={ref} className="st-menu-anchor">
      {trigger({ open, toggle: () => setOpen(!open), id })}
      {open && (
        <div role="menu" id={id} aria-label={label} className="st-pop" data-align={align} onKeyDown={onKey}>
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" className="st-pop-item" disabled={it.disabled} onClick={() => { setOpen(false); it.onSelect(); }}>
              {it.icon && <Icon name={it.icon} size={16} />}
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
