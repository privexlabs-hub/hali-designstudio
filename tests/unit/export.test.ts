import { afterEach, describe, expect, it, vi } from 'vitest';
import { rasterScale, shareSet } from '@/lib/export';

const setNav = (o: Record<string, unknown>) => vi.stubGlobal('navigator', { userAgent: 'test', platform: 'test', maxTouchPoints: 0, ...o });
const setCoarse = (coarse: boolean) => vi.stubGlobal('window', { matchMedia: (q: string) => ({ matches: coarse && q.includes('coarse') }) });

afterEach(() => vi.unstubAllGlobals());

describe('rasterScale', () => {
  it('keeps 2× on capable devices', () => {
    setNav({ deviceMemory: 8 }); setCoarse(false);
    expect(rasterScale(30)).toBe(2);
  });
  it('drops to 1.5× on low-memory devices', () => {
    setNav({ deviceMemory: 4 }); setCoarse(false);
    expect(rasterScale(1)).toBe(1.5);
  });
  it('drops to 1.5× for long documents on touch devices', () => {
    setNav({}); setCoarse(true);
    expect(rasterScale(12)).toBe(2);
    expect(rasterScale(13)).toBe(1.5);
  });
});

describe('shareSet', () => {
  const f = (n: string) => ({ name: n, blob: new Blob(['x'], { type: 'image/png' }) });
  it('shares a single file as is', async () => {
    setNav({ canShare: () => true });
    expect((await shareSet([f('a.png')], 'all.zip')).map((x) => x.name)).toEqual(['a.png']);
  });
  it('shares up to 10 files individually when the browser accepts them', async () => {
    setNav({ canShare: () => true });
    const files = Array.from({ length: 10 }, (_, i) => f(i + '.png'));
    expect(await shareSet(files, 'all.zip')).toHaveLength(10);
  });
  it('falls back to one ZIP for more than 10 files or when files are refused', async () => {
    setNav({ canShare: () => true });
    const many = Array.from({ length: 11 }, (_, i) => f(i + '.png'));
    expect((await shareSet(many, 'all.zip')).map((x) => x.name)).toEqual(['all.zip']);
    setNav({ canShare: () => false });
    expect((await shareSet([f('a.png'), f('b.png')], 'two.zip')).map((x) => x.name)).toEqual(['two.zip']);
  });
});
