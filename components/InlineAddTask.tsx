'use client';

import { useState, useEffect, useRef } from 'react';
import { Checkbox } from './Checkbox';

interface InlineAddTaskProps {
  onAdd: (title: string) => void;
  onCancel: () => void;
}

export function InlineAddTask({ onAdd, onCancel }: InlineAddTaskProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const submit = () => {
    if (!title.trim()) {
      onCancel();
      return;
    }
    onAdd(title.trim());
  };

  return (
    <div
      className="flex items-center gap-3"
      style={{
        borderRadius: '8px',
        border: '1px solid #E9E7E7',
        background: '#FAFAF9',
        boxShadow: '0 1px 4px 0 rgba(37, 9, 18, 0.05)',
        padding: '15px 18px',
      }}
    >
      <Checkbox checked={false} onChange={() => {}} />
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        onBlur={submit}
        placeholder="New task"
        className="flex-1 outline-none bg-transparent"
        style={{
          fontSize: '15px',
          color: '#1A1A1A',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 400,
        }}
      />
    </div>
  );
}
