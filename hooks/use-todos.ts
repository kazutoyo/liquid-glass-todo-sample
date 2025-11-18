import { useCallback, useEffect, useState } from 'react';
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilter,
  TodoSort,
} from '@/types/todo';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
  searchTodos,
  getSubTodos,
  getTodoStats,
} from '@/db';

/**
 * TODO操作用カスタムフック
 */
export function useTodos(filter?: TodoFilter, sort?: TodoSort) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // filterとsortを安定した値にするためにJSON.stringify
  const filterKey = JSON.stringify(filter);
  const sortKey = JSON.stringify(sort);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodos(filter, sort);
      setTodos(data as Todo[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load todos'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, sortKey]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const create = useCallback(
    async (input: CreateTodoInput) => {
      try {
        const newTodo = await createTodo(input);
        await loadTodos();
        return newTodo;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to create todo');
      }
    },
    [loadTodos]
  );

  const update = useCallback(
    async (input: UpdateTodoInput) => {
      try {
        const updatedTodo = await updateTodo(input);
        await loadTodos();
        return updatedTodo;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to update todo');
      }
    },
    [loadTodos]
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteTodo(id);
        await loadTodos();
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to delete todo');
      }
    },
    [loadTodos]
  );

  const toggleStatus = useCallback(
    async (id: number) => {
      try {
        const todo = await getTodoById(id);
        if (!todo) {
          throw new Error('Todo not found');
        }

        let newStatus: Todo['status'];
        let completedAt: string | null = null;

        if (todo.status === 'completed') {
          newStatus = 'pending';
        } else if (todo.status === 'pending') {
          newStatus = 'in_progress';
        } else {
          newStatus = 'completed';
          completedAt = new Date().toISOString();
        }

        await updateTodo({
          id,
          status: newStatus,
          completedAt,
        });
        await loadTodos();
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error('Failed to toggle todo status');
      }
    },
    [loadTodos]
  );

  return {
    todos,
    loading,
    error,
    refresh: loadTodos,
    create,
    update,
    remove,
    toggleStatus,
  };
}

/**
 * 単一TODO取得用フック
 */
export function useTodo(id: number) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodoById(id);
      setTodo(data as Todo | null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load todo'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTodo();
  }, [loadTodo]);

  return {
    todo,
    loading,
    error,
    refresh: loadTodo,
  };
}

/**
 * TODO検索用フック
 */
export function useSearchTodos() {
  const [results, setResults] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchTodos(searchTerm);
      setResults(data as Todo[]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to search todos')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
  };
}

/**
 * サブタスク取得用フック
 */
export function useSubTodos(parentId: number) {
  const [subTodos, setSubTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSubTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubTodos(parentId);
      setSubTodos(data as Todo[]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load subtodos')
      );
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    loadSubTodos();
  }, [loadSubTodos]);

  return {
    subTodos,
    loading,
    error,
    refresh: loadSubTodos,
  };
}

/**
 * TODO統計用フック
 */
export function useTodoStats() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodoStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}
