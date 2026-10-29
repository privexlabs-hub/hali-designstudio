import type { CSSProperties } from 'react';
import { initials } from './AgencyMark';

const PX = { sm: 24, md: 32, lg: 40, xl: 56 } as const;
const PALETTE = ['#3B4A3F', '#2A3A6B', '#6B3A2A', '#4A3B6B', '#2F5D62', '#6B5A2A'];

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: keyof typeof PX;
  kind?: 'person' | 'client' | 'org';
  status?: 'active' | 'pending';
  style?: CSSProperties;
}

export function Avatar({ name = '', src, size = 'md', kind = 'person', status, style }: AvatarProps) {
  const px = PX[size];
  const bg = name ? PALETTE[(name.charCodeAt(0) + name.length) % PALETTE.length] : PALETTE[0];
  const client = kind === 'client';
  return (
    <span className="hds-avatar" role="img" aria-label={name + (status ? ', ' + status : '')} style={style}>
      <span
        className="hds-avatar-in"
        aria-hidden
        style={{
          width: px, height: px, fontSize: Math.round(px * 0.4), borderRadius: kind === 'org' ? Math.round(px * 0.22) : '50%',
          background: client ? 'var(--surface-sunken)' : bg, color: client ? 'var(--text-primary)' : undefined,
          border: client ? '1px solid var(--border-default)' : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt="" /> : initials(name)}
      </span>
      {status && (
        <span className="hds-avatar-dot" style={{ width: Math.max(8, px * 0.28), height: Math.max(8, px * 0.28), background: status === 'pending' ? 'var(--amber-500)' : 'var(--sea-600)' }} />
      )}
    </span>
  );
}
