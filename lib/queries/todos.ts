import { supabase } from '../supabase';
import type { Todo } from '@/types';

function toError(error: { message: string; details?: string; code?: string }): Error {
  console.error('[Supabase error]', error);
  return new Error(error.message);
}

export async function fetchTodos(date: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('day_todos')
    .select('*')
    .eq('date', date)
    .order('position', { ascending: true });
  if (error) throw toError(error);
  return data ?? [];
}

export async function addTodo(title: string, date: string): Promise<Todo> {
  const { data, error } = await supabase
    .from('day_todos')
    .insert({ title, date, is_completed: false, position: Math.floor(Date.now() / 1000) })
    .select()
    .single();
  if (error) throw toError(error);
  return data;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  const { error } = await supabase.from('day_todos').update(updates).eq('id', id);
  if (error) throw toError(error);
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('day_todos').delete().eq('id', id);
  if (error) throw toError(error);
}

export async function fetchStaleTodos(beforeDate: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('day_todos')
    .select('*')
    .lt('date', beforeDate)
    .order('date', { ascending: true });
  if (error) throw toError(error);
  return data ?? [];
}

export async function archiveDayLog(date: string, todos: Todo[]): Promise<void> {
  const completed = todos.filter((t) => t.is_completed);
  const incomplete = todos.filter((t) => !t.is_completed);
  const { error } = await supabase.from('day_logs').upsert({
    date,
    completed_count: completed.length,
    incomplete_count: incomplete.length,
    todos,
  });
  if (error) throw toError(error);
}

export async function deleteTodosByDate(date: string): Promise<void> {
  const { error } = await supabase.from('day_todos').delete().eq('date', date);
  if (error) throw toError(error);
}
