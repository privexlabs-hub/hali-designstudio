'use client';
import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
export const THEME_KEY = 'hali-studio:theme';

/** Runs in <head> before first paint so the stored or system theme applies with no flash. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`;

const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(t: Theme): Theme {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
  return t;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
      document.documentElement.dataset.theme = e.newValue;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage); };
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme);
  return [theme, () => setTheme(theme === 'dark' ? 'light' : 'dark')];
}
