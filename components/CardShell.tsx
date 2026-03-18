'use client';

import { ReactNode } from 'react';

interface CardShellProps {
  children: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function CardShell({ children, onMouseEnter, onMouseLeave }: CardShellProps) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        borderRadius: '8px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
        padding: '13px 16px',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
