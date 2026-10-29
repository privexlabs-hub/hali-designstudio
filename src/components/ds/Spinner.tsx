import type { CSSProperties } from 'react';

export function Spinner({ size = 18, label = 'Loading', style }: { size?: number; label?: string; style?: CSSProperties }) {
  return <span className="hds-spinner" role="status" aria-label={label} style={{ width: size, height: size, ...style }} />;
}

export function Skeleton({ width = '100%', height = 14, radius = 4, style }: { width?: number | string; height?: number | string; radius?: number; style?: CSSProperties }) {
  return <span className="hds-skeleton" aria-hidden style={{ width, height, borderRadius: radius, ...style }} />;
}
