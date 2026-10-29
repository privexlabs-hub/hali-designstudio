'use client';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ds';
import { copy } from '@/lib/brand';

interface CopyCtx { copied: string | null; copyText: (text: string, label?: string) => Promise<boolean> }
const Ctx = createContext<CopyCtx>({ copied: null, copyText: async () => false });

/** Click-to-copy with a single live toast ("Copied X" / failure guidance). */
export function CopyProvider({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyText = useCallback(async (text: string) => {
    const ok = await copy(text);
    clearTimeout(t.current);
    setCopied(ok ? text : null);
    setMsg(ok ? 'Copied ' + text : 'Copy failed — select the value and copy it manually.');
    t.current = setTimeout(() => { setCopied(null); setMsg(null); }, 1600);
    return ok;
  }, []);
  return (
    <Ctx.Provider value={{ copied, copyText }}>
      {children}
      <div className="st-toast" aria-live="polite" role="status">{msg && <span className="st-toast-in">{msg}</span>}</div>
    </Ctx.Provider>
  );
}

export const useCopy = () => useContext(Ctx);

/** Mono copy chip: shows the value, swaps to a check while copied. */
export function CopyChip({ text, label, children, title, className }: { text: string; label?: string; children?: ReactNode; title?: string; className?: string }) {
  const { copied, copyText } = useCopy();
  const done = copied === text;
  return (
    <button type="button" className={'st-chip' + (className ? ' ' + className : '')} title={title || 'Copy ' + (label || text)} onClick={() => copyText(text, label)}>
      <span className="st-chip-t">{children ?? text}</span>
      <Icon name={done ? 'check' : 'copy'} size={12} />
    </button>
  );
}
