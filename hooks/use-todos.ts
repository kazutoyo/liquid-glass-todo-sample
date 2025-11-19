import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getSubTodos,
  searchTodos,
  getTodoStats,
} from '@/db';
import type {
  TodoFilter,
  TodoSort,
  CreateTodoInput,
  UpdateTodoInput,
  Todo,
} from '@/types/todo';

/**
 * TODOリストを取得するフック
 */
export function useTodos(filter?: TodoFilter, sort?: TodoSort) {
  return useQuery({
    queryKey: ['todos', filter, sort],
    queryFn: () => getTodos(filter, sort),
  });
}

/**
 * TODO詳細を取得するフック
 */
export function useTodo(id: number | null) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => getTodoById(id!),
    enabled: id !== null && id > 0,
  });
}

/**
 * TODOを作成するフック
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // 全てのTODOクエリを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
}

/**
 * TODOを更新するフック（楽観的更新付き）
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodo,
    onMutate: async (updatedTodo) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // 以前の状態をスナップショット
      const previousTodos = queryClient.getQueriesData({ queryKey: ['todos'] });

      // 楽観的更新: TODOリストクエリのみを更新（配列のクエリ）
      queryClient.setQueriesData<any[]>(
        { queryKey: ['todos'] },
        (old) => {
          // oldが配列でない場合はスキップ（個別TODO取得クエリなど）
          if (!old || !Array.isArray(old)) return old;
          return old.map((todo) =>
            todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
          );
        }
      );

      // 個別のTODO詳細も更新
      queryClient.setQueryData(['todos', updatedTodo.id], (old: any) => {
        if (!old) return old;
        return { ...old, ...updatedTodo };
      });

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      // エラー時はロールバック
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // 成功時にDBから再取得（即座に反映）
      queryClient.invalidateQueries({
        queryKey: ['todos'],
        refetchType: 'active', // アクティブなクエリのみ再取得
      });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
}

/**
 * TODOを削除するフック
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onMutate: async (todoId) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // 以前の状態をスナップショット
      const previousTodos = queryClient.getQueriesData({ queryKey: ['todos'] });

      // 楽観的更新: キャッシュから削除
      queryClient.setQueriesData<any[]>(
        { queryKey: ['todos'] },
        (old) => {
          // oldが配列でない場合はスキップ
          if (!old || !Array.isArray(old)) return old;
          return old.filter((todo) => todo.id !== todoId);
        }
      );

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      // エラー時はロールバック
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // 成功時にDBから再取得（即座に反映）
      queryClient.invalidateQueries({
        queryKey: ['todos'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
}

/**
 * TODOステータスをトグルするフック
 */
export function useToggleTodoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
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

      return updateTodo({
        id,
        status: newStatus,
        completedAt,
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueriesData({ queryKey: ['todos'] });

      // 楽観的更新
      queryClient.setQueriesData<any[]>(
        { queryKey: ['todos'] },
        (old) => {
          // oldが配列でない場合はスキップ
          if (!old || !Array.isArray(old)) return old;
          return old.map((todo) => {
            if (todo.id !== id) return todo;

            let newStatus: Todo['status'];
            if (todo.status === 'completed') {
              newStatus = 'pending';
            } else if (todo.status === 'pending') {
              newStatus = 'in_progress';
            } else {
              newStatus = 'completed';
            }

            return {
              ...todo,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
            };
          });
        }
      );

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // 成功時にDBから再取得（即座に反映）
      queryClient.invalidateQueries({
        queryKey: ['todos'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
    },
  });
}

/**
 * サブタスクを取得するフック
 */
export function useSubTodos(parentId: number | null) {
  return useQuery({
    queryKey: ['todos', parentId, 'subtasks'],
    queryFn: () => getSubTodos(parentId!),
    enabled: parentId !== null,
  });
}

/**
 * 全文検索するフック
 */
export function useSearchTodos(searchTerm: string) {
  return useQuery({
    queryKey: ['todos', 'search', searchTerm],
    queryFn: () => searchTodos(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 5000, // 検索結果は5秒でstaleになる
  });
}

/**
 * TODO統計を取得するフック
 */
export function useTodoStats() {
  return useQuery({
    queryKey: ['todoStats'],
    queryFn: getTodoStats,
  });
}
