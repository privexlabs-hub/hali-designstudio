'use client';
import type { CSSProperties, MouseEventHandler } from 'react';
import { Icon } from './Icon';

export interface IconButtonProps {
  icon: string;
  label: string;
  variant?: 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  pressed?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
}

export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled, pressed, onClick, className, style }: IconButtonProps) {
  return (
    <button
      type="button"
      className={'hds-ibtn' + (className ? ' ' + className : '')}
      data-variant={variant}
      data-size={size}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 18} />
    </button>
  );
}
