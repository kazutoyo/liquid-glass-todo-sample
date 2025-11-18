import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategoryStats,
} from '@/db';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/todo';

/**
 * カテゴリリストを取得するフック
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}

/**
 * カテゴリ詳細を取得するフック
 */
export function useCategory(id: number | null) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id!),
    enabled: id !== null && id > 0,
  });
}

/**
 * カテゴリを作成するフック
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
}

/**
 * カテゴリを更新するフック（楽観的更新付き）
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      const previousCategories = queryClient.getQueryData(['categories']);

      queryClient.setQueryData<any[]>(['categories'], (old) => {
        if (!old) return old;
        return old.map((category) =>
          category.id === updatedCategory.id
            ? { ...category, ...updatedCategory }
            : category
        );
      });

      queryClient.setQueryData(['categories', updatedCategory.id], (old: any) => {
        if (!old) return old;
        return { ...old, ...updatedCategory };
      });

      return { previousCategories };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
}

/**
 * カテゴリを削除するフック
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      const previousCategories = queryClient.getQueryData(['categories']);

      queryClient.setQueryData<any[]>(['categories'], (old) => {
        if (!old) return old;
        return old.filter((category) => category.id !== categoryId);
      });

      return { previousCategories };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

/**
 * カテゴリ別統計を取得するフック
 */
export function useCategoryStats() {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: getCategoryStats,
  });
}
