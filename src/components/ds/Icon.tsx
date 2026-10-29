import type { CSSProperties } from 'react';
import { ICONS } from './icon-registry';

export interface IconProps {
  /** Lucide icon name (`pen-tool`); an `icon-` prefix is accepted and stripped. */
  name: string;
  size?: number;
  label?: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function iconName(name: string): string {
  return name.startsWith('icon-') ? name.slice(5) : name;
}

export function Icon({ name, size = 18, label, color, className, style }: IconProps) {
  const Glyph = ICONS[iconName(name)];
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <i
      className={'hds-icon' + (className ? ' ' + className : '')}
      data-icon={iconName(name)}
      {...a11y}
      style={{ width: size, height: size, fontSize: size, color: color || 'currentColor', ...style }}
    >
      {Glyph ? <Glyph size={size} strokeWidth={2} absoluteStrokeWidth={false} /> : null}
    </i>
  );
}
