'use client';

import { useState } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { EditableText } from './EditableText';
import { DeleteButton } from './DeleteButton';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
}

function getDaysUntil(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const planDate = parseISO(dateStr);
  const diff = differenceInCalendarDays(planDate, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `${diff} days`;
}

export function PlanCard({ plan, onUpdate, onDelete, readonly = false }: PlanCardProps) {
  const [hovered, setHovered] = useState(false);
  const [dateHovered, setDateHovered] = useState(false);
  const [editing, setEditing] = useState(false);

  const daysUntil = plan.date ? getDaysUntil(plan.date) : '';
  const fullDate = plan.date ? format(parseISO(plan.date), 'MMMM d') : '';

  return (
    <div
      className="flex items-center gap-3"
      style={{
        borderRadius: '8px',
        border: '1px solid #E9E7E7',
        background: '#FFF',
        boxShadow: '0 1px 4px 0 rgba(37, 9, 18, 0.05)',
        padding: '15px 18px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="flex-shrink-0" style={{ fontSize: '16px' }}>
        😊
      </span>
      <EditableText
        value={plan.title}
        onSave={(title) => onUpdate(plan.id, title)}
        completed={false}
        onEditingChange={setEditing}
      />
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Delete button slides in from left, pushing date right */}
        <div
          className="overflow-hidden flex items-center"
          style={{
            width: hovered && !readonly ? '26px' : '0px',
            opacity: hovered && !readonly ? 1 : 0,
            transition: 'width 0.2s ease, opacity 0.2s ease',
          }}
        >
          <DeleteButton onClick={() => onDelete(plan.id)} />
        </div>

        {/* Date badge with tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setDateHovered(true)}
          onMouseLeave={() => setDateHovered(false)}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: '#B5B5B0',
              whiteSpace: 'nowrap',
            }}
          >
            {daysUntil}
          </span>
          {dateHovered && fullDate && (
            <div
              className="absolute bottom-full right-0 mb-1.5 px-2 py-1 whitespace-nowrap pointer-events-none"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontSize: '12px',
                borderRadius: '6px',
              }}
            >
              {fullDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
