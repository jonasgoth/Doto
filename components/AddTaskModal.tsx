'use client';

import { useState, useEffect, useRef } from 'react';

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (title: string, destination: 'today' | 'backlog') => void;
  defaultDestination?: 'today' | 'backlog';
}

export function AddTaskModal({
  onClose,
  onAdd,
  defaultDestination = 'today',
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState<'today' | 'backlog'>(defaultDestination);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), destination);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full"
        style={{ maxWidth: '380px', borderRadius: '16px', padding: '28px' }}
      >
        <h2
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            color: '#1A1A1A',
            marginBottom: '20px',
          }}
        >
          New task
        </h2>

        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Task name"
          className="w-full outline-none"
          style={{
            border: '1px solid #E5E5E0',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '15px',
            color: '#1A1A1A',
            marginBottom: '16px',
          }}
        />

        <div className="flex gap-2" style={{ marginBottom: '16px' }}>
          {(['today', 'backlog'] as const).map((dest) => (
            <button
              key={dest}
              onClick={() => setDestination(dest)}
              className="flex-1 transition-colors"
              style={{
                padding: '8px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 400,
                backgroundColor: destination === dest ? '#1A1A1A' : 'transparent',
                color: destination === dest ? '#FFFFFF' : '#B5B5B0',
                border: destination === dest ? 'none' : '1px solid #E5E5E0',
                transitionDuration: '0.15s',
              }}
            >
              {dest === 'today' ? 'Today' : 'Backlog'}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          className="w-full"
          style={{
            padding: '10px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
