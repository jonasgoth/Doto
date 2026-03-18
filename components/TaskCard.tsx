'use client';

import { useState } from 'react';
import { CardShell } from './CardShell';
import { Checkbox } from './Checkbox';
import { EditableText } from './EditableText';
import { DeleteButton } from './DeleteButton';

interface TaskCardProps {
  id: string;
  title: string;
  isCompleted: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  showMoveToToday?: boolean;
  onMoveToToday?: (id: string) => void;
  showMoveToBacklog?: boolean;
  onMoveToBacklog?: (id: string) => void;
  onEnter?: () => void;
}

export function TaskCard({
  id,
  title,
  isCompleted,
  onToggle,
  onUpdate,
  onDelete,
  showMoveToToday = false,
  onMoveToToday,
  showMoveToBacklog = false,
  onMoveToBacklog,
  onEnter,
}: TaskCardProps) {
  const [hovered, setHovered] = useState(false);

  const showDelete = hovered;
  const showMoveBtn = hovered && showMoveToToday;
  const showMoveBacklogBtn = hovered && showMoveToBacklog;

  return (
    <CardShell onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Checkbox checked={isCompleted} onChange={(checked) => onToggle(id, checked)} />
      <EditableText
        value={title}
        onSave={(newTitle) => onUpdate(id, newTitle)}
        completed={isCompleted}
        onEnter={onEnter}
      />
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
        {showMoveToToday && (
          <button
            onClick={() => onMoveToToday?.(id)}
            className="hover-subtle"
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-btn-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            style={{
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              transition: 'color 0.15s ease',
              visibility: showMoveBtn ? 'visible' : 'hidden',
              cursor: 'pointer',
            }}
          >
            → Today
          </button>
        )}
        {showMoveToBacklog && (
          <button
            onClick={() => onMoveToBacklog?.(id)}
            className="hover-subtle"
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-btn-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            style={{
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              transition: 'color 0.15s ease',
              visibility: showMoveBacklogBtn ? 'visible' : 'hidden',
              cursor: 'pointer',
            }}
          >
            ← Backlog
          </button>
        )}
        <div style={{ visibility: showDelete ? 'visible' : 'hidden' }}>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      </div>
    </CardShell>
  );
}
