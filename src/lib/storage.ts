/* Browser storage for designs and documents.
   IndexedDB (via idb-keyval) holds the documents — no ~5 MB localStorage ceiling, so uploaded images fit.
   Designs saved by the earlier localStorage build (one JSON map per key) are migrated on first use. */
import { createStore, del, entries, get, set, type UseStore } from 'idb-keyval';

export interface Stored { id: string; updated: number }

export interface DocStore<T extends Stored> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  put(doc: T): Promise<void>;
  remove(id: string): Promise<void>;
  getCurrent(): Promise<string | null>;
  setCurrent(id: string): Promise<void>;
}

export class StorageFullError extends Error {
  constructor() { super('Browser storage is full.'); this.name = 'StorageFullError'; }
}

const isQuota = (e: unknown) => {
  const n = (e as { name?: string })?.name || '';
  return n === 'QuotaExceededError' || n === 'NS_ERROR_DOM_QUOTA_REACHED' || /quota/i.test(String((e as Error)?.message || ''));
};

/** In-memory fallback when IndexedDB is unavailable (private mode in some browsers, tests). */
function memoryStore<T extends Stored>(): DocStore<T> {
  const m = new Map<string, T>();
  let cur: string | null = null;
  return {
    list: async () => [...m.values()].sort((a, b) => b.updated - a.updated),
    get: async (id) => m.get(id),
    put: async (d) => { m.set(d.id, d); },
    remove: async (id) => { m.delete(id); },
    getCurrent: async () => cur,
    setCurrent: async (id) => { cur = id; },
  };
}

export function createDocStore<T extends Stored>(name: string, legacyDocsKey: string, legacyCurrentKey: string): DocStore<T> {
  if (typeof indexedDB === 'undefined') return memoryStore<T>();
  let store: UseStore;
  try { store = createStore(name, 'docs'); } catch { return memoryStore<T>(); }
  const CUR = '__current__';
  let ready: Promise<void> | null = null;

  const migrate = () => (ready ??= (async () => {
    try {
      const raw = localStorage.getItem(legacyDocsKey);
      if (!raw) return;
      const docs = JSON.parse(raw) as Record<string, T>;
      for (const d of Object.values(docs || {})) if (d && d.id && !(await get(d.id, store))) await set(d.id, d, store);
      const cur = localStorage.getItem(legacyCurrentKey);
      if (cur && !(await get(CUR, store))) await set(CUR, cur, store);
      localStorage.removeItem(legacyDocsKey);
      localStorage.removeItem(legacyCurrentKey);
    } catch { /* legacy data unreadable: start fresh */ }
  })());

  return {
    async list() {
      await migrate();
      const all = await entries<string, T | string>(store);
      return all.filter(([k, v]) => k !== CUR && v && typeof v === 'object').map(([, v]) => v as T).sort((a, b) => b.updated - a.updated);
    },
    async get(id) { await migrate(); const v = await get<T>(id, store); return v && typeof v === 'object' ? v : undefined; },
    async put(doc) {
      await migrate();
      try { await set(doc.id, doc, store); } catch (e) { if (isQuota(e)) throw new StorageFullError(); throw e; }
    },
    async remove(id) { await migrate(); await del(id, store); },
    async getCurrent() { await migrate(); return (await get<string>(CUR, store)) || null; },
    async setCurrent(id) { await migrate(); try { await set(CUR, id, store); } catch { /* non-critical */ } },
  };
}

/** Reads a small preference from localStorage (never throws). */
export function readPref<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v === null ? fallback : (JSON.parse(v) as T); } catch { return fallback; }
}
export function writePref(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
