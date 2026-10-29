import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export interface EmptyStateProps {
  icon?: string;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  style?: CSSProperties;
}

export function EmptyState({ icon = 'inbox', title, children, action, compact = false, style }: EmptyStateProps) {
  return (
    <div className="hds-empty" data-compact={compact || undefined} style={style}>
      <span className="hds-empty-disc"><Icon name={icon} size={18} /></span>
      {title && <h3 className="hds-empty-title">{title}</h3>}
      {children && <p className="hds-empty-body">{children}</p>}
      {action && <div className="hds-empty-actions">{action}</div>}
    </div>
  );
}
