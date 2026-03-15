'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  completed?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export function EditableText({ value, onSave, completed = false, onEditingChange }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickXRef = useRef<number | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();

      // Place caret at the click position rather than selecting all text
      const x = clickXRef.current;
      if (x !== null && inputRef.current.setSelectionRange) {
        const input = inputRef.current;
        // Use the input's font metrics to approximate the character offset
        const style = window.getComputedStyle(input);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          const inputLeft = input.getBoundingClientRect().left;
          const relX = x - inputLeft;
          let offset = input.value.length;
          for (let i = 0; i <= input.value.length; i++) {
            const w = ctx.measureText(input.value.slice(0, i)).width;
            if (w >= relX) {
              // Snap to whichever boundary is closer
              const wPrev = i > 0 ? ctx.measureText(input.value.slice(0, i - 1)).width : 0;
              offset = (relX - wPrev < w - relX) ? i - 1 : i;
              break;
            }
          }
          input.setSelectionRange(Math.max(0, offset), Math.max(0, offset));
        }
      }
      clickXRef.current = null;
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onEditingChange?.(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
    onEditingChange?.(false);
  };

  const textStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 400,
    color: '#1A1A1A',
    textDecoration: completed ? 'line-through' : 'none',
    opacity: completed ? 0.45 : 1,
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        className="flex-1 outline-none min-w-0"
        style={{
          fontSize: '15px',
          fontWeight: 400,
          color: '#1A1A1A',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: '4px',
          padding: '1px 4px',
          margin: '-1px -4px',
        }}
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        clickXRef.current = e.clientX;
        setEditing(true);
        setDraft(value);
        onEditingChange?.(true);
      }}
      className="flex-1 cursor-text min-w-0"
      style={textStyle}
    >
      {value}
    </span>
  );
}
