'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import {
  fetchBacklog,
  addBacklogTodo,
  updateBacklogTodo,
  deleteBacklogTodo,
} from '@/lib/queries/backlog';
import { addTodo } from '@/lib/queries/todos';
import type { BacklogTodo } from '@/types';

export function useBacklog() {
  const [todos, setTodos] = useState<BacklogTodo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBacklog().then((data) => {
      setTodos(data);
      setLoading(false);
    });

    const channel = supabase
      .channel('backlog_todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'backlog_todos' },
        () => fetchBacklog().then(setTodos)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const add = useCallback(async (title: string) => {
    const todo = await addBacklogTodo(title);
    setTodos((prev) => [...prev, todo]);
  }, []);

  const update = useCallback(async (id: string, updates: Partial<BacklogTodo>) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await updateBacklogTodo(id, updates);
  }, []);

  const remove = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await deleteBacklogTodo(id);
  }, []);

  const reorder = useCallback(async (reordered: BacklogTodo[]) => {
    setTodos(reordered);
    await Promise.all(
      reordered.map((t, i) => updateBacklogTodo(t.id, { position: i }))
    );
  }, []);

  const moveToToday = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      const today = format(new Date(), 'yyyy-MM-dd');
      await addTodo(todo.title, today);
      await deleteBacklogTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [todos]
  );

  return { todos, loading, addTodo: add, updateTodo: update, deleteTodo: remove, moveToToday, reorderTodos: reorder };
}
