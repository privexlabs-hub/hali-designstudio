import type { CSSProperties } from 'react';

export type LogoVariant = 'lockup' | 'wordmark' | 'symbol' | 'stacked';
export type LogoTone = 'default' | 'ink' | 'reverse' | 'mono' | 'mono-reverse';

export interface LogoProps {
  variant?: LogoVariant;
  /** Omit to follow the UI theme (default on light, reverse on dark) via CSS. */
  tone?: LogoTone;
  height?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

const TILE = 'M14 0H44L64 20V50A14 14 0 0 1 50 64H14A14 14 0 0 1 0 50V14A14 14 0 0 1 14 0Z';
const FLAP = 'M44 0V14A6 6 0 0 0 50 20H64Z';
const H = 'M22 16V52M22 40A10 10 0 0 1 42 40V52';

interface SymbolColors { bg: string; fg: string; flap: string }
interface WordColors { fg: string; dot: string; flap: string }

function SymbolMark(p: SymbolColors) {
  return (
    <g>
      <path d={TILE} style={{ fill: p.bg }} />
      <path d={FLAP} style={{ fill: p.flap }} />
      <path d={H} fill="none" style={{ stroke: p.fg }} strokeWidth="8" />
    </g>
  );
}

function Wordmark(p: WordColors) {
  return (
    <g>
      <g fill="none" style={{ stroke: p.fg }} strokeWidth="9">
        <path d="M4.5 0V72M4.5 48.5A16 16 0 0 1 36.5 48.5V72" />
        <circle cx="73" cy="50" r="17.5" />
        <path d="M90.5 28V72M109.5 0V72M128.5 28V72" />
      </g>
      <path d="M123 4H130L135 9V16H123Z" style={{ fill: p.dot }} />
      <path d="M130 4V9H135Z" style={{ fill: p.flap }} />
    </g>
  );
}

const V = { ink: 'var(--logo-ink)', paper: 'var(--logo-paper)', sea: 'var(--logo-sea)', seaL: 'var(--logo-sea-l)', seaXL: 'var(--logo-sea-xl)', mono: 'var(--logo-mono)', monoL: 'var(--logo-mono-l)', monoFlap: 'var(--logo-mono-flap)' };

function colors(tone: LogoTone | undefined): { s: SymbolColors; w: WordColors } {
  if (!tone) {
    return {
      s: { bg: 'var(--lg-s-bg)', fg: 'var(--lg-s-fg)', flap: 'var(--lg-s-flap)' },
      w: { fg: 'var(--lg-w-fg)', dot: 'var(--lg-w-dot)', flap: 'var(--lg-w-flap)' },
    };
  }
  const light = tone === 'reverse' || tone === 'mono-reverse';
  const mono = tone === 'mono' || tone === 'mono-reverse';
  const w = {
    fg: light ? V.paper : V.ink,
    dot: mono ? (light ? V.paper : V.ink) : light ? V.seaL : V.sea,
    flap: mono ? (light ? V.monoL : V.mono) : light ? V.seaXL : V.seaL,
  };
  const s = light
    ? { bg: V.paper, fg: V.ink, flap: mono ? V.monoL : V.seaL }
    : mono || tone === 'ink'
      ? { bg: V.ink, fg: V.paper, flap: mono ? V.monoFlap : V.seaL }
      : { bg: V.sea, fg: V.paper, flap: V.seaXL };
  return { s, w };
}

export const LOGO_VIEWBOX: Record<LogoVariant, [number, number]> = {
  symbol: [64, 64], wordmark: [136, 72], stacked: [136, 168], lockup: [230, 72],
};

export function Logo({ variant = 'lockup', tone, height = 24, title = 'Hali', className, style }: LogoProps) {
  const { s, w } = colors(tone);
  const vb = LOGO_VIEWBOX[variant];
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`0 0 ${vb[0]} ${vb[1]}`}
      height={height}
      width={(height * vb[0]) / vb[1]}
      className={'hds-logo' + (className ? ' ' + className : '')}
      data-auto={tone ? undefined : ''}
      style={style}
    >
      {variant === 'symbol' && <SymbolMark {...s} />}
      {variant === 'wordmark' && <Wordmark {...w} />}
      {variant === 'lockup' && (
        <g>
          <g transform="scale(1.125)"><SymbolMark {...s} /></g>
          <g transform="translate(94 0)"><Wordmark {...w} /></g>
        </g>
      )}
      {variant === 'stacked' && (
        <g>
          <g transform="translate(32 0) scale(1.125)"><SymbolMark {...s} /></g>
          <g transform="translate(0 96)"><Wordmark {...w} /></g>
        </g>
      )}
    </svg>
  );
}
