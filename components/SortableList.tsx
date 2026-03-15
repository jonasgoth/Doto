'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
  gap?: number;
}

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  // Current pointer position
  x: number;
  y: number;
  dropIndex: number;
}

interface SettleState {
  id: string;
  item: unknown;
  width: number;
  height: number;
  fromLeft: number;
  fromTop: number;
  toLeft: number;
  toTop: number;
}

const SETTLE_MS = 180;

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  gap = 8,
}: SortableListProps<T>) {
  const [drag, setDrag] = useState<DragState | null>(null);
  // Separate "settling" phase: card animates from drop-point back into slot
  const [settle, setSettle] = useState<SettleState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const placeholderRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  const itemsRef = useRef(items);
  const onReorderRef = useRef(onReorder);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { onReorderRef.current = onReorder; }, [onReorder]);

  const computeDropIndex = useCallback((clientY: number, draggedId: string): number => {
    const nonDraggedItems = itemsRef.current.filter((i) => i.id !== draggedId);
    const rects = nonDraggedItems
      .map((item) => itemRefs.current.get(item.id)?.getBoundingClientRect() ?? null)
      .filter(Boolean) as DOMRect[];

    let idx = rects.findIndex((r) => clientY < r.top + r.height / 2);
    if (idx === -1) idx = itemsRef.current.length - 1;
    return Math.max(0, Math.min(idx, itemsRef.current.length - 1));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, button, a, [contenteditable]')) return;

      const el = itemRefs.current.get(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();

      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();

      setDrag({
        id,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        x: e.clientX,
        y: e.clientY,
        dropIndex: itemsRef.current.findIndex((i) => i.id === id),
      });
    },
    []
  );

  useEffect(() => {
    if (!drag) return;

    const handleMove = (e: PointerEvent) => {
      const dropIndex = computeDropIndex(e.clientY, drag.id);
      setDrag((d) => d ? { ...d, x: e.clientX, y: e.clientY, dropIndex } : null);
    };

    const handleUp = () => {
      setDrag((currentDrag) => {
        if (!currentDrag) return null;

        const { id, dropIndex, width, height } = currentDrag;
        const current = itemsRef.current;
        const fromIndex = current.findIndex((i) => i.id === id);

        // Commit reorder
        if (fromIndex !== dropIndex) {
          const next = [...current];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(dropIndex, 0, moved);
          onReorderRef.current(next);
        }

        // Snapshot: where is the floating card right now, and where is the placeholder
        const floatingEl = floatingRef.current;
        const placeholderEl = placeholderRef.current;

        const fromRect = floatingEl?.getBoundingClientRect();
        const toRect = placeholderEl?.getBoundingClientRect();

        const item = current.find((i) => i.id === id);

        if (fromRect && toRect && item) {
          setSettle({
            id,
            item,
            width,
            height,
            fromLeft: fromRect.left,
            fromTop: fromRect.top,
            toLeft: toRect.left,
            toTop: toRect.top,
          });
          setTimeout(() => setSettle(null), SETTLE_MS + 50);
        }

        return null;
      });
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [drag, computeDropIndex]);

  // Build visual list
  const nonDragged = drag ? items.filter((i) => i.id !== drag.id) : items;
  const listEntries: Array<{ type: 'item'; item: T } | { type: 'placeholder' }> =
    nonDragged.map((item) => ({ type: 'item' as const, item }));

  if (drag) {
    const clampedIdx = Math.max(0, Math.min(drag.dropIndex, listEntries.length));
    listEntries.splice(clampedIdx, 0, { type: 'placeholder' as const });
  }

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', gap, position: 'relative' }}
    >
      {/* Actively dragged floating card */}
      {drag && (() => {
        const item = items.find((i) => i.id === drag.id);
        if (!item) return null;
        return (
          <motion.div
            ref={floatingRef}
            initial={{ scale: 1, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
            animate={{ scale: 1.02, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: drag.x - drag.offsetX,
              top: drag.y - drag.offsetY,
              width: drag.width,
              zIndex: 9999,
              pointerEvents: 'none',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {renderItem(item)}
          </motion.div>
        );
      })()}

      {/* Settle animation: card flies from drop point into its slot */}
      {settle && (() => {
        const item = settle.item as T;
        return (
          <motion.div
            initial={{
              left: settle.fromLeft,
              top: settle.fromTop,
              scale: 1.02,
              boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            }}
            animate={{
              left: settle.toLeft,
              top: settle.toTop,
              scale: 1,
              boxShadow: '0 0 0px rgba(0,0,0,0)',
            }}
            transition={{ duration: SETTLE_MS / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed',
              width: settle.width,
              zIndex: 9999,
              pointerEvents: 'none',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {renderItem(item)}
          </motion.div>
        );
      })()}

      <AnimatePresence initial={false}>
        {listEntries.map((entry) => {
          if (entry.type === 'placeholder') {
            return (
              <motion.div
                key="__placeholder__"
                layout
                // @ts-expect-error — ref works at runtime on motion.div
                ref={placeholderRef}
                initial={{ opacity: 0, scaleY: 0.7 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.7, transition: { duration: 0 } }}
                transition={{ duration: 0.13, ease: 'easeOut' }}
                style={{
                  height: drag?.height ?? 48,
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.06)',
                  flexShrink: 0,
                  transformOrigin: 'top',
                }}
              />
            );
          }

          const { item } = entry;
          // Hide the item that is currently settling (the settle div covers it)
          const isSettling = settle?.id === item.id;
          return (
            <motion.div
              key={item.id}
              layout
              // During drag: animate layout shifts smoothly as placeholder moves.
              // During settle (placeholder just vanished): items are already in the
              // right visual position, so skip the layout transition entirely.
              transition={{ layout: { duration: settle ? 0 : 0.18, ease: 'easeOut' } }}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el as HTMLDivElement);
                else itemRefs.current.delete(item.id);
              }}
              onPointerDown={(e) => onPointerDown(e, item.id)}
              style={{
                cursor: drag ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
                visibility: isSettling ? 'hidden' : 'visible',
              }}
            >
              {renderItem(item)}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
