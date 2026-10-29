'use client';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@/components/ds';

/** Vertical list reorderable by a grip handle — mouse, touch (long-press) and keyboard (space + arrows). */
export function SortableList({ ids, onMove, children }: { ids: string[]; onMove: (from: number, to: number) => void; children: ReactNode }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    onMove(ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>{children}</SortableContext>
    </DndContext>
  );
}

export function SortableItem({ id, label, className, active, children, footer }: { id: string; label: string; className: string; active?: boolean; children: ReactNode; footer?: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 2 : undefined };
  return (
    <div ref={setNodeRef} style={style} className={className} data-active={active || undefined} data-dragging={isDragging || undefined}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', minWidth: 0 }}>
        <span ref={setActivatorNodeRef} className="ed-grip" aria-label={'Reorder ' + label} {...attributes} {...listeners}><Icon name="grip-vertical" size={16} /></span>
        {children}
      </div>
      {footer}
    </div>
  );
}
