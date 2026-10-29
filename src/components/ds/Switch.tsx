'use client';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface SwitchProps {
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function Switch({ id, label, description, checked = false, disabled = false, onChange, size = 'md', style }: SwitchProps) {
  const auto = useId();
  const sid = id || auto;
  // Touch screens get a thumb-sized switch (44px wide target).
  const coarse = useMediaQuery('(pointer: coarse)');
  const [w, h] = coarse ? [52, 32] : size === 'sm' ? [32, 18] : [40, 22];
  const k = h - 6;
  return (
    <div className="hds-switch" style={style}>
      {(label || description) && (
        <label htmlFor={sid} className="hds-check-text" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {label && <span className="hds-check-label" style={disabled ? { color: 'var(--text-disabled)' } : undefined}>{label}</span>}
          {description && <span className="hds-check-desc">{description}</span>}
        </label>
      )}
      {/* The button is the touch target (at least 44px on touch screens); the visible track sits inside it. */}
      <button
        id={sid}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className="hds-switch-btn"
        onClick={() => onChange?.(!checked)}
        style={coarse ? { minWidth: 44, minHeight: 44 } : undefined}
      >
        <span className="hds-switch-track" aria-hidden style={{ width: w, height: h, borderRadius: h }}>
          <span className="hds-switch-knob" style={{ width: k, height: k, left: checked ? w - k - 3 : 3 }} />
        </span>
      </button>
    </div>
  );
}
