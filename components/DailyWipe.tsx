'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  fetchStaleTodos,
  archiveDayLog,
  deleteTodosByDate,
} from '@/lib/queries/todos';
import { addBacklogTodo } from '@/lib/queries/backlog';
import type { Todo } from '@/types';

interface DailyWipeProps {
  today: string;
}

export function DailyWipe({ today }: DailyWipeProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [incompleteTodos, setIncompleteTodos] = useState<Todo[]>([]);
  const [staleDates, setStaleDates] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const doWipe = async () => {
      const stale = await fetchStaleTodos(today);
      if (stale.length === 0) return;

      const dates = [...new Set(stale.map((t) => t.date))];
      setStaleDates(dates);

      // Archive each day's data
      for (const date of dates) {
        const dateTodos = stale.filter((t) => t.date === date);
        await archiveDayLog(date, dateTodos);
      }

      const incomplete = stale.filter((t) => !t.is_completed);

      if (incomplete.length === 0) {
        // All completed — silently delete
        for (const date of dates) {
          await deleteTodosByDate(date);
        }
      } else {
        setIncompleteTodos(incomplete);
        setShowPrompt(true);
      }
    };

    doWipe();
    setDone(true);
  }, [today, done]);

  const handleClear = async () => {
    for (const date of staleDates) {
      await deleteTodosByDate(date);
    }
    setShowPrompt(false);
  };

  const handleMoveToBacklog = async () => {
    for (const todo of incompleteTodos) {
      await addBacklogTodo(todo.title);
    }
    for (const date of staleDates) {
      await deleteTodosByDate(date);
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  const oldestDate = staleDates[0];
  const dateLabel =
    staleDates.length === 1 ? format(parseISO(oldestDate), 'MMMM d') : 'past days';
  const count = incompleteTodos.length;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(3px)' }}
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
            marginBottom: '8px',
          }}
        >
          Yesterday&apos;s tasks
        </h2>
        <p style={{ fontSize: '14px', color: '#B5B5B0', marginBottom: '24px' }}>
          You have {count} incomplete {count === 1 ? 'task' : 'tasks'} from {dateLabel}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="flex-1"
            style={{
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#B5B5B0',
              border: '1px solid #E5E5E0',
              backgroundColor: 'transparent',
            }}
          >
            Clear
          </button>
          <button
            onClick={handleMoveToBacklog}
            className="flex-1"
            style={{
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
            }}
          >
            Move to Backlog
          </button>
        </div>
      </div>
    </div>
  );
}
