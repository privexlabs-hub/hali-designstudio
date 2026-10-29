'use client';
import { useId, type CSSProperties, type ReactNode } from 'react';

export interface CheckboxProps {
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  style?: CSSProperties;
}

export function Checkbox({ id, label, description, checked, defaultChecked, disabled, onChange, style }: CheckboxProps) {
  const auto = useId();
  const cid = id || auto;
  return (
    <label htmlFor={cid} className="hds-check" data-disabled={disabled || undefined} style={style}>
      <input
        id={cid}
        type="checkbox"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {(label || description) && (
        <span className="hds-check-text">
          {label && <span className="hds-check-label">{label}</span>}
          {description && <span className="hds-check-desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
