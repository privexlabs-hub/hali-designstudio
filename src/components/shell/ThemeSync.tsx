'use client';
import { useLayoutEffect } from 'react';
import { THEME_KEY } from '@/lib/theme';

/**
 * Re-applies the stored theme after mount. The inline head script sets it before first paint; this
 * keeps it if React ever re-renders <html> on the client (for example after a browser extension
 * changes the page before hydration), since that re-render drops attributes React does not own.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    let t: string | null = null;
    try { t = localStorage.getItem(THEME_KEY); } catch { /* storage unavailable */ }
    if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (document.documentElement.dataset.theme !== t) document.documentElement.dataset.theme = t;
  }, []);
  return null;
}
