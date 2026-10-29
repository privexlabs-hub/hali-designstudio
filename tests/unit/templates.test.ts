import { describe, expect, it } from 'vitest';
import { CATEGORIES, CAT, FMT, FORMATS, SCHEMES, ctxFor, est, logoSrc, newDoc, reflow, stack, type SchemeId } from '@/lib/templates';

const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n);

describe('formats', () => {
  it('has unique ids', () => {
    const ids = FORMATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every category format exists', () => {
    for (const c of CATEGORIES) for (const f of c.formats) expect(FMT[f], c.id + '/' + f).toBeTruthy();
  });
  it('keeps the editorial and web heroes distinct', () => {
    expect(FMT['article-hero']).toMatchObject({ w: 1600, h: 900 });
    expect(FMT['web-hero']).toMatchObject({ w: 1440, h: 720 });
  });
});

describe('every template builds at every format in every scheme', () => {
  for (const cat of CATEGORIES) {
    for (const tpl of cat.templates) {
      it(`${cat.id}/${tpl.id}`, () => {
        for (const f of cat.formats) {
          for (const sc of Object.keys(SCHEMES) as SchemeId[]) {
            const d = newDoc(cat.id, tpl.id, f, sc);
            expect(d.w).toBe(FMT[f].w);
            expect(d.pages.length).toBeGreaterThan(0);
            for (const p of d.pages) {
              expect(p.els.length).toBeGreaterThan(0);
              const roles = p.els.map((e) => e.role);
              expect(new Set(roles).size, `${cat.id}/${tpl.id}/${f} duplicate roles`).toBe(roles.length);
              for (const e of p.els) {
                for (const k of ['x', 'y', 'w', 'h'] as const) expect(finite(e[k]), `${cat.id}/${tpl.id}/${f}/${sc} ${e.role}.${k}=${e[k]}`).toBe(true);
                if (e.s.size !== undefined) expect(e.s.size).toBeGreaterThan(0);
                if (e.type === 'text') expect(typeof e.text).toBe('string');
              }
            }
          }
        }
      });
    }
  }
});

describe('layout helpers', () => {
  it('est grows with text length', () => {
    expect(est('a'.repeat(200), 20, 200, 1.3)).toBeGreaterThan(est('a', 20, 200, 1.3));
  });
  it('stack shrinks content to fit', () => {
    const els = stack([{ t: 'text', role: 'a', text: 'x '.repeat(400), size: 80 }], { x: 0, y: 0, w: 400, h: 200 }, 'top');
    expect(els[0].s.size!).toBeLessThan(80);
  });
  it('ctxFor classifies orientation', () => {
    expect(ctxFor(FMT['x-header'], 'paper').o).toBe('wide');
    expect(ctxFor(FMT.sq, 'paper').o).toBe('square');
    expect(ctxFor(FMT.story, 'paper').o).toBe('tall');
  });
  it('logoSrc resolves files and the app icon', () => {
    expect(logoSrc('lockup', 'reverse')).toBe('/assets/logo/hali-lockup-horizontal-reverse.svg');
    expect(logoSrc('appicon', 'default')).toBe('/assets/icons/app-icon-full-bleed.svg');
    expect(logoSrc('symbol', 'nope')).toBe('/assets/logo/hali-symbol.svg');
  });
});

describe('reflow', () => {
  it('keeps edited text, images, colours, geometry and rotation, and drops deleted elements', () => {
    const d = newDoc('social', 'announcement', 'sq', 'paper');
    const p = d.pages[0];
    const title = p.els.find((e) => e.role === 'title')!;
    title.text = 'Edited headline';
    title.s.color = '#3462B8';
    title.rot = 12;
    title.ov = { text: true, color: true };
    const logo = p.els.find((e) => e.role === 'logo')!;
    logo.x = 100; logo.ov = { geom: true };
    p.els = p.els.filter((e) => e.role !== 'footer');
    p.els.push({ id: 'c1', role: 'custom-c1', custom: true, type: 'shape', x: 540, y: 540, w: 100, h: 100, s: { bg: '#000000' } });

    const n = reflow(d, 'story', 'ink');
    expect(n.w).toBe(1080); expect(n.h).toBe(1920); expect(n.scheme).toBe('ink');
    const np = n.pages[0];
    const nt = np.els.find((e) => e.role === 'title')!;
    expect(nt.text).toBe('Edited headline');
    expect(nt.s.color).toBe('#3462B8');
    expect(nt.rot).toBe(12);
    expect(np.els.find((e) => e.role === 'footer')).toBeUndefined();
    expect(np.els.find((e) => e.role === 'logo')!.x).toBe(100);
    const c = np.els.find((e) => e.role === 'custom-c1')!;
    expect(c.y).toBe(Math.round(540 * 1920 / 1080));
    expect(n.name.endsWith(FMT.story.name)).toBe(true);
  });
  it('re-flows every format in a category', () => {
    for (const cat of Object.values(CAT)) {
      const d = newDoc(cat.id, cat.templates[0].id, cat.formats[0]);
      for (const f of cat.formats) expect(reflow(d, f, d.scheme).pages.length).toBe(d.pages.length);
    }
  });
});

