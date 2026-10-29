'use client';
import { produce } from 'immer';
import { useCallback, useRef, useState } from 'react';

const LIMIT = 100;
/* Immer's overloaded `produce` signature trips the TypeScript checker with a generic base; use one plain signature. */
const produceT = produce as unknown as <T>(base: T, recipe: (draft: T) => void) => T;
const MERGE_MS = 1200;

/**
 * Document state with undo/redo. `commit` applies an Immer mutation (structural sharing keeps
 * unchanged pages/elements identical, so memoised rendering skips them). Commits that share a
 * `tag` within 1.2 s merge into one undo step (typing, nudging, sliders).
 */
export function useHistory<T>(initial: T | null) {
  const [doc, setDocState] = useState<T | null>(initial);
  const docRef = useRef<T | null>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const last = useRef<{ tag: string | null; t: number }>({ tag: null, t: 0 });
  const [, bump] = useState(0);

  const apply = useCallback((next: T | null) => { docRef.current = next; setDocState(next); }, []);

  const pushHist = useCallback((prev: T) => {
    past.current.push(prev);
    if (past.current.length > LIMIT) past.current.shift();
    future.current = [];
    last.current.tag = null;
  }, []);

  const commit = useCallback((mut: (d: T) => void, tag?: string | null, stamp?: (d: T) => void) => {
    const prev = docRef.current;
    if (prev === null) return prev;
    const next: T = produceT<T>(prev, (d: T) => { mut(d); if (stamp) stamp(d); });
    if (next === prev) return prev;
    const now = Date.now();
    if (!(tag && tag === last.current.tag && now - last.current.t < MERGE_MS)) {
      past.current.push(prev);
      if (past.current.length > LIMIT) past.current.shift();
      future.current = [];
    }
    last.current = { tag: tag || null, t: now };
    apply(next);
    return next;
  }, [apply]);

  /** Replace the document. `record` pushes the current one onto the undo stack; `reset` clears history. */
  const replace = useCallback((next: T, opts: { record?: boolean; reset?: boolean } = {}) => {
    if (opts.reset) { past.current = []; future.current = []; last.current.tag = null; }
    else if (opts.record && docRef.current) pushHist(docRef.current);
    apply(next);
    bump((n) => n + 1);
  }, [apply, pushHist]);

  /** Live update without touching history (drag in progress). */
  const setLive = useCallback((next: T) => apply(next), [apply]);

  const undo = useCallback(() => {
    const p = past.current.pop();
    if (!p || !docRef.current) return null;
    future.current.push(docRef.current);
    last.current.tag = null;
    apply(p);
    return p;
  }, [apply]);

  const redo = useCallback(() => {
    const f = future.current.pop();
    if (!f || !docRef.current) return null;
    past.current.push(docRef.current);
    last.current.tag = null;
    apply(f);
    return f;
  }, [apply]);

  return {
    doc, docRef, commit, replace, setLive, pushHist, undo, redo,
    canUndo: past.current.length > 0, canRedo: future.current.length > 0,
  };
}
