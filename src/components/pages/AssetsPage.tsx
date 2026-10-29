'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Icon, IconButton } from '@/components/ds';
import { StudioHeader } from '@/components/shell/StudioHeader';
import { GRAPHICS, ICON_DIR, ICON_FILES, LOGO_DIR, LOGO_FILES } from '@/lib/assets';
import { canShareFiles, download, shareFiles, zip } from '@/lib/export';
import { ROUTES } from '@/lib/nav';
import s from './assets.module.css';

interface Asset { name: string; file: string; bg: string; src: string; href: string; nonImage?: boolean; generated?: boolean }
interface Group { name: string; path: string; note: string; items: Asset[] }

const EXTERNAL = [
  { name: 'Geist and Geist Mono', note: 'SIL Open Font License 1.1. Self-hosted WOFF2 files from the geist package (public/fonts).', href: 'https://vercel.com/font', link: 'vercel.com/font →', external: true },
  { name: 'Lucide icons', note: 'ISC licence. Bundled as lucide-react 0.460.0 components (same set as the lucide-static 0.460.0 font).', href: 'https://lucide.dev', link: 'lucide.dev →', external: true },
  { name: 'Not available', note: 'No photography, illustration or agency work samples were supplied. Templates use the hatch placeholder until real agency work is uploaded in the editor.', href: ROUTES.editor, link: 'Open the editor →', external: false },
];

