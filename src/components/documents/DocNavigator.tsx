'use client';
import { Button, Icon, IconButton } from '@/components/ds';
import type { Doc } from '@/lib/documents';
import { pageLabel } from '@/lib/docexport';
import { SortableItem, SortableList } from '@/components/editor/SortableList';

export interface DocNavigatorProps {
  doc: Doc;
  pi: number;
  word: string;
  addAt: number | null;
  kinds: { id: string; name: string }[];
  kindName(k: string): string;
  overflow: Record<string, boolean>;
  typeName: string;
  onSelect(i: number): void;
  onMove(from: number, to: number): void;
  onDup(i: number): void;
  onDel(i: number): void;
  setAddAt(i: number | null): void;
  onInsert(at: number, kind: string): void;
  onFixAll(): void;
}

export function DocNavigator(p: DocNavigatorProps) {
  const { doc, pi } = p;
  const n = doc.pages.length;
  const ov = Object.keys(p.overflow).filter((id) => doc.pages.some((x) => x.id === id));
  return (
    <>
      <div className="ed-list-head">
        <span className="ed-over">{p.word} · {n}</span>
        <Button variant="ghost" size="sm" iconStart="plus" onClick={() => p.setAddAt(p.addAt === null ? n : null)}>Add</Button>
      </div>
      {ov.length > 0 && (
        <div className="dc-overflow" role="status">
          <span>{ov.length + (ov.length === 1 ? ' page has' : ' pages have')} more content than fits. Move the overflow onto new pages, or shorten the text.</span>
          <Button variant="secondary" size="sm" iconStart="split" onClick={p.onFixAll}>Flow onto new pages</Button>
        </div>
      )}
      {p.addAt !== null && (
        <div className="ed-addmenu" role="menu" aria-label="Page types">
          <span className="ed-hint" style={{ padding: '0 4px 4px' }}>Insert at position {p.addAt + 1} — choose a {p.typeName.toLowerCase()} page:</span>
          {p.kinds.map((k) => <button key={k.id} type="button" role="menuitem" onClick={() => p.onInsert(p.addAt ?? n, k.id)}>{k.name}</button>)}
          <button type="button" role="menuitem" onClick={() => p.onInsert(p.addAt ?? n, 'continued')}>Blank page</button>
          <button type="button" onClick={() => p.setAddAt(null)} style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Cancel</button>
        </div>
      )}
      <div className="ed-pages" style={{ padding: '0 8px 12px', gap: 2 }}>
        <SortableList ids={doc.pages.map((x) => x.id)} onMove={p.onMove}>
          {doc.pages.map((pg, i) => {
            const lab = pageLabel(doc, i);
            const active = i === pi;
            return (
              <SortableItem
                key={pg.id}
                id={pg.id}
                label={'page ' + (i + 1)}
                className="dc-pagerow"
                active={active}
                footer={active ? (
                  <div className="ed-pageacts" role="toolbar" aria-label={'Page ' + (i + 1) + ' actions'}>
                    <IconButton icon="arrow-up" label="Move page up" size="sm" disabled={i === 0} onClick={() => p.onMove(i, i - 1)} />
                    <IconButton icon="arrow-down" label="Move page down" size="sm" disabled={i === n - 1} onClick={() => p.onMove(i, i + 1)} />
                    <IconButton icon="copy" label="Duplicate page" size="sm" onClick={() => p.onDup(i)} />
                    <IconButton icon="between-horizontal-start" label="Insert page before" size="sm" onClick={() => p.setAddAt(i)} />
                    <IconButton icon="between-horizontal-end" label="Insert page after" size="sm" onClick={() => p.setAddAt(i + 1)} />
                    <IconButton icon="trash-2" label="Delete page" size="sm" disabled={n < 2} onClick={() => p.onDel(i)} />
                  </div>
                ) : undefined}
              >
                <button type="button" className="dc-pagesel" aria-current={active} onClick={() => p.onSelect(i)}>
                  <span className="dc-pagenum">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ed-pagemeta">
                    <span className="ed-pagename">{pg.name}</span>
                    <span className="dc-pagekind">{p.kindName(pg.kind) + (lab ? ' · p. ' + lab : '') + ' · ' + pg.blocks.length + ' blocks'}</span>
                  </span>
                  {p.overflow[pg.id] ? <Icon name="triangle-alert" size={14} label="Content overflows this page" style={{ color: 'var(--attention-icon)' }} /> : <span />}
                </button>
              </SortableItem>
            );
          })}
        </SortableList>
      </div>
    </>
  );
}
