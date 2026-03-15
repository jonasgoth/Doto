import { supabase } from '../supabase';
import type { BacklogTodo } from '@/types';

function toError(error: { message: string; details?: string; code?: string }): Error {
  console.error('[Supabase error]', error);
  return new Error(error.message);
}

export async function fetchBacklog(): Promise<BacklogTodo[]> {
  const { data, error } = await supabase
    .from('backlog_todos')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw toError(error);
  return data ?? [];
}

export async function addBacklogTodo(title: string): Promise<BacklogTodo> {
  const { data, error } = await supabase
    .from('backlog_todos')
    .insert({ title, is_completed: false, position: Math.floor(Date.now() / 1000) })
    .select()
    .single();
  if (error) throw toError(error);
  return data;
}

export async function updateBacklogTodo(
  id: string,
  updates: Partial<BacklogTodo>
): Promise<void> {
  const { error } = await supabase.from('backlog_todos').update(updates).eq('id', id);
  if (error) throw toError(error);
}

export async function deleteBacklogTodo(id: string): Promise<void> {
  const { error } = await supabase.from('backlog_todos').delete().eq('id', id);
  if (error) throw toError(error);
}