export function AssetsPage() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [zipping, setZipping] = useState(false);
  const [zipDone, setZipDone] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [shareable, setShareable] = useState(false);
  const blobs = useRef(new Map<string, Blob>());
  useEffect(() => setShareable(canShareFiles()), []);

  /** Phones: send one file to the share sheet (Save to Photos / Files, or another app). */
  const shareOne = async (a: Asset) => {
    try {
      let blob = blobs.current.get(a.file);
      if (!blob) {
        const gen = GRAPHICS.find((x) => x[1] === a.file);
        blob = gen ? new Blob([gen[2]], { type: 'image/svg+xml' }) : await (await fetch(a.href)).blob();
        blobs.current.set(a.file, blob);
      }
      const r = await shareFiles([{ name: a.file, blob }], a.name);
      if (r === 'blocked') setMsg({ tone: 'success', text: a.file + ' is ready. Tap Share again to open the share sheet.' });
    } catch (e) {
      setMsg({ tone: 'error', text: 'Sharing failed: ' + ((e as Error).message || e) + ' Use the download link instead.' });
    }
  };

  useEffect(() => {
    const u = Object.fromEntries(GRAPHICS.map(([, f, src]) => [f, URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' }))]));
    setUrls(u);
    return () => Object.values(u).forEach((x) => URL.revokeObjectURL(x));
  }, []);

  const groups: Group[] = useMemo(() => [
    { name: 'Logo', path: 'assets/logo/', note: 'Vector masters. Default tone on light backgrounds, reverse on Ink or Deep Sea, mono for one-colour use. Keep clear space equal to the folded corner.', items: LOGO_FILES.map(([name, file, bg]) => ({ name, file, bg, src: LOGO_DIR + file, href: LOGO_DIR + file })) },
    { name: 'Favicons, app icons and social', path: 'assets/icons/', note: 'For Hali-owned surfaces. Agency pages and client portals use the agency\'s own favicon.', items: ICON_FILES.map(([name, file]) => ({ name, file, bg: 'var(--surface-subtle)', src: ICON_DIR + file, href: ICON_DIR + file, nonImage: file.endsWith('.webmanifest') })) },
    { name: 'Template graphics', path: 'generated from tokens', note: 'Motif, hatch, backgrounds and overlay used by templates, generated from the brand tokens at download time.', items: GRAPHICS.map(([name, file]) => ({ name, file, bg: 'var(--surface-subtle)', src: urls[file] || '', href: urls[file] || '', generated: true })) },
  ], [urls]);

  const allFiles = groups.flatMap((g) => g.items.map((a) => a.file));
  const n = allFiles.filter((f) => sel[f]).length;
  const setMany = (files: string[], v: boolean) => { setSel((p) => { const x = { ...p }; files.forEach((f) => { x[f] = v; }); return x; }); setZipDone(false); };

  const doZip = async () => {
    setZipping(true); setZipDone(false); setMsg(null);
    try {
      const files: { name: string; blob: Blob }[] = [];
      for (const g of groups) for (const a of g.items) {
        if (!sel[a.file]) continue;
        const gen = GRAPHICS.find((x) => x[1] === a.file);
        let blob: Blob;
        if (gen) blob = new Blob([gen[2]], { type: 'image/svg+xml' });
        else {
          const r = await fetch(a.href);
          if (!r.ok) throw new Error(a.file + ' could not be fetched (' + r.status + ').');
          blob = await r.blob();
        }
        files.push({ name: gen ? 'graphics/' + a.file : a.href.replace(/^\/assets\//, ''), blob });
      }
      download(await zip(files), 'hali-brand-assets.zip');
      setZipping(false); setZipDone(true);
      setMsg({ tone: 'success', text: 'Downloaded ' + files.length + ' files in hali-brand-assets.zip.' });
      setTimeout(() => setZipDone(false), 2000);
    } catch (e) {
      setZipping(false);
      setMsg({ tone: 'error', text: 'The ZIP could not be created: ' + ((e as Error).message || e) + ' Download files individually instead.' });
    }
  };

  return (
    <div className={s.page}>
      <StudioHeader />
      <main className={s.main}>
        <div className={s.hero}>
          <div className={s.heroText}>
            <span className="st-overline">Asset library · {allFiles.length} files</span>
            <h1 className="st-h1" style={{ fontSize: 'clamp(30px, 4.6vw, 44px)' }}>Brand assets</h1>
            <p className="st-lede" style={{ fontSize: 16 }}>The same files the editor and templates use, from <code className={s.code}>assets/</code>. Download one, or select several and download a ZIP.</p>
          </div>
          <div className={s.heroActions}>
            <Button variant="ghost" size="sm" onClick={() => setMany(allFiles, n !== allFiles.length)}>{n === allFiles.length ? 'Clear selection' : 'Select all'}</Button>
            <Button variant="primary" size="sm" iconStart="download" loading={zipping} success={zipDone} disabled={n === 0} onClick={doZip}>{n ? 'Download ' + n + ' as ZIP' : 'Select files to download'}</Button>
          </div>
        </div>
        {msg && <Alert tone={msg.tone} onDismiss={() => setMsg(null)}>{msg.text}</Alert>}

        {groups.map((g) => {
          const files = g.items.map((a) => a.file);
          const all = files.every((f) => sel[f]);
          return (
            <section key={g.name} className={s.group}>
              <div className={s.groupHead}>
                <h2 className={s.h2}>{g.name}</h2>
                <span className="st-mono">{g.path}</span>
                <span style={{ flex: 1 }} />
                <button type="button" className={s.textBtn} onClick={() => setMany(files, !all)}>{all ? 'Clear group' : 'Select group'}</button>
              </div>
              <span className="st-small" style={{ maxWidth: 720 }}>{g.note}</span>
              <div className={s.grid}>
                {g.items.map((a) => (
                  <div key={a.file} className={s.card} data-selected={sel[a.file] || undefined}>
                    <div className={s.preview} style={{ background: a.bg }}>
                      {a.nonImage
                        ? <Icon name="file-json" size={32} style={{ color: 'var(--icon-secondary)' }} />
                        // eslint-disable-next-line @next/next/no-img-element
                        : a.src ? <img src={a.src} alt={a.name} loading="lazy" className={s.img} /> : null}
                    </div>
                    <div className={s.meta}>
                      <span className={s.name}>{a.name}</span>
                      <span className={s.file}>{a.file}</span>
                      <div className={s.actions}>
                        <Checkbox label="Select" checked={!!sel[a.file]} onChange={(v) => setMany([a.file], v)} />
                        {shareable && <IconButton icon="share-2" label={'Share ' + a.file} size="sm" onClick={() => shareOne(a)} />}
                        <a href={a.href || undefined} download={a.file} className={s.dl} aria-label={'Download ' + a.file}>
                          <Icon name="download" size={14} />{a.file.split('.').pop()!.toUpperCase()}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section className={s.group}>
          <h2 className={s.h2} style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 10 }}>Fonts and external assets</h2>
          <div>
            {EXTERNAL.map((e) => (
              <div key={e.name} className={s.ext}>
                <span className={s.extName}>{e.name}</span>
                <span className={s.extNote}>{e.note}{' '}
                  {e.external ? <a href={e.href} target="_blank" rel="noopener noreferrer">{e.link}</a> : <Link href={e.href}>{e.link}</Link>}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
