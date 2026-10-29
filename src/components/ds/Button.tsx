'use client';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'commit' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ForceState = 'default' | 'hover' | 'pressed' | 'focus';

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: string;
  iconEnd?: string;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  ariaLabel?: string;
  forceState?: ForceState;
  className?: string;
  style?: CSSProperties;
  /** Render as a link (same visuals). */
  href?: string;
  download?: string | boolean;
}

const IC: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 18 };

export function Button({
  children, variant = 'secondary', size = 'md', iconStart, iconEnd, loading = false, success = false,
  disabled = false, fullWidth = false, type = 'button', onClick, title, ariaLabel, forceState, className, style, href, download,
}: ButtonProps) {
  const inert = disabled || loading;
  const ic = IC[size];
  const lead = loading
    ? <span className="hds-btn-spin" aria-hidden style={{ width: ic - 2, height: ic - 2 }} />
    : success ? <Icon name="check" size={ic} /> : iconStart ? <Icon name={iconStart} size={ic} /> : null;
  const content = (
    <>
      {lead}
      {children != null && children !== '' && <span>{children}</span>}
      {iconEnd && !loading && !success && <Icon name={iconEnd} size={ic} />}
    </>
  );
  const common = {
    className: 'hds-btn' + (className ? ' ' + className : ''),
    'data-variant': variant,
    'data-size': size,
    'data-full': fullWidth || undefined,
    'data-inert': inert || undefined,
    'data-force': forceState && forceState !== 'default' ? forceState : undefined,
    title,
    'aria-label': ariaLabel,
    'aria-busy': loading || undefined,
    style,
  };
  if (href && !inert) {
    return <a {...common} href={href} download={download === true ? '' : download || undefined}>{content}</a>;
  }
  return (
    <button {...common} type={type} disabled={disabled} aria-disabled={loading || undefined} onClick={inert ? undefined : onClick}>
      {content}
    </button>
  );
}
