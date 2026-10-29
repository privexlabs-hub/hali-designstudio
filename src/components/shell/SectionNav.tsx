'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { prefersReducedMotion } from '@/hooks/useMediaQuery';

export interface SectionLink { id: string; label: string }

/** Programmatic scrolls pause the spy so the chapter the user picked stays active. */
let spyPausedUntil = 0;

/** Scroll-spy that marks the last section whose top has passed below the sticky chrome. */
export function useScrollSpy(ids: string[], initial: string): [string, (id: string) => void] {
  const [active, setActive] = useState(initial);
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      if (Date.now() < spyPausedUntil) return;
      const off = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sticky-offset')) || 120;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < off + 24) cur = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) cur = ids[ids.length - 1];
      setActive(cur);
    };
    const hash = decodeURIComponent(location.hash.slice(1));
    if (ids.includes(hash)) { setActive(hash); spyPausedUntil = Date.now() + 900; }
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [ids]);
  return [active, setActive];
}

export function jumpTo(e: MouseEvent, id: string, onJump?: (id: string) => void) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  spyPausedUntil = Date.now() + (prefersReducedMotion() ? 150 : 1100);
  onJump?.(id);
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', '#' + id);
}

/**
 * Chapter navigation. ≥960px: sticky numbered side list. <960px: sticky horizontal pill bar under the header.
 * Both are rendered; CSS decides which one shows, so there is no layout flash.
 */
export function SectionNav({ links, title, version, active, onJump }: { links: SectionLink[]; title: string; version?: string; active: string; onJump?: (id: string) => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = barRef.current;
    const a = bar?.querySelector<HTMLElement>('[aria-current="true"]');
    if (bar && a) bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);
  return (
    <>
      <aside className="st-side" aria-label={title}>
        <div className="st-side-label">{title}{version && <span> · v{version}</span>}</div>
        <nav className="st-side-list">
          {links.map((l, i) => (
            <a key={l.id} href={'#' + l.id} aria-current={active === l.id ? 'true' : undefined} className="st-side-link" onClick={(e) => jumpTo(e, l.id, onJump)}>
              <span className="st-side-num">{String(i + 1).padStart(2, '0')}</span>{l.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="st-bar" ref={barRef} role="navigation" aria-label={title + ' sections'}>
        {links.map((l) => (
          <a key={l.id} href={'#' + l.id} aria-current={active === l.id ? 'true' : undefined} className="st-bar-link" onClick={(e) => jumpTo(e, l.id, onJump)}>{l.label}</a>
        ))}
      </div>
    </>
  );
}
