import type { CSSProperties } from 'react';

export function formatMoney(amount: number, currency = 'USD', opts: Intl.NumberFormatOptions = {}): string {
  try {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0, ...opts,
    }).format(amount);
  } catch {
    return currency + ' ' + amount;
  }
}

const FS = { sm: 13, md: 14, lg: 18, xl: 30 } as const;

export interface MoneyProps {
  amount?: number;
  currency?: string;
  size?: keyof typeof FS;
  basis?: string;
  unknown?: boolean;
  strike?: boolean;
  style?: CSSProperties;
}

export function Money({ amount = 0, currency = 'USD', size = 'md', basis, unknown = false, strike = false, style }: MoneyProps) {
  const xl = size === 'xl';
  return (
    <span className="hds-money" style={style}>
      <span
        className="hds-money-v"
        style={{
          fontSize: FS[size], fontWeight: xl ? 600 : 500, color: unknown ? 'var(--text-tertiary)' : undefined,
          textDecoration: strike ? 'line-through' : undefined, letterSpacing: xl ? '-0.01em' : undefined,
        }}
      >
        {unknown ? 'Not set' : formatMoney(amount, currency)}
      </span>
      {basis && <span className="hds-money-b">{basis}</span>}
    </span>
  );
}
