'use client';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

const PAD = { none: 0, sm: 12, md: 16, lg: 24 } as const;

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  variant?: 'outlined' | 'subtle' | 'raised';
  padding?: keyof typeof PAD;
  onClick?: () => void;
  as?: 'section' | 'article' | 'div';
  className?: string;
  style?: CSSProperties;
}

export function Card({ title, description, actions, footer, children, variant = 'outlined', padding = 'md', onClick, as: Tag = 'section', className, style }: CardProps) {
  const pad = PAD[padding];
  const hp = pad || 16;
  const interactive = !!onClick;
  return (
    <Tag
      className={'hds-card' + (className ? ' ' + className : '')}
      data-variant={variant}
      data-interactive={interactive || undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}
      style={style}
    >
      {(title || actions) && (
        <div className="hds-card-head" style={{ padding: `${hp}px ${hp}px ${pad === 0 ? 12 : 0}px` }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {title && <h3 className="hds-card-title">{title}</h3>}
            {description && <p className="hds-card-desc">{description}</p>}
          </div>
          {actions && <div className="hds-card-actions">{actions}</div>}
        </div>
      )}
      <div className="hds-card-body" style={{ padding: pad }}>{children}</div>
      {footer && <footer className="hds-card-foot" style={{ padding: `12px ${hp}px` }}>{footer}</footer>}
    </Tag>
  );
}
