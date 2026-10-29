'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { IconButton, Logo } from '@/components/ds';
import { STUDIO_NAV } from '@/lib/nav';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/lib/theme';
import { Icon } from '@/components/ds';

const norm = (p: string) => (p.endsWith('/') ? p : p + '/');

/** Shared page header: logo, studio nav (scrollable on tablets, a menu on phones) and theme toggle. */
export function StudioHeader({ variant = 'page' }: { variant?: 'page' | 'hub' }) {
  const path = norm(usePathname() || '/');
  const [open, setOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const [fade, setFade] = useState({ l: false, r: false });

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => {
    const n = navRef.current;
    if (!n) return;
    const upd = () => setFade({ l: n.scrollLeft > 2, r: n.scrollLeft + n.clientWidth < n.scrollWidth - 2 });
    upd();
    n.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    n.addEventListener('scroll', upd, { passive: true });
    const ro = new ResizeObserver(upd);
    ro.observe(n);
    return () => { n.removeEventListener('scroll', upd); ro.disconnect(); };
  }, []);

  if (variant === 'hub') {
    return (
      <header className="st-header st-header-hub">
        <Logo height={24} />
        <span className="st-header-tag">Brand studio</span>
        <span style={{ flex: 1 }} />
        <ThemeToggle />
      </header>
    );
  }

  return (
    <header className="st-header">
      <Link href="/" aria-label="Brand Studio home" className="st-header-home"><Logo height={24} /></Link>
      <div className="st-nav-wrap" data-fade-l={fade.l || undefined} data-fade-r={fade.r || undefined}>
        <nav ref={navRef} aria-label="Studio" className="st-nav">
          {STUDIO_NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={norm(n.href) === path ? 'page' : undefined} className="st-nav-link">{n.label}</Link>
          ))}
        </nav>
      </div>
      <span className="st-header-spacer" />
      <ThemeToggle />
      <IconButton icon={open ? 'x' : 'menu'} label={open ? 'Close menu' : 'Open menu'} size="sm" className="st-menu-btn" onClick={() => setOpen(!open)} />
      {open && (
        <>
          <div className="st-menu-scrim" onClick={() => setOpen(false)} />
          <nav aria-label="Studio" className="st-menu">
            {STUDIO_NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={norm(n.href) === path ? 'page' : undefined} className="st-menu-link" onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
            <button type="button" className="st-menu-link st-menu-theme" onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />{theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
          </nav>
        </>
      )}
    </header>
  );
}
