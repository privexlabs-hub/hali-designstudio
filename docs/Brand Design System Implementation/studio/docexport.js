/* Hali Brand Studio — document export: PDF, print, DOCX, PPTX, EPUB, HTML, Markdown, text, PNG.
   Every export reads the current edited document; layout-faithful formats capture the rendered pages. */
(function () {
  const LIBS = { jspdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', PptxGenJS: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js' };
  const loading = {};
  function lib(name) {
    if (window[name]) return Promise.resolve(window[name]);
    if (name === 'htmlToImage' || name === 'JSZip') return window.HaliExport.lib(name);
    if (!loading[name]) loading[name] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = LIBS[name]; s.onload = () => window[name] ? res(window[name]) : rej(new Error(name + ' did not load')); s.onerror = () => rej(new Error('Could not load ' + name + '. Check your connection.')); document.head.appendChild(s); });
    return loading[name];
  }
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rows = (t) => String(t || '').split('\n').filter(l => l.trim()).map(l => l.split('|').map(c => c.trim()));
  const lines = (t) => String(t || '').split('\n').filter(l => l.trim());
  const chartRows = (t) => lines(t).map(l => { const m = /^(.*?):\s*(-?[\d.,]+)\s*$/.exec(l); return m ? [m[1].trim(), parseFloat(m[2].replace(/,/g, ''))] : [l, 0]; });

  function pageLabel(doc, i) { const p = doc.pages[i]; const n = i - doc.numberFrom + 1; return p && p.number && n >= 1 ? n : null; }
  function toc(doc) {
    const skip = { cover: 1, toc: 1, 'title-page': 1, copyright: 1, dedication: 1, epigraph: 1, 'back-cover': 1, continued: 1 };
    const out = [];
    doc.pages.forEach((p, i) => { if (skip[p.kind]) return; const h = p.blocks.find(b => (b.t === 'heading' && b.level === 1) || b.t === 'title'); if (!h) return;
      const kick = p.blocks.find(b => b.t === 'kicker'); out.push({ title: (p.kind === 'chapter' || p.kind === 'part') && kick ? kick.text + ' · ' + h.text : h.text, page: pageLabel(doc, i) || i + 1, index: i, level: p.kind === 'part' ? 0 : 1 }); });
    return out;
  }

  /* ---------- text formats ---------- */
  function blockMD(b, doc) {
    switch (b.t) {
      case 'heading': return '#'.repeat(Math.min(6, b.level + 1)) + ' ' + b.text;
      case 'title': return '# ' + b.text + (b.sub ? '\n\n*' + b.sub + '*' : '');
      case 'kicker': return '**' + String(b.text).toUpperCase() + '**';
      case 'meta': return '_' + b.text + '_';
      case 'para': return b.text;
      case 'quote': return '> ' + String(b.text).split('\n').join('\n> ') + (b.cite ? '\n>\n> — ' + b.cite : '');
      case 'callout': return '> **' + b.title + '**  \n> ' + b.text;
      case 'list': return lines(b.text).map((l, i) => (b.ordered ? (i + 1) + '. ' : '- ') + l).join('\n');
      case 'image': return '![' + (b.caption || 'Image') + '](' + (b.src && !b.src.startsWith('data:') ? b.src : 'image') + ')' + (b.caption ? '\n\n*' + b.caption + '*' : '');
      case 'table': { const r = rows(b.text); if (!r.length) return ''; const w = Math.max(...r.map(x => x.length)); const pad = (x) => x.concat(Array(w - x.length).fill(''));
        return ['| ' + pad(r[0]).join(' | ') + ' |', '|' + Array(w).fill(' --- ').join('|') + '|', ...r.slice(1).map(x => '| ' + pad(x).join(' | ') + ' |')].join('\n') + (b.caption ? '\n\n*' + b.caption + '*' : ''); }
      case 'stats': return rows(b.text).map(r => '- **' + r[0] + '** — ' + (r[1] || '')).join('\n');
      case 'chart': return chartRows(b.text).map(r => '- ' + r[0] + ': ' + (b.unit === '$' ? '$' : '') + r[1].toLocaleString() + (b.unit === '%' ? '%' : '')).join('\n') + (b.caption ? '\n\n*' + b.caption + '*' : '');
      case 'kv': return rows(b.text).map(r => '- **' + r[0] + ':** ' + (r[1] || '')).join('\n');
      case 'timeline': return rows(b.text).map(r => '- **' + r[0] + '** — ' + (r[1] || '')).join('\n');
      case 'people': return rows(b.text).map(r => '- **' + r[0] + '**' + (r[1] ? ', ' + r[1] : '') + (r[2] ? ' — ' + r[2] : '')).join('\n');
      case 'cta': return '**' + b.text + '**' + (b.sub ? ' — ' + b.sub : '');
      case 'divider': return '---';
      case 'toc': return toc(doc).map(e => '- ' + e.title + ' — ' + e.page).join('\n');
      default: return '';
    }
  }
  function markdown(doc) { return '# ' + doc.title + '\n\n' + (doc.author ? '_' + doc.author + '_\n\n' : '') + doc.pages.map(p => p.blocks.map(b => blockMD(b, doc)).filter(Boolean).join('\n\n')).filter(Boolean).join('\n\n---\n\n') + '\n'; }
  function plain(doc) { return markdown(doc).replace(/^#+\s*/gm, '').replace(/\*\*|__|\*|_/g, '').replace(/^> ?/gm, '').replace(/^\|.*\|$/gm, l => l.replace(/^\| | \|$/g, '').replace(/ \| /g, '\t')).replace(/^\|?\s*---.*$/gm, '').replace(/!\[(.*?)\]\(.*?\)/g, '[Image: $1]'); }

  /* ---------- semantic HTML (EPUB) ---------- */
  function blockHTML(b, doc, imgMap) {
    const a = b.align && b.align !== 'left' ? ' style="text-align:' + (b.align === 'justify' ? 'justify' : b.align) + '"' : '';
    switch (b.t) {
      case 'heading': return '<h' + (b.level + 1) + a + '>' + esc(b.text) + '</h' + (b.level + 1) + '>';
      case 'title': return '<h1 class="title"' + a + '>' + esc(b.text) + '</h1>' + (b.sub ? '<p class="subtitle"' + a + '>' + esc(b.sub) + '</p>' : '');
      case 'kicker': return '<p class="kicker">' + esc(b.text) + '</p>';
      case 'meta': return '<p class="meta"' + a + '>' + esc(b.text) + '</p>';
      case 'para': return '<p' + (b.dropcap ? ' class="dropcap"' : '') + a + '>' + esc(b.text).replace(/\n/g, '<br/>') + '</p>';
      case 'quote': return '<blockquote' + a + '><p>' + esc(b.text) + '</p>' + (b.cite ? '<footer>— ' + esc(b.cite) + '</footer>' : '') + '</blockquote>';
      case 'callout': return '<aside class="callout"><p><strong>' + esc(b.title) + '</strong></p><p>' + esc(b.text) + '</p></aside>';
      case 'list': return (b.ordered ? '<ol>' : '<ul>') + lines(b.text).map(l => '<li>' + esc(l) + '</li>').join('') + (b.ordered ? '</ol>' : '</ul>');
      case 'image': return '<figure>' + (imgMap && imgMap[b.id] ? '<img src="' + imgMap[b.id] + '" alt="' + esc(b.caption) + '"/>' : '<div class="hatch"></div>') + (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
      case 'table': { const r = rows(b.text); return '<table>' + r.map((x, i) => '<tr>' + x.map(c => i ? '<td>' + esc(c) + '</td>' : '<th>' + esc(c) + '</th>').join('') + '</tr>').join('') + '</table>' + (b.caption ? '<p class="meta">' + esc(b.caption) + '</p>' : ''); }
      case 'stats': case 'kv': case 'timeline': case 'people': return '<dl>' + rows(b.text).map(r => '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r.slice(1).join(' — ')) + '</dd>').join('') + '</dl>';
      case 'chart': return '<table>' + chartRows(b.text).map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + r[1].toLocaleString() + '</td></tr>').join('') + '</table>' + (b.caption ? '<p class="meta">' + esc(b.caption) + '</p>' : '');
      case 'cta': return '<p class="cta"><strong>' + esc(b.text) + '</strong>' + (b.sub ? '<br/>' + esc(b.sub) : '') + '</p>';
      case 'divider': return '<hr/>';
      case 'toc': return '<nav><ol>' + toc(doc).map(e => '<li><a href="p-' + String(e.index + 1).padStart(3, '0') + '.xhtml">' + esc(e.title) + '</a></li>').join('') + '</ol></nav>';
      default: return '';
    }
  }
  async function toPng(src, maxW) {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = src; await img.decode();
    const w = img.naturalWidth || 600, h = img.naturalHeight || 400, s = Math.min(1, (maxW || 1600) / w);
    const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return { blob: await new Promise(r => c.toBlob(r, 'image/png')), w: c.width, h: c.height };
  }
  const LOGO = (v) => 'assets/logo/' + ({ lockup: 'hali-lockup-horizontal.svg', symbol: 'hali-symbol.svg', wordmark: 'hali-wordmark.svg', stacked: 'hali-lockup-stacked.svg' }[v] || 'hali-lockup-horizontal.svg');

  async function epub(doc, coverBlob) {
    const JSZip = await lib('JSZip'); const z = new JSZip();
    z.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    z.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
    const css = 'body{font-family:Geist,Georgia,serif;line-height:1.6;color:#1C1A18;margin:0 5%}h1,h2,h3,h4{font-family:Geist,sans-serif;line-height:1.2;letter-spacing:-0.01em}h1.title{font-size:2.2em;margin-top:30%}.subtitle{font-size:1.2em;color:#5C5751}.kicker,.meta{font-family:"Geist Mono",monospace;font-size:.8em;color:#5C5751;text-transform:uppercase;letter-spacing:.04em}.meta{text-transform:none}blockquote{margin:1.5em 0;padding-left:1em;border-left:2px solid #285B57;font-size:1.15em}aside.callout{border:1px solid #DDD9D0;padding:.8em 1em;margin:1em 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #DDD9D0;padding:.3em .5em;text-align:left}figure{margin:1em 0}img{max-width:100%}figcaption{font-size:.85em;color:#5C5751}.hatch{height:6em;background:#F5F3EE}dt{font-weight:600}dd{margin:0 0 .5em}hr{border:0;border-top:1px solid #9C968A}p.dropcap::first-letter{font-size:3em;float:left;line-height:.9;margin-right:.08em;font-weight:600}';
    z.file('OEBPS/style.css', css);
    const imgMap = {}, manifest = [], uid = 'urn:uuid:' + (crypto.randomUUID ? crypto.randomUUID() : doc.id);
    let k = 0;
    for (const p of doc.pages) for (const b of p.blocks) {
      const src = b.t === 'image' ? b.src : b.t === 'logo' ? LOGO(b.variant) : '';
      if (!src) continue;
      try { const r = await toPng(src, 1400); const name = 'images/img-' + (++k) + '.png'; z.file('OEBPS/' + name, r.blob); imgMap[b.id] = name; manifest.push('<item id="img' + k + '" href="' + name + '" media-type="image/png"/>'); } catch (e) {}
    }
    if (coverBlob) { z.file('OEBPS/images/cover.png', coverBlob); manifest.push('<item id="cover-image" href="images/cover.png" media-type="image/png" properties="cover-image"/>'); }
    const spine = [];
    doc.pages.forEach((p, i) => {
      const name = 'p-' + String(i + 1).padStart(3, '0') + '.xhtml';
      const body = p.blocks.map(b => b.t === 'logo' ? (imgMap[b.id] ? '<p><img src="' + imgMap[b.id] + '" alt="Hali" style="max-height:2em"/></p>' : '') : blockHTML(b, doc, imgMap)).join('\n');
      z.file('OEBPS/' + name, '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>' + esc(p.name) + '</title><link rel="stylesheet" href="style.css"/></head><body><section epub:type="' + (p.kind === 'chapter' ? 'chapter' : 'bodymatter') + '">' + body + '</section></body></html>');
      manifest.push('<item id="p' + i + '" href="' + name + '" media-type="application/xhtml+xml"/>'); spine.push('<itemref idref="p' + i + '"/>');
    });
    const entries = toc(doc);
    z.file('OEBPS/nav.xhtml', '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>Contents</title></head><body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>' + (entries.length ? entries : [{ title: doc.title, index: 0 }]).map(e => '<li><a href="p-' + String(e.index + 1).padStart(3, '0') + '.xhtml">' + esc(e.title) + '</a></li>').join('') + '</ol></nav></body></html>');
    z.file('OEBPS/content.opf', '<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">' + uid + '</dc:identifier><dc:title>' + esc(doc.title) + '</dc:title><dc:creator>' + esc(doc.author || '') + '</dc:creator><dc:language>en</dc:language><meta property="dcterms:modified">' + new Date().toISOString().replace(/\.\d+Z$/, 'Z') + '</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>' + manifest.join('') + '</manifest><spine>' + spine.join('') + '</spine></package>');
    return z.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  }

  /* ---------- DOCX ---------- */
  async function docx(doc, size) {
    const JSZip = await lib('JSZip'); const z = new JSZip();
    const rels = [], media = []; let rid = 10, imgN = 0;
    const tw = (px) => Math.round(px * 15);
    const contentW = size.w - size.m[1] - size.m[3];
    const run = (t, o) => { o = o || {}; const pr = (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.caps ? '<w:caps/>' : '') + (o.mono ? '<w:rFonts w:ascii="Geist Mono" w:hAnsi="Geist Mono"/>' : '') + (o.color ? '<w:color w:val="' + o.color + '"/>' : '') + (o.sz ? '<w:sz w:val="' + o.sz + '"/>' : '');
      return String(t).split('\n').map((l, i) => (i ? '<w:r><w:br/></w:r>' : '') + '<w:r>' + (pr ? '<w:rPr>' + pr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + esc(l) + '</w:t></w:r>').join(''); };
    const jc = (a) => a === 'center' ? 'center' : a === 'right' ? 'right' : a === 'justify' ? 'both' : 'left';
    const para = (inner, o) => { o = o || {}; return '<w:p><w:pPr>' + (o.style ? '<w:pStyle w:val="' + o.style + '"/>' : '') + (o.shade ? '<w:pBdr><w:top w:val="single" w:sz="6" w:space="6" w:color="DDD9D0"/><w:left w:val="single" w:sz="6" w:space="6" w:color="DDD9D0"/><w:bottom w:val="single" w:sz="6" w:space="6" w:color="DDD9D0"/><w:right w:val="single" w:sz="6" w:space="6" w:color="DDD9D0"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F5F3EE"/>' : '') + (o.border ? '<w:pBdr><w:top w:val="' + o.border + '" w:sz="8" w:space="1" w:color="9C968A"/></w:pBdr>' : '') + '<w:jc w:val="' + jc(o.align) + '"/></w:pPr>' + inner + '</w:p>'; };
    const table = (r, head) => '<w:tbl><w:tblPr><w:tblStyle w:val="HaliTable"/><w:tblW w:w="5000" w:type="pct"/></w:tblPr>' + r.map((x, i) => '<w:tr>' + x.map(c => '<w:tc><w:p>' + run(c, { b: head && i === 0 }) + '</w:p></w:tc>').join('') + '</w:tr>').join('') + '</w:tbl><w:p/>';
    const image = async (src, maxPx) => {
      try { const r = await toPng(src, 1600); const n = ++imgN, id = 'rId' + (++rid); z.file('word/media/image' + n + '.png', r.blob); rels.push('<Relationship Id="' + id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image' + n + '.png"/>');
        const wpx = Math.min(maxPx || contentW, r.w), hpx = r.h * wpx / r.w, cx = Math.round(wpx * 9525), cy = Math.round(hpx * 9525);
        return '<w:p><w:r><w:drawing><wp:inline><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + n + '" name="Image ' + n + '"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + n + '" name="image' + n + '.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + id + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
      } catch (e) { return para(run('[Image could not be embedded]', { i: true })); }
    };
    const parts = [];
    for (let i = 0; i < doc.pages.length; i++) {
      const p = doc.pages[i];
      if (i) parts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
      for (const b of p.blocks) {
        switch (b.t) {
          case 'heading': parts.push(para(run(b.text), { style: 'Heading' + b.level, align: b.align })); break;
          case 'title': parts.push(para(run(b.text), { style: 'Title', align: b.align })); if (b.sub) parts.push(para(run(b.sub), { style: 'Subtitle', align: b.align })); break;
          case 'kicker': parts.push(para(run(b.text, { mono: true, caps: true, color: '5C5751', sz: 18 }), { align: b.align })); break;
          case 'meta': parts.push(para(run(b.text, { mono: true, color: '5C5751', sz: 18 }), { align: b.align })); break;
          case 'para': parts.push(para(run(b.text, { i: b.italic }), { align: b.align })); break;
          case 'quote': parts.push(para(run(b.text), { style: 'Quote', align: b.align })); if (b.cite) parts.push(para(run('— ' + b.cite, { color: '5C5751' }), { align: b.align })); break;
          case 'callout': parts.push(para(run(b.title, { b: true }) + '<w:r><w:br/></w:r>' + run(b.text), { shade: true })); break;
          case 'list': lines(b.text).forEach((l, j) => parts.push(para(run((b.ordered ? (j + 1) + '.\t' : '•\t') + l), { style: 'ListParagraph' }))); break;
          case 'image': parts.push(b.src ? await image(b.src) : para(run('[Image placeholder]', { i: true, color: '736D65' }))); if (b.caption) parts.push(para(run(b.caption, { i: true, color: '5C5751', sz: 18 }))); break;
          case 'logo': parts.push(await image(LOGO(b.variant), b.variant === 'symbol' ? 48 : 160)); break;
          case 'table': parts.push(table(rows(b.text), true)); if (b.caption) parts.push(para(run(b.caption, { i: true, color: '5C5751', sz: 18 }))); break;
          case 'stats': case 'kv': case 'timeline': case 'people': parts.push(table(rows(b.text), false)); break;
          case 'chart': parts.push(table(chartRows(b.text).map(r => [r[0], (b.unit === '$' ? '$' : '') + r[1].toLocaleString() + (b.unit === '%' ? '%' : '')]), false)); if (b.caption) parts.push(para(run(b.caption, { i: true, color: '5C5751', sz: 18 }))); break;
          case 'cta': parts.push(para(run(b.text, { b: true, color: '285B57' }) + (b.sub ? '<w:r><w:br/></w:r>' + run(b.sub, { color: '5C5751' }) : ''), { align: b.align })); break;
          case 'divider': parts.push(para('', { border: b.dash === 'dotted' ? 'dotted' : b.dash === 'dashed' ? 'dashed' : 'single' })); break;
          case 'spacer': parts.push('<w:p/>'); break;
          case 'toc': toc(doc).forEach(e => parts.push(para(run(e.title + '\t' + e.page), { style: 'TOCEntry' }))); break;
        }
      }
    }
    const sect = '<w:sectPr><w:pgSz w:w="' + tw(size.w) + '" w:h="' + tw(size.h || 1123) + '"/><w:pgMar w:top="' + tw(size.m[0]) + '" w:right="' + tw(size.m[1]) + '" w:bottom="' + tw(size.m[2]) + '" w:left="' + tw(size.m[3]) + '" w:header="400" w:footer="400" w:gutter="0"/></w:sectPr>';
    z.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>' + parts.join('') + sect + '</w:body></w:document>');
    const st = (id, name, rpr, ppr, basedOn) => '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/>' + (basedOn ? '<w:basedOn w:val="' + basedOn + '"/>' : '') + '<w:qFormat/><w:pPr>' + (ppr || '') + '</w:pPr><w:rPr>' + (rpr || '') + '</w:rPr></w:style>';
    z.file('word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Geist" w:hAnsi="Geist" w:cs="Geist"/><w:color w:val="1C1A18"/><w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="384" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      st('Normal', 'Normal') + st('Title', 'Title', '<w:b/><w:sz w:val="72"/><w:spacing w:val="-20"/>', '<w:spacing w:after="120" w:line="240" w:lineRule="auto"/>', 'Normal') + st('Subtitle', 'Subtitle', '<w:color w:val="5C5751"/><w:sz w:val="32"/>', '', 'Normal') +
      st('Heading1', 'heading 1', '<w:b/><w:sz w:val="52"/><w:spacing w:val="-10"/>', '<w:keepNext/><w:spacing w:before="240" w:after="160" w:line="276" w:lineRule="auto"/><w:outlineLvl w:val="0"/>', 'Normal') +
      st('Heading2', 'heading 2', '<w:b/><w:sz w:val="36"/>', '<w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="1"/>', 'Normal') + st('Heading3', 'heading 3', '<w:b/><w:sz w:val="28"/>', '<w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="2"/>', 'Normal') +
      st('Quote', 'Quote', '<w:sz w:val="32"/><w:color w:val="1C1A18"/>', '<w:pBdr><w:left w:val="single" w:sz="12" w:space="12" w:color="285B57"/></w:pBdr><w:ind w:left="360"/>', 'Normal') + st('ListParagraph', 'List Paragraph', '', '<w:ind w:left="360" w:hanging="360"/><w:spacing w:after="60"/>', 'Normal') +
      st('TOCEntry', 'TOC entry', '', '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="' + tw(contentW) + '"/></w:tabs>', 'Normal') +
      '<w:style w:type="table" w:styleId="HaliTable"><w:name w:val="Hali table"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="DDD9D0"/><w:left w:val="single" w:sz="4" w:color="DDD9D0"/><w:bottom w:val="single" w:sz="4" w:color="DDD9D0"/><w:right w:val="single" w:sz="4" w:color="DDD9D0"/><w:insideH w:val="single" w:sz="4" w:color="DDD9D0"/><w:insideV w:val="single" w:sz="4" w:color="DDD9D0"/></w:tblBorders><w:tblCellMar><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>');
    z.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' + rels.join('') + '</Relationships>');
    z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>');
    z.file('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + esc(doc.title) + '</dc:title><dc:creator>' + esc(doc.author || '') + '</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">' + new Date().toISOString() + '</dcterms:created></cp:coreProperties>');
    z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
    return z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  /* ---------- layout-faithful formats (use rendered page nodes at 1:1) ---------- */
  const fontLink = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">';
  function absolutize(html) { const base = location.href.replace(/[^/]*$/, ''); return html.replace(/src="(?!data:|https?:|blob:)([^"]+)"/g, (m, p) => 'src="' + base + p + '"'); }
  function htmlFile(doc, nodes, forPrint) {
    const size = window.HaliDocs.SIZES[doc.size];
    const pageCSS = size.h ? '@page{size:' + size.w + 'px ' + size.h + 'px;margin:0}' : '@page{size:' + size.w + 'px auto;margin:0}';
    const pages = nodes.map(n => '<div class="pg">' + n.outerHTML + '</div>').join('\n');
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(doc.title) + '</title>' + fontLink +
      '<style>' + pageCSS + 'html,body{margin:0;background:' + (forPrint ? '#fff' : '#ECE9E2') + ';-webkit-print-color-adjust:exact;print-color-adjust:exact}body{display:flex;flex-direction:column;align-items:center;gap:' + (forPrint ? 0 : 32) + 'px;padding:' + (forPrint ? 0 : 32) + 'px 0}.pg{break-after:page;max-width:100%;overflow:hidden}.pg:last-child{break-after:auto}@media print{body{background:#fff;padding:0;gap:0}}</style></head><body>' + absolutize(pages) + '</body></html>';
  }
  function printNodes(doc, nodes) {
    return new Promise((res, rej) => {
      const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f);
      const d = f.contentDocument; d.open(); d.write(htmlFile(doc, nodes, true)); d.close();
      const go = () => { try { f.contentWindow.focus(); f.contentWindow.print(); res(); } catch (e) { rej(e); } setTimeout(() => f.remove(), 60000); };
      (f.contentDocument.fonts ? f.contentDocument.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 400));
    });
  }
  async function pdf(doc, nodes, onProgress) {
    const { jsPDF } = await lib('jspdf'); const X = window.HaliExport; let p = null;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i], w = n.offsetWidth, h = n.offsetHeight, wpt = w * 0.75, hpt = h * 0.75;
      const blob = await X.capture(n, { format: 'jpg', scale: 2, quality: 0.92, w, h, bg: '#FFFFFF' });
      const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
      if (!p) p = new jsPDF({ unit: 'pt', format: [wpt, hpt], orientation: w > h ? 'landscape' : 'portrait', compress: true }); else p.addPage([wpt, hpt], w > h ? 'landscape' : 'portrait');
      p.addImage(url, 'JPEG', 0, 0, wpt, hpt); if (onProgress) onProgress(i + 1, nodes.length);
    }
    p.setProperties({ title: doc.title, author: doc.author || '' });
    return p.output('blob');
  }
  const rgbHex = (c) => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || ''); return m ? [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('').toUpperCase() : '1C1A18'; };
  async function pptx(doc, nodes, onProgress) {
    const P = await lib('PptxGenJS'), h2i = await lib('htmlToImage'); const X = window.HaliExport; const fontCSS = await X.fontCSS();
    const pres = new P(); const n0 = nodes[0]; const W = n0.offsetWidth, H = n0.offsetHeight;
    pres.defineLayout({ name: 'HALI', width: W / 96, height: H / 96 }); pres.layout = 'HALI'; pres.title = doc.title; pres.author = doc.author || '';
    const inch = (px) => px / 96;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i], slide = pres.addSlide(), nr = node.getBoundingClientRect();
      slide.background = { color: rgbHex(getComputedStyle(node).backgroundColor) };
      for (const el of node.querySelectorAll('[data-raster]')) {
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const url = await h2i.toPng(el, { pixelRatio: 2, fontEmbedCSS: fontCSS, width: r.width, height: r.height });
        slide.addImage({ data: url, x: inch(r.left - nr.left), y: inch(r.top - nr.top), w: inch(r.width), h: inch(r.height) });
      }
      for (const el of node.querySelectorAll('[data-txt]')) {
        if (el.closest('[data-raster]')) continue;
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el); if (!r.width || !el.innerText.trim()) continue;
        slide.addText(el.innerText, { x: inch(r.left - nr.left), y: inch(r.top - nr.top), w: inch(r.width) + 0.05, h: inch(r.height) + 0.02, margin: 0, valign: 'top',
          fontFace: /Mono/.test(cs.fontFamily) ? 'Geist Mono' : 'Geist', fontSize: Math.max(6, parseFloat(cs.fontSize) * 0.75), bold: +cs.fontWeight >= 600, italic: cs.fontStyle === 'italic',
          color: rgbHex(cs.color), align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : cs.textAlign === 'justify' ? 'justify' : 'left', lineSpacingMultiple: Math.min(2, (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3) / parseFloat(cs.fontSize)), charSpacing: (parseFloat(cs.letterSpacing) || 0) * 0.75, fit: 'none' });
      }
      if (onProgress) onProgress(i + 1, nodes.length);
    }
    return pres.write({ outputType: 'blob' });
  }
  window.HaliDocExport = { lib, markdown, plain, docx, epub, pdf, pptx, htmlFile, printNodes, toc, pageLabel, rows, lines, chartRows };
})();
