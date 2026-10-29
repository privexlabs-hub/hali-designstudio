import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type AlertTone = 'info' | 'attention' | 'error' | 'success' | 'neutral';
const ICON: Record<AlertTone, string> = { info: 'info', attention: 'circle-dot', error: 'circle-alert', success: 'circle-check', neutral: 'info' };

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function Alert({ tone = 'info', title, children, action, onDismiss, className, style }: AlertProps) {
  return (
    <div className={'hds-alert' + (className ? ' ' + className : '')} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'} style={style}>
      <Icon name={ICON[tone]} size={18} className="hds-alert-icon" />
      <div className="hds-alert-body">
        {title && <div className="hds-alert-title">{title}</div>}
        {children && <div className="hds-alert-text">{children}</div>}
        {action && <div className="hds-alert-actions">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="hds-alert-dismiss" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
