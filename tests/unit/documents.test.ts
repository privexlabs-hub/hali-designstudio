import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { XMLValidator } from 'fast-xml-parser';
import { BLOCKS, DOC_TYPES, KIND_NAMES, SIZES, TYPES, makePage, newDocument, type DocType } from '@/lib/documents';
import { chartRows, docx, epub, lines, markdown, pageLabel, plain, rows, toc } from '@/lib/docexport';

describe('document types', () => {
  it('every type builds its starter structure with ids and blocks', () => {
    const counts: Record<DocType, number> = { book: 30, report: 12, whitepaper: 12, proposal: 11, casestudy: 9, presentation: 17, article: 13, newsletter: 12, resume: 2 };
    for (const t of DOC_TYPES) {
      const d = newDocument(t);
      expect(d.pages.length, t).toBe(counts[t]);
      expect(TYPES[t].sizes).toContain(d.size);
      for (const p of d.pages) {
        expect(p.id).toBeTruthy();
        expect(Array.isArray(p.blocks)).toBe(true);
        for (const b of p.blocks) { expect(b.id).toBeTruthy(); expect(BLOCKS[b.t], b.t).toBeTruthy(); }
      }
    }
  });
  it('every page kind can be inserted again', () => {
    for (const t of DOC_TYPES) for (const k of KIND_NAMES(t)) expect(makePage(t, k.id).kind).toBe(k.id);
  });
  it('unknown kinds become continued pages', () => {
    expect(makePage('report', 'nope').kind).toBe('continued');
  });
  it('has 20 block types', () => {
    expect(Object.keys(BLOCKS)).toHaveLength(20);
    for (const [, [, , f]] of Object.entries(BLOCKS)) expect(f().id).toBeTruthy();
  });
});

describe('parsers', () => {
  it('rows, lines and chart rows', () => {
    expect(rows('a | b\n\n c|d ')).toEqual([['a', 'b'], ['c', 'd']]);
    expect(lines('x\n \ny')).toEqual(['x', 'y']);
    expect(chartRows('Agreed: 6,000\nProposed: 1800\nbad')).toEqual([['Agreed', 6000], ['Proposed', 1800], ['bad', 0]]);
  });
});

describe('numbering and contents', () => {
  it('page labels start at numberFrom and skip unnumbered pages', () => {
    const d = newDocument('book');
    expect(pageLabel(d, 0)).toBeNull();
    const i = d.pages.findIndex((p, k) => k >= d.numberFrom - 1 && p.number);
    expect(pageLabel(d, i)).toBe(i - d.numberFrom + 1);
  });
  it('book contents list chapters with their kicker and skip front matter', () => {
    const entries = toc(newDocument('book'));
    expect(entries.length).toBeGreaterThan(5);
    expect(entries.some((e) => /Chapter/.test(e.title))).toBe(true);
    expect(entries.some((e) => e.title === 'Contents')).toBe(false);
  });
});

describe('text exports', () => {
  it('markdown and plain text cover every type', () => {
    for (const t of DOC_TYPES) {
      const d = newDocument(t);
      const md = markdown(d), tx = plain(d);
      expect(md.startsWith('# ' + d.title)).toBe(true);
      expect(md).toContain('---');
      expect(tx).not.toMatch(/^#/m);
      expect(tx).not.toContain('**');
    }
  });
  it('markdown tables have a header separator', () => {
    const md = markdown(newDocument('report'));
    expect(md).toMatch(/\|( --- \|)+/);
  });
});

const xmlOk = (s: string, name: string) => { const r = XMLValidator.validate(s); expect(r, name + ': ' + JSON.stringify(r)).toBe(true); };

describe('DOCX', () => {
  for (const t of ['resume', 'report', 'proposal'] as DocType[]) {
    it(`${t} produces a valid WordprocessingML package`, async () => {
      const d = newDocument(t);
      const blob = await docx(d, SIZES[d.size]);
      const z = await JSZip.loadAsync(await blob.arrayBuffer());
      for (const f of ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml', 'word/_rels/document.xml.rels', 'docProps/core.xml']) {
        const file = z.file(f);
        expect(file, f).toBeTruthy();
        xmlOk(await file!.async('string'), f);
      }
      const docXml = await z.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:br w:type="page"/>');
      expect(docXml).toContain('<w:pgSz w:w="' + Math.round(SIZES[d.size].w * 15) + '"');
    });
  }
});

describe('EPUB', () => {
  it('book produces a valid EPUB 3 package', async () => {
    const d = newDocument('book');
    const blob = await epub(d, null);
    const z = await JSZip.loadAsync(await blob.arrayBuffer());
    const names = Object.keys(z.files);
    expect(names[0]).toBe('mimetype');
    expect(await z.file('mimetype')!.async('string')).toBe('application/epub+zip');
    for (const f of names.filter((n) => /\.(xml|opf|xhtml)$/.test(n))) xmlOk(await z.file(f)!.async('string'), f);
    expect(names.filter((n) => /OEBPS\/p-\d{3}\.xhtml$/.test(n))).toHaveLength(d.pages.length);
    expect(await z.file('OEBPS/nav.xhtml')!.async('string')).toContain('epub:type="toc"');
  });
});
