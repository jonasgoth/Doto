'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { CardShell } from './CardShell';
import { EditableText } from './EditableText';
import { DeleteButton } from './DeleteButton';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  onUpdate: (id: string, updates: Partial<Plan>) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
  onEnter?: () => void;
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

export function PlanCard({ plan, onUpdate, onDelete, readonly = false, onEnter }: PlanCardProps) {
  const [hovered, setHovered] = useState(false);
  const [dateHovered, setDateHovered] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const dateInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const emoji = plan.emoji
    || (typeof window !== 'undefined' ? localStorage.getItem(`plan-emoji-${plan.id}`) : null)
    || '😊';

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        emojiButtonRef.current && !emojiButtonRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  const handleEmojiButtonClick = () => {
    if (readonly) return;
    if (!pickerOpen) {
      const rect = emojiButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setPickerPos({ top: rect.bottom + 8, left: rect.left });
      }
    }
    setPickerOpen((o) => !o);
  };

  const handleEmojiSelect = (newEmoji: string) => {
    onUpdate(plan.id, { emoji: newEmoji });
    setPickerOpen(false);
  };

  const daysUntil = plan.date ? getDaysUntil(plan.date) : '';
  const fullDate = plan.date ? format(parseISO(plan.date), 'MMMM d') : '';

  const handleDateClick = () => {
    if (readonly) return;
    setEditingDate(true);
    setDateHovered(false);
    setTimeout(() => dateInputRef.current?.showPicker?.(), 0);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onUpdate(plan.id, { date: e.target.value });
    }
    setEditingDate(false);
  };

  const handleDateBlur = () => {
    setEditingDate(false);
  };

  return (
    <CardShell onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Emoji button + picker */}
      <div className="flex-shrink-0">
        <button
          ref={emojiButtonRef}
          onClick={handleEmojiButtonClick}
          style={{
            fontSize: '16px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readonly ? 'default' : 'pointer',
            lineHeight: 1,
          }}
          title={readonly ? undefined : 'Change emoji'}
        >
          {emoji}
        </button>
        {pickerOpen && typeof window !== 'undefined' && createPortal(
          <div
            ref={pickerRef}
            style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 9999 }}
          >
            <Picker
              data={data}
              onEmojiSelect={(e: { native: string }) => handleEmojiSelect(e.native)}
              autoFocus
              theme="auto"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>,
          document.body
        )}
      </div>

      <EditableText
        value={plan.title}
        onSave={(title) => onUpdate(plan.id, { title })}
        completed={false}
        onEditingChange={setEditing}
        onEnter={onEnter}
      />
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Delete button slides in from left, pushing date right */}
        <div
          className="overflow-hidden flex items-center"
          style={{
            width: hovered && !readonly && !editing ? '26px' : '0px',
            opacity: hovered && !readonly && !editing ? 1 : 0,
            transition: 'width 0.2s ease, opacity 0.2s ease',
          }}
        >
          <DeleteButton onClick={() => onDelete(plan.id)} />
        </div>

        {/* Date badge / editable date input */}
        {editingDate ? (
          <input
            ref={dateInputRef}
            type="date"
            defaultValue={plan.date ?? ''}
            onChange={handleDateChange}
            onBlur={handleDateBlur}
            autoFocus
            className="outline-none bg-transparent flex-shrink-0"
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              border: 'none',
              width: '130px',
              textAlign: 'right',
            }}
          />
        ) : (
          <div
            className="relative"
            onMouseEnter={() => setDateHovered(true)}
            onMouseLeave={() => setDateHovered(false)}
            onClick={handleDateClick}
            style={{ cursor: readonly ? 'default' : 'pointer' }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 400,
                color: hovered && !readonly ? 'var(--text-btn-hover)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              {daysUntil}
            </span>
            {dateHovered && fullDate && !readonly && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--tooltip-bg)',
                  color: 'var(--tooltip-text)',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '20px',
                  zIndex: 10,
                  padding: '4px 10px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {fullDate}
              </div>
            )}
          </div>
        )}
      </div>
    </CardShell>
  );
}
