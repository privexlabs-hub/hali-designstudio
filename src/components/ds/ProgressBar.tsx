import type { CSSProperties } from 'react';

const FILL = { neutral: 'var(--n-800)', success: 'var(--success-icon)', error: 'var(--error-icon)', accent: 'var(--sea-600)' } as const;

export interface ProgressBarProps {
  value?: number | null;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: keyof typeof FILL;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function ProgressBar({ value, max = 100, label, showValue = true, tone = 'neutral', size = 'md', style }: ProgressBarProps) {
  const indeterminate = value == null;
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="hds-progress" style={style}>
      {(label || (showValue && !indeterminate)) && (
        <div className="hds-progress-head">
          <span>{label}</span>
          {showValue && !indeterminate && <span className="tabular">{pct}%</span>}
        </div>
      )}
      <div
        className="hds-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        style={{ height: size === 'sm' ? 4 : 6 }}
      >
        <span className="hds-progress-fill" data-indeterminate={indeterminate || undefined} style={{ background: FILL[tone], width: indeterminate ? undefined : pct + '%' }} />
      </div>
    </div>
  );
}
