'use client';
import { useEffect, type RefObject } from 'react';

/**
 * Tracks the on-screen keyboard. iOS Safari overlays the keyboard on the page instead of resizing it, so bottom
 * sheets would sit behind it; this writes the keyboard height to `--kb` on the editor root (and `data-kb` while
 * it is open) so sheets can lift above it, and keeps the focused field in view.
 */
export function useVisualViewport(root: RefObject<HTMLElement | null>, ready: boolean) {
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    const el = root.current;
    if (!vv || !el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      el.style.setProperty('--kb', kb + 'px');
      if (kb > 80) el.setAttribute('data-kb', ''); else el.removeAttribute('data-kb');
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    const focus = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !t.matches('input, textarea, select, [contenteditable="true"]')) return;
      const inCanvas = !!t.closest('.ed-vp');
      if (!inCanvas && !t.closest('.ed-panel, .ed-dialog')) return;
      // Wait for the keyboard animation, then bring the field (or the text being edited on the canvas) into view.
      setTimeout(() => t.scrollIntoView({ block: inCanvas ? 'center' : 'nearest', inline: 'nearest' }), 320);
    };
    vv.addEventListener('resize', on);
    vv.addEventListener('scroll', on);
    document.addEventListener('focusin', focus);
    update();
    return () => { vv.removeEventListener('resize', on); vv.removeEventListener('scroll', on); document.removeEventListener('focusin', focus); cancelAnimationFrame(raf); };
  }, [root, ready]);
}