import { CELEBRATIONS_DATA, CELEBRATION_GROUPS } from '@/lib/templates/celebrations';
import { POST_FORMATS, POST_FORMATS_STILL, defaultVars } from '@/lib/templates';

describe('platform post sizes', () => {
  it('every post format exists, and the lists have no duplicates', () => {
    for (const list of [POST_FORMATS, POST_FORMATS_STILL]) {
      expect(new Set(list).size).toBe(list.length);
      for (const id of list) expect(FMT[id], id).toBeTruthy();
    }
  });
  it('platform sizes match the platforms', () => {
    expect(FMT['ig-portrait']).toMatchObject({ w: 1080, h: 1350 });
    expect(FMT['tiktok']).toMatchObject({ w: 1080, h: 1920 });
    expect(FMT['x-post']).toMatchObject({ w: 1600, h: 900 });
    expect(FMT['fb-link']).toMatchObject({ w: 1200, h: 630 });
  });
  it('social, engagement and celebrations offer every platform size', () => {
    for (const c of ['social', 'engagement', 'celebrations']) expect(CAT[c].formats).toEqual(POST_FORMATS);
  });
});

describe('celebrations', () => {
  const cat = CAT.celebrations;
  it('has unique ids, a known group for every template and every group used', () => {
    const ids = cat.templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(50);
    for (const t of cat.templates) expect(CELEBRATION_GROUPS, t.id).toContain(t.group);
    for (const g of CELEBRATION_GROUPS) expect(cat.templates.some((t) => t.group === g), g).toBe(true);
  });
  it('follows the voice rules: no exclamation marks, no emoji, remembrance days never say Happy', () => {
    const emoji = /\p{Extended_Pictographic}/u;
    for (const d of CELEBRATIONS_DATA) {
      const copy = [d.kicker, d.greeting, d.greeting2, d.line, d.date, d.numeral].filter(Boolean).join(' ');
      expect(copy, d.id).not.toContain('!');
      expect(emoji.test(copy), d.id).toBe(false);
      if (d.layout === 'solemn') expect(copy, d.id).not.toMatch(/happy/i);
    }
  });
  it('keeps every element on the canvas, and text inside the platform safe area', () => {
    for (const t of cat.templates) {
      for (const f of cat.formats) {
        const fmt = FMT[f];
        for (const el of newDoc('celebrations', t.id, f).pages[0].els) {
          expect(el.x >= -1 && el.y >= -1 && el.x + el.w <= fmt.w + 1 && el.y + el.h <= fmt.h + 1, `${t.id}@${f} ${el.role}`).toBe(true);
          if (fmt.safe && el.type === 'text') {
            const s = fmt.safe;
            expect(el.x >= s.x - 1 && el.y >= s.y - 1 && el.x + el.w <= s.x + s.w + 1 && el.y + el.h <= s.y + s.h + 1, `${t.id}@${f} ${el.role} outside safe area`).toBe(true);
          }
        }
      }
    }
  });
  it('fills date variables from the creation date and keeps them on re-flow', () => {
    const now = new Date(2026, 10, 15); // 15 November 2026
    expect(defaultVars(['month', 'year'], now)).toEqual({ month: 'December', year: '2027' });
    expect(defaultVars(['month'], new Date(2026, 11, 2))).toEqual({ month: 'January' });
    expect(defaultVars(['year'], new Date(2026, 2, 1))).toEqual({ year: '2026' });
    const d = newDoc('celebrations', 'cel-new-month', 'ig-portrait', undefined, { now });
    expect(d.vars).toEqual({ month: 'December', year: '2027' });
    const texts = (x: typeof d) => x.pages[0].els.map((e) => e.text).join(' ');
    expect(texts(d)).toContain('December');
    const n = reflow(d, 'ig-story', d.scheme);
    expect(n.vars).toEqual(d.vars);
    expect(texts(n)).toContain('December');
    const y = newDoc('celebrations', 'cel-new-year', 'sq', undefined, { now });
    expect(texts(y)).toContain('2027');
    expect(reflow({ ...d, vars: { ...d.vars, month: 'March' } }, d.fmt, d.scheme).pages[0].els.some((e) => e.text === 'March')).toBe(true);
  });
});
