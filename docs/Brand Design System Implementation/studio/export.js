/* Hali Brand Studio — client-side export engine (PNG / JPEG / SVG / ZIP / JSON). */
(function () {
  const LIBS = {
    htmlToImage: 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js',
    JSZip: 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
  };
  const loading = {};
  function lib(name) {
    if (window[name]) return Promise.resolve(window[name]);
    if (!loading[name]) loading[name] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = LIBS[name];
      s.onload = () => window[name] ? res(window[name]) : rej(new Error(name + ' did not load'));
      s.onerror = () => rej(new Error('Could not load ' + name + '. Check your connection.'));
      document.head.appendChild(s);
    });
    return loading[name];
  }
  let fontCSSPromise = null;
  const toDataURL = (blob) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
  function fontCSS() {
    if (fontCSSPromise) return fontCSSPromise;
    fontCSSPromise = (async () => {
      try {
        const css = await (await fetch('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap')).text();
        const blocks = css.split('/*').filter(b => /^\s*latin \*\//.test(b)).map(b => '/*' + b);
        let out = blocks.join('\n');
        const urls = [...new Set((out.match(/url\((https:[^)]+)\)/g) || []).map(m => m.slice(4, -1)))];
        for (const u of urls) { const d = await toDataURL(await (await fetch(u)).blob()); out = out.split(u).join(d); }
        return out;
      } catch (e) { console.warn('Font embedding failed; export will use fallback fonts.', e); return ''; }
    })();
    return fontCSSPromise;
  }
  const waitImages = (node) => Promise.all([...node.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  async function capture(node, o) {
    const h2i = await lib('htmlToImage'); await waitImages(node); if (document.fonts) await document.fonts.ready;
    const opts = { width: o.w, height: o.h, pixelRatio: o.scale || 1, cacheBust: false, fontEmbedCSS: await fontCSS(), style: { transform: 'none', margin: '0', left: '0', top: '0' }, skipAutoScale: true };
    if (o.format === 'svg') { const url = await h2i.toSvg(node, opts); return new Blob([decodeURIComponent(url.split(',').slice(1).join(','))], { type: 'image/svg+xml' }); }
    if (o.format === 'jpg') { opts.quality = o.quality || 0.92; opts.backgroundColor = o.bg || '#FFFFFF'; return await (await fetch(await h2i.toJpeg(node, opts))).blob(); }
    return await h2i.toBlob(node, opts);
  }
  function download(blob, filename) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  async function zip(files) { const JSZip = await lib('JSZip'); const z = new JSZip(); files.forEach(f => z.file(f.name, f.blob)); return z.generateAsync({ type: 'blob' }); }
  const slug = (s) => String(s || 'design').toLowerCase().replace(/[—–]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  const ext = (f) => f === 'jpg' ? 'jpg' : f === 'svg' ? 'svg' : 'png';
  window.HaliExport = { lib, capture, download, zip, slug, ext, fontCSS };
})();
