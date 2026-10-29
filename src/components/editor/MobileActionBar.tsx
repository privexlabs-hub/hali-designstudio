'use client';
import { Icon } from '@/components/ds';

export interface ActionItem { icon: string; label: string; onClick: () => void; disabled?: boolean; primary?: boolean }

/** Touch toolbar for the current selection, shown above the tab bar on phones and small tablets. */
export function MobileActionBar({ label, items }: { label: string; items: ActionItem[] }) {
  return (
    <div className="ed-actionbar" role="toolbar" aria-label={label} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <button key={it.label} type="button" className="ed-action" data-primary={it.primary || undefined} disabled={it.disabled} onClick={it.onClick}>
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
