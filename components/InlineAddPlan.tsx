'use client';

import { useState, useEffect, useRef } from 'react';

interface InlineAddPlanProps {
  onAdd: (title: string, date: string) => void;
  onCancel: () => void;
}

export function InlineAddPlan({ onAdd, onCancel }: InlineAddPlanProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const submit = () => {
    if (!title.trim() || !date) return;
    onAdd(title.trim(), date);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && date) submit();
  };

  const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  const handleBlur = () => {
    // Only cancel if both fields are empty (user clicked away without filling anything)
    if (!title.trim() && !date) {
      setTimeout(() => {
        // Allow focus to shift to date input without cancelling
        const active = document.activeElement;
        if (!active || !active.closest('[data-inline-plan]')) {
          onCancel();
        }
      }, 100);
    }
  };

  return (
    <div
      data-inline-plan
      className="flex items-center gap-3"
      style={{
        borderRadius: '8px',
        border: '1px solid #E9E7E7',
        background: '#FAFAF9',
        boxShadow: '0 1px 4px 0 rgba(37, 9, 18, 0.05)',
        padding: '15px 18px',
      }}
    >
      {/* Emoji placeholder */}
      <span style={{ fontSize: '16px', flexShrink: 0, opacity: 0.4 }}>😊</span>

      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        onBlur={handleBlur}
        placeholder="What's coming up?"
        className="flex-1 outline-none bg-transparent"
        style={{
          fontSize: '15px',
          color: '#1A1A1A',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 400,
          minWidth: 0,
        }}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onKeyDown={handleDateKeyDown}
        onBlur={() => {
          if (title.trim() && date) submit();
          else if (!title.trim() && !date) onCancel();
        }}
        className="outline-none bg-transparent flex-shrink-0"
        style={{
          fontSize: '13px',
          color: date ? '#B5B5B0' : '#D0CFCC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 400,
          border: 'none',
          width: '130px',
          textAlign: 'right',
        }}
      />
    </div>
  );
}
