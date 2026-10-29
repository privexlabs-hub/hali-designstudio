'use client';
import { useId, type CSSProperties, type KeyboardEvent, type ReactNode, type ChangeEvent } from 'react';
import { Icon } from './Icon';

export interface FieldProps {
  id: string;
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Field({ id, label, help, error, required, optional, children, style }: FieldProps) {
  return (
    <div className="hds-field" style={style}>
      {label && (
        <label htmlFor={id} className="hds-field-label">
          {label}
          {optional && <span className="hds-field-opt">Optional</span>}
          {required && <span className="hds-field-opt" aria-hidden>Required</span>}
        </label>
      )}
      {help && <div id={id + '-help'} className="hds-field-help">{help}</div>}
      {children}
      {error && (
        <div id={id + '-error'} className="hds-field-error" role="alert">
          <Icon name="circle-alert" size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export interface TextInputProps {
  id?: string;
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  valid?: boolean;
  required?: boolean;
  optional?: boolean;
  multiline?: boolean;
  rows?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  forceState?: 'default' | 'hover' | 'focus';
  style?: CSSProperties;
}

export function TextInput(p: TextInputProps) {
  const auto = useId();
  const id = p.id || auto;
  const describedBy = [p.help ? id + '-help' : '', p.error ? id + '-error' : ''].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    value: p.value,
    defaultValue: p.value === undefined ? p.defaultValue : undefined,
    placeholder: p.placeholder,
    maxLength: p.maxLength,
    disabled: p.disabled,
    readOnly: p.readOnly,
    autoComplete: p.autoComplete,
    'aria-invalid': p.error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': p.required || undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => p.onChange?.(e.target.value, e),
    onKeyDown: p.onKeyDown,
  };
  return (
    <Field id={id} label={p.label} help={p.help} error={p.error} required={p.required} optional={p.optional} style={p.style}>
      <div
        className="hds-input"
        data-multiline={p.multiline || undefined}
        data-error={p.error ? '' : undefined}
        data-disabled={p.disabled || undefined}
        data-readonly={p.readOnly || undefined}
        data-force={p.forceState && p.forceState !== 'default' ? p.forceState : undefined}
      >
        {p.prefix && <span className="hds-input-prefix">{p.prefix}</span>}
        {p.multiline
          ? <textarea {...common} rows={p.rows ?? 4} />
          : <input {...common} type={p.type || 'text'} inputMode={p.inputMode} style={p.prefix ? { fontVariantNumeric: 'tabular-nums' } : undefined} />}
        {p.suffix && <span className="hds-input-suffix">{p.suffix}</span>}
        {p.valid && !p.error && <span className="hds-input-valid"><Icon name="check" size={16} label="Looks good" /></span>}
      </div>
    </Field>
  );
}
