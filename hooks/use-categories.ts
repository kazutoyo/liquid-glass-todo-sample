import { useCallback, useEffect, useState } from 'react';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/todo';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategoryStats,
} from '@/db';

/**
 * カテゴリ操作用カスタムフック
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data as Category[]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load categories')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const create = useCallback(
    async (input: CreateCategoryInput) => {
      try {
        const newCategory = await createCategory(input);
        await loadCategories();
        return newCategory;
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error('Failed to create category');
      }
    },
    [loadCategories]
  );

  const update = useCallback(
    async (input: UpdateCategoryInput) => {
      try {
        const updatedCategory = await updateCategory(input);
        await loadCategories();
        return updatedCategory;
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error('Failed to update category');
      }
    },
    [loadCategories]
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteCategory(id);
        await loadCategories();
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error('Failed to delete category');
      }
    },
    [loadCategories]
  );

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
    create,
    update,
    remove,
  };
}

/**
 * 単一カテゴリ取得用フック
 */
export function useCategory(id: number) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategoryById(id);
      setCategory(data as Category | null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load category')
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  return {
    category,
    loading,
    error,
    refresh: loadCategory,
  };
}

/**
 * カテゴリ別統計用フック
 */
export function useCategoryStats() {
  const [stats, setStats] = useState<
    Array<{
      categoryId: number | null;
      categoryName: string;
      categoryColor: string;
      total: number;
      completed: number;
      pending: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategoryStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load category stats')
      );
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
