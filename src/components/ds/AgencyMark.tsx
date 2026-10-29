import type { CSSProperties } from 'react';

export interface AgencyMarkProps {
  name?: string;
  logoSrc?: string;
  color?: string;
  size?: number;
  showName?: boolean;
  nameStyle?: CSSProperties;
  style?: CSSProperties;
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function AgencyMark({ name = 'Agency', logoSrc, color = 'var(--logo-ink)', size = 40, showName = false, nameStyle, style }: AgencyMarkProps) {
  return (
    <span className="hds-agency" style={{ gap: Math.round(size * 0.3), ...style }}>
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoSrc} alt={`${name} logo`} height={size} style={{ height: size, width: 'auto', maxWidth: size * 4, objectFit: 'contain' }} />
      ) : (
        <span
          className="hds-agency-tile"
          role={showName ? undefined : 'img'}
          aria-label={showName ? undefined : name}
          aria-hidden={showName || undefined}
          style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: color, fontSize: Math.round(size * 0.38) }}
        >
          {initials(name)}
        </span>
      )}
      {showName && <span className="hds-agency-name" style={{ fontSize: Math.max(14, Math.round(size * 0.42)), ...nameStyle }}>{name}</span>}
    </span>
  );
}
