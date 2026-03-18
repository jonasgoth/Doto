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
    setTitle('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div
      className="flex items-center gap-3"
      style={{
        borderRadius: '8px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-inline-add)',
        boxShadow: 'var(--shadow-card)',
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
          color: 'var(--text-primary)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 400,
        }}
      />
    </div>
  );
}
