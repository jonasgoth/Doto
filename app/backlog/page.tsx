'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBacklog } from '@/hooks/useBacklog';
import { useMode } from '@/lib/ModeContext';
import { TaskCard } from '@/components/TaskCard';
import { SectionLabel } from '@/components/SectionLabel';
import { AddButton } from '@/components/AddButton';
import { InlineAddTask } from '@/components/InlineAddTask';
import { SortableList } from '@/components/SortableList';
import type { BacklogTodo } from '@/types';

const modeListVariants = {
  enter: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.10, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function BacklogPage() {
  const { todos, addTodo: addBacklogItem, updateTodo, deleteTodo, moveToToday, reorderTodos } = useBacklog();
  const { mode } = useMode();

  const [addingTask, setAddingTask] = useState(false);

  const filteredTodos = todos.filter((t) => (t.mode ?? 'personal') === mode);
  const active = filteredTodos.filter((t) => !t.is_completed);
  const completed = filteredTodos.filter((t) => t.is_completed);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            color: 'var(--text-primary)',
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          variants={modeListVariants}
          initial="enter"
          animate="visible"
          exit="exit"
        >
          {/* Active tasks */}
          <SortableList<BacklogTodo>
            items={active}
            onReorder={(reordered) => reorderTodos([...reordered, ...completed])}
            gap={8}
            renderItem={(todo) => (
              <TaskCard
                id={todo.id}
                title={todo.title}
                isCompleted={todo.is_completed}
                onToggle={(id, completed) => updateTodo(id, { is_completed: completed })}
                onUpdate={(id, title) => updateTodo(id, { title })}
                onDelete={deleteTodo}
                showMoveToToday={true}
                onMoveToToday={moveToToday}
                onEnter={() => setAddingTask(true)}
              />
            )}
          />

          <AnimatePresence>
            {addingTask && (
              <motion.div
                key="inline-add-task"
                initial={{ opacity: 0, scale: 0.97, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } }}
                exit={{ opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] } }}
                style={{ marginTop: '8px' }}
              >
                <InlineAddTask
                  onAdd={async (title) => { await addBacklogItem(title, mode); }}
                  onCancel={() => setAddingTask(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } }}
                      exit={{ opacity: 0, height: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } }}
                      style={{ overflow: 'hidden' }}
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
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
