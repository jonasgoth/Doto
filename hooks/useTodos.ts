'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '@/lib/queries/todos';
import type { Todo } from '@/types';

export function useTodos(date: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTodos(date).then((data) => {
      setTodos(data);
      setLoading(false);
    });

    const channel = supabase
      .channel(`day_todos_${date}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'day_todos', filter: `date=eq.${date}` },
        () => fetchTodos(date).then(setTodos)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  const add = useCallback(
    async (title: string) => {
      const todo = await addTodo(title, date);
      setTodos((prev) => [...prev, todo]);
    },
    [date]
  );

  const update = useCallback(async (id: string, updates: Partial<Todo>) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await updateTodo(id, updates);
  }, []);

  const remove = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await deleteTodo(id);
  }, []);

  const reorder = useCallback(async (reordered: Todo[]) => {
    setTodos(reordered);
    await Promise.all(
      reordered.map((t, i) => updateTodo(t.id, { position: i }))
    );
  }, []);

  return { todos, loading, addTodo: add, updateTodo: update, deleteTodo: remove, reorderTodos: reorder };
}
