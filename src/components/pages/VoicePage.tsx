'use client';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, IconButton, StatusBadge } from '@/components/ds';
import { Menu } from '@/components/shell/Menu';
import { StudioHeader } from '@/components/shell/StudioHeader';
import { VOICE, copy, download, voiceText, type VoiceSection } from '@/lib/brand';
import s from './voice.module.css';

type Filter = 'all' | 'verified' | 'confirm';
const FILTERS: [Filter, string][] = [['all', 'All sections'], ['verified', 'Verified'], ['confirm', 'Needs confirmation']];
const HEADER = 'HALI — BRAND VOICE AND KNOWLEDGE REFERENCE\nUse only these facts. Sections marked "Needs confirmation" are gaps or proposals: use [bracketed placeholders] rather than inventing details.\n\n';
const MD_HEADER = '# Hali — Brand voice and knowledge reference\n\n> Use only these facts. Sections marked *Needs confirmation* are gaps or proposals: use [bracketed placeholders] rather than inventing details.\n\n';

export function VoicePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  const list: VoiceSection[] = VOICE.filter((v) => filter === 'all' || v.status === filter);
  const doCopy = async (key: string, text: string) => {
    const ok = await copy(text);
    setCopied(ok ? key : null);
    setCopyError(!ok);
    clearTimeout(t.current);
    t.current = setTimeout(() => setCopied(null), 1800);
  };
  const copyAll = () => doCopy('__all', HEADER + voiceText(list, false));
  const downloadMd = () => download(MD_HEADER + voiceText(list, true) + '\n', 'hali-brand-voice-and-knowledge.md', 'text/markdown');
  const downloadTxt = () => download(HEADER + voiceText(list, false) + '\n', 'hali-brand-voice-and-knowledge.txt', 'text/plain');
  const allLabel = copied === '__all' ? 'Copied' : filter === 'all' ? 'Copy everything' : 'Copy ' + list.length + ' sections';

  return (
    <div className={s.page}>
      <StudioHeader />
      <main className={s.main}>
        <div className={s.intro}>
          <span className="st-overline">Brand voice &amp; knowledge</span>
          <h1 className="st-h1" style={{ fontSize: 'clamp(30px, 4.6vw, 44px)' }}>Everything an AI tool or writer needs to write as Hali</h1>
          <p className="st-lede" style={{ fontSize: 16 }}>Copy one section or the whole reference into ChatGPT, Claude or a content calendar. Each section is marked Verified (stated in Hali&apos;s source documents) or Needs confirmation (a gap or proposal the brand owner must approve). Nothing here is invented.</p>
        </div>

        <div className={s.toolbar}>
          <div role="group" aria-label="Filter sections" className={'st-seg ' + s.seg}>
            {FILTERS.map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
            ))}
          </div>
          <div className={s.spacer} />
          <div className={s.wide}>
            <Button variant="secondary" size="sm" iconStart="file-down" onClick={downloadMd}>Markdown</Button>
            <Button variant="secondary" size="sm" iconStart="file-text" onClick={downloadTxt}>Plain text</Button>
            <Button variant="primary" size="sm" iconStart="copy" success={copied === '__all'} onClick={copyAll}>{allLabel}</Button>
          </div>
          <div className={s.narrow}>
            <Button variant="primary" size="sm" iconStart="copy" success={copied === '__all'} onClick={copyAll}>{copied === '__all' ? 'Copied' : 'Copy'}</Button>
            <Menu
              label="Download"
              items={[
                { label: 'Download Markdown', icon: 'file-down', onSelect: downloadMd },
                { label: 'Download plain text', icon: 'file-text', onSelect: downloadTxt },
              ]}
              trigger={({ open, toggle }) => <IconButton icon="download" label="Download" variant="secondary" size="sm" pressed={open} onClick={toggle} />}
            />
          </div>
        </div>
        {filter !== 'all' && <p className={s.count} aria-live="polite">{list.length} of {VOICE.length} sections shown. Copy and downloads include only these.</p>}

        {copyError && (
          <Alert tone="error" title="Copy failed" onDismiss={() => setCopyError(false)}>Your browser blocked clipboard access. Download the Markdown file instead.</Alert>
        )}

        <nav aria-label="Contents" className={s.toc}>
          {list.map((v) => <a key={v.id} href={'#' + v.id} className={s.tocLink}>{v.title}</a>)}
        </nav>

        <div className={s.sections}>
          {list.map((v) => {
            const ok = v.status === 'verified';
            return (
              <section key={v.id} id={v.id} className={s.section}>
                <div className={s.sectionHead}>
                  <h2 className={s.h2}>{v.title}</h2>
                  <div className={s.sectionMeta}>
                    <StatusBadge tone={ok ? 'success' : 'attention'} icon={ok ? 'shield-check' : 'circle-help'} size="sm">{ok ? 'Verified' : 'Needs confirmation'}</StatusBadge>
                    <Button variant="ghost" size="sm" iconStart="copy" success={copied === v.id} onClick={() => doCopy(v.id, voiceText([v], false))}>{copied === v.id ? 'Copied' : 'Copy'}</Button>
                  </div>
                </div>
                <div className={s.body} data-confirm={!ok || undefined}>{v.body}</div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
