'use client';
import { Button, Icon, IconButton } from '@/components/ds';
import type { Design, El } from '@/lib/templates';
import { Thumb } from './Artwork';
import { SortableItem, SortableList } from './SortableList';

export const EL_ICON: Record<El['type'], string> = { text: 'type', shape: 'square', line: 'minus', image: 'image', logo: 'hexagon' };
export const pretty = (role?: string) => !role || role.startsWith('custom') ? '' : role.replace(/-\d+$/, (m) => ' ' + (+m.slice(1) + 1)).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const ADD_TOOLS: [string, string, string][] = [['heading', 'Heading', 'heading'], ['text', 'Text', 'pilcrow'], ['label', 'Label', 'tag'], ['button', 'Button', 'mouse-pointer-click'], ['image', 'Image', 'image'], ['shape', 'Shape', 'square'], ['line', 'Line', 'minus'], ['logo', 'Logo', 'hexagon']];

export interface PagesPanelProps {
  doc: Design;
  pi: number;
  sel: string | null;
  addAt: number | null;
  layouts: { key: string; name: string }[];
  onSelectPage(i: number): void;
  onMovePage(from: number, to: number): void;
  onDupPage(i: number): void;
  onDelPage(i: number): void;
  setAddAt(i: number | null): void;
  onInsertPage(at: number, key: string): void;
  onAdd(kind: string): void;
  onSelectEl(id: string): void;
  onToggleHidden(id: string): void;
}

export function PagesPanel(p: PagesPanelProps) {
  const { doc, pi } = p;
  const page = doc.pages[pi];
  const n = doc.pages.length;
  return (
    <>
      <div className="ed-list-head">
        <span className="ed-over">Pages · {n}</span>
        <Button variant="ghost" size="sm" iconStart="plus" onClick={() => p.setAddAt(p.addAt === null ? n : null)}>Add page</Button>
      </div>
      {p.addAt !== null && (
        <div className="ed-addmenu" role="menu" aria-label="Page layouts">
          <span className="ed-hint" style={{ padding: '0 4px 4px' }}>Insert as page {p.addAt + 1} of {n + 1}</span>
          {p.layouts.map((l) => <button key={l.key} type="button" role="menuitem" onClick={() => p.onInsertPage(p.addAt ?? n, l.key)}>{l.name}</button>)}
          <button type="button" onClick={() => p.setAddAt(null)} style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Cancel</button>
        </div>
      )}
      <div className="ed-pages">
        <SortableList ids={doc.pages.map((x) => x.id)} onMove={p.onMovePage}>
          {doc.pages.map((pg, i) => (
            <SortableItem key={pg.id} id={pg.id} label={'page ' + (i + 1)} className="ed-pagecard" active={i === pi} footer={i === pi ? (
          <div className="ed-pageacts" aria-label={'Page ' + (i + 1) + ' actions'} role="toolbar">
            <IconButton icon="arrow-up" label="Move page up" size="sm" disabled={i === 0} onClick={() => p.onMovePage(i, i - 1)} />
            <IconButton icon="arrow-down" label="Move page down" size="sm" disabled={i === n - 1} onClick={() => p.onMovePage(i, i + 1)} />
            <IconButton icon="copy" label="Duplicate page" size="sm" onClick={() => p.onDupPage(i)} />
            <IconButton icon="between-horizontal-start" label="Insert page before" size="sm" onClick={() => p.setAddAt(i)} />
            <IconButton icon="between-horizontal-end" label="Insert page after" size="sm" onClick={() => p.setAddAt(i + 1)} />
            <IconButton icon="trash-2" label="Delete page" size="sm" disabled={n < 2} onClick={() => p.onDelPage(i)} />
          </div>
              ) : undefined}>
              <button type="button" className="ed-pagesel" aria-current={i === pi} onClick={() => p.onSelectPage(i)}>
                <span className="ed-thumb"><Thumb doc={doc} page={pg} pi={i} bw={64} bh={64} /></span>
                <span className="ed-pagemeta">
                  <span className="ed-pagenum">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ed-pagename">{pg.name}</span>
                </span>
              </button>
            </SortableItem>
          ))}
        </SortableList>
      </div>
      <div className="ed-tools">
        <span className="ed-over">Add to page</span>
        <div className="ed-toolgrid">
          {ADD_TOOLS.map(([k, label, icon]) => (
            <button key={k} type="button" className="ed-tool" title={label} onClick={() => p.onAdd(k)}><Icon name={icon} size={16} />{label}</button>
          ))}
        </div>
      </div>
      <div className="ed-layers">
        <span className="ed-over" style={{ padding: '6px 0' }}>Layers · top first</span>
        {page.els.slice().reverse().map((x) => {
          const label = x.type === 'text'
            ? (x.auto ? 'Page number' : (x.text || '').slice(0, 40) || pretty(x.role) || 'Text')
            : (pretty(x.role) || x.type[0].toUpperCase() + x.type.slice(1)) + (x.type === 'logo' ? ' · ' + x.logo : '');
          return (
            <div key={x.id} className="ed-layer" aria-current={x.id === p.sel}>
              <button type="button" className="ed-layer-btn" data-hidden={x.hidden || undefined} onClick={() => p.onSelectEl(x.id)}>
                <Icon name={EL_ICON[x.type]} size={14} /><span>{label}</span>
              </button>
              <IconButton icon={x.hidden ? 'eye-off' : 'eye'} label={x.hidden ? 'Show layer' : 'Hide layer'} size="sm" onClick={() => p.onToggleHidden(x.id)} />
            </div>
          );
        })}
      </div>
    </>
  );
}
