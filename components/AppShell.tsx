'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Sidebar } from './Sidebar';
import { DailyWipe } from './DailyWipe';
import { useTodos } from '@/hooks/useTodos';
import { useBacklog } from '@/hooks/useBacklog';
import { usePlans } from '@/hooks/usePlans';

export function AppShell({ children }: { children: React.ReactNode }) {
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const { todos } = useTodos(today);
  const { todos: backlog } = useBacklog();
  const { plans } = usePlans();

  const todayCount = todos.filter((t) => !t.is_completed).length;
  const backlogCount = backlog.filter((t) => !t.is_completed).length;
  const plansCount = plans.length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F6F7' }}>
      <Sidebar todayCount={todayCount} backlogCount={backlogCount} plansCount={plansCount} />
      <main className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
        <div
          style={{
            minHeight: '100%',
            borderRadius: '8px',
            background: '#FFF',
            boxShadow:
              '0 21px 6px 0 rgba(50, 11, 21, 0.00), 0 13px 5px 0 rgba(50, 11, 21, 0.01), 0 7px 4px 0 rgba(50, 11, 21, 0.03), 0 3px 3px 0 rgba(50, 11, 21, 0.04), 0 1px 2px 0 rgba(50, 11, 21, 0.05)',
          }}
        >
          {children}
        </div>
      </main>
      <DailyWipe today={today} />
    </div>
  );
}
