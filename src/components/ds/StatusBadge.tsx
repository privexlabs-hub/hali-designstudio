import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type BadgeTone = 'neutral' | 'info' | 'attention' | 'error' | 'success';

export interface StatusBadgeProps {
  tone?: BadgeTone;
  icon?: string;
  children?: ReactNode;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function StatusBadge({ tone = 'neutral', icon, children, size = 'md', style }: StatusBadgeProps) {
  const c = tone === 'neutral'
    ? { background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }
    : { background: `var(--${tone}-bg)`, color: `var(--${tone}-fg)` };
  return (
    <span className="hds-badge" data-size={size} data-tone={tone} style={{ ...c, ...style }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
}
