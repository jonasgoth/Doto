export interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
  position: number;
  date: string;
  created_at: string;
}

export interface BacklogTodo {
  id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

export interface Plan {
  id: string;
  title: string;
  date: string | null;
  position: number;
  created_at: string;
}

export interface DayLog {
  id: string;
  date: string;
  completed_count: number;
  incomplete_count: number;
  todos: Todo[];
  archived_at: string;
}
