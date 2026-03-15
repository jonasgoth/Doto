'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useBacklog } from '@/hooks/useBacklog';
import { TaskCard } from '@/components/TaskCard';
import { SectionLabel } from '@/components/SectionLabel';
import { AddButton } from '@/components/AddButton';
import { InlineAddTask } from '@/components/InlineAddTask';
import { SortableList } from '@/components/SortableList';
import type { BacklogTodo } from '@/types';

export default function BacklogPage() {
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const { todos, addTodo: addBacklogItem, updateTodo, deleteTodo, moveToToday, reorderTodos } = useBacklog();

  const [addingTask, setAddingTask] = useState(false);

  const active = todos.filter((t) => !t.is_completed);
  const completed = todos.filter((t) => t.is_completed);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            color: 'var(--Text-Primary, rgba(0, 0, 0, 0.85))',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '26px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Backlog
        </h1>
      </div>

      {/* Active tasks */}
      <SortableList<BacklogTodo>
        items={active}
        onReorder={(reordered) => reorderTodos([...reordered, ...completed])}
        gap={8}
        renderItem={(todo) => (
          <AnimatePresence initial={false}>
            <motion.div
              key={todo.id}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <TaskCard
                id={todo.id}
                title={todo.title}
                isCompleted={todo.is_completed}
                onToggle={(id, completed) => updateTodo(id, { is_completed: completed })}
                onUpdate={(id, title) => updateTodo(id, { title })}
                onDelete={deleteTodo}
                showMoveToToday={true}
                onMoveToToday={moveToToday}
              />
            </motion.div>
          </AnimatePresence>
        )}
      />

      {addingTask && (
        <div style={{ marginTop: '8px' }}>
          <InlineAddTask
            onAdd={async (title) => { await addBacklogItem(title); setAddingTask(false); }}
            onCancel={() => setAddingTask(false)}
          />
        </div>
      )}
      {!addingTask && (
        <div style={{ marginTop: '8px' }}>
          <AddButton onClick={() => setAddingTask(true)} />
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <SectionLabel>Completed</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence initial={false}>
              {completed.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <TaskCard
                    id={todo.id}
                    title={todo.title}
                    isCompleted={todo.is_completed}
                    onToggle={(id, completed) => updateTodo(id, { is_completed: completed })}
                    onUpdate={(id, title) => updateTodo(id, { title })}
                    onDelete={deleteTodo}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

    </div>
  );
}
