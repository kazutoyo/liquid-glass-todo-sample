import type {
  CreateCategoryInput,
  CreateTodoInput,
  TodoFilter,
  TodoSort,
  UpdateCategoryInput,
  UpdateTodoInput,
} from '@/types/todo';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// データベースを開く
const expoDb = openDatabaseSync('todos.db', {
  enableChangeListener: false,
  useNewConnection: false,
});

export const db = drizzle(expoDb, { schema });

/**
 * データベースを初期化
 */
export async function initDatabase() {
  // テーブルを作成
  await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
      category_id INTEGER,
      tags TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurring_pattern TEXT,
      parent_id INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      reminder_time TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_id) REFERENCES todos(id) ON DELETE CASCADE
    );

    -- FTS5仮想テーブルを作成
    CREATE VIRTUAL TABLE IF NOT EXISTS todos_fts USING fts5(
      title,
      description,
      content=todos,
      content_rowid=id
    );

    -- トリガー: TODOが挿入されたときにFTSテーブルにも挿入
    CREATE TRIGGER IF NOT EXISTS todos_fts_insert AFTER INSERT ON todos BEGIN
      INSERT INTO todos_fts(rowid, title, description)
      VALUES (new.id, new.title, new.description);
    END;

    -- トリガー: TODOが更新されたときにFTSテーブルも更新
    CREATE TRIGGER IF NOT EXISTS todos_fts_update AFTER UPDATE ON todos BEGIN
      UPDATE todos_fts SET title = new.title, description = new.description
      WHERE rowid = new.id;
    END;

    -- トリガー: TODOが削除されたときにFTSテーブルからも削除
    CREATE TRIGGER IF NOT EXISTS todos_fts_delete AFTER DELETE ON todos BEGIN
      DELETE FROM todos_fts WHERE rowid = old.id;
    END;

    -- インデックス作成
    CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
    CREATE INDEX IF NOT EXISTS idx_todos_category_id ON todos(category_id);
    CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
    CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);
    CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
  `);

  console.log('Database initialized successfully');
}

/**
 * TODOを作成
 */
export async function createTodo(input: CreateTodoInput) {
  const now = new Date().toISOString();
  const result = await db
    .insert(schema.todos)
    .values({
      ...input,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    })
    .returning();
  return result[0];
}

/**
 * TODOを更新
 */
export async function updateTodo(input: UpdateTodoInput) {
  const { id, ...data } = input;
  const now = new Date().toISOString();
  const result = await db
    .update(schema.todos)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(schema.todos.id, id))
    .returning();
  return result[0];
}

/**
 * TODOを削除
 */
export async function deleteTodo(id: number) {
  await db.delete(schema.todos).where(eq(schema.todos.id, id));
}

/**
 * TODOを取得（ID指定）
 */
export async function getTodoById(id: number) {
  const result = await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * TODOリストを取得（フィルタ・ソート対応）
 */
export async function getTodos(filter?: TodoFilter, sort?: TodoSort) {
  let query = db.select().from(schema.todos);

  // フィルタ条件を適用
  if (filter) {
    const conditions = [];

    if (filter.status && filter.status.length > 0) {
      conditions.push(inArray(schema.todos.status, filter.status));
    }

    if (filter.priority && filter.priority.length > 0) {
      conditions.push(inArray(schema.todos.priority, filter.priority));
    }

    if (filter.categoryId && filter.categoryId.length > 0) {
      conditions.push(inArray(schema.todos.categoryId, filter.categoryId));
    }

    if (filter.dueBefore) {
      conditions.push(sql`${schema.todos.dueDate} <= ${filter.dueBefore}`);
    }

    if (filter.dueAfter) {
      conditions.push(sql`${schema.todos.dueDate} >= ${filter.dueAfter}`);
    }

    if (filter.hasParent !== undefined) {
      if (filter.hasParent) {
        conditions.push(sql`${schema.todos.parentId} IS NOT NULL`);
      } else {
        conditions.push(isNull(schema.todos.parentId));
      }
    }

    if (filter.parentId !== undefined) {
      if (filter.parentId === null) {
        conditions.push(isNull(schema.todos.parentId));
      } else {
        conditions.push(eq(schema.todos.parentId, filter.parentId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
  }

  // ソート条件を適用
  if (sort) {
    const orderFn = sort.order === 'asc' ? asc : desc;
    const field = schema.todos[sort.field];
    query = query.orderBy(orderFn(field)) as any;
  } else {
    // デフォルトソート: sortOrder昇順、作成日時降順
    query = query.orderBy(
      asc(schema.todos.sortOrder),
      desc(schema.todos.createdAt)
    ) as any;
  }

  return await query;
}

/**
 * 全文検索
 */
export async function searchTodos(searchTerm: string) {
  // FTS5クエリ
  const result = await expoDb.getAllAsync<{ id: number }>(
    `
    SELECT todos.* FROM todos
    INNER JOIN todos_fts ON todos.id = todos_fts.rowid
    WHERE todos_fts MATCH ?
    ORDER BY rank
  `,
    [searchTerm]
  );

  return result;
}

/**
 * カテゴリを作成
 */
export async function createCategory(input: CreateCategoryInput) {
  const now = new Date().toISOString();
  const result = await db
    .insert(schema.categories)
    .values({
      ...input,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    })
    .returning();
  return result[0];
}

/**
 * カテゴリを更新
 */
export async function updateCategory(input: UpdateCategoryInput) {
  const { id, ...data } = input;
  const now = new Date().toISOString();
  const result = await db
    .update(schema.categories)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(schema.categories.id, id))
    .returning();
  return result[0];
}

/**
 * カテゴリを削除
 */
export async function deleteCategory(id: number) {
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
}

/**
 * カテゴリを取得（ID指定）
 */
export async function getCategoryById(id: number) {
  const result = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * すべてのカテゴリを取得
 */
export async function getCategories() {
  return await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
}

/**
 * サブタスクを取得
 */
export async function getSubTodos(parentId: number) {
  return await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.parentId, parentId))
    .orderBy(asc(schema.todos.sortOrder), asc(schema.todos.createdAt));
}

/**
 * 統計情報を取得
 */
export async function getTodoStats() {
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.todos)
    .where(isNull(schema.todos.parentId));

  const completedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.todos)
    .where(
      and(
        eq(schema.todos.status, 'completed'),
        isNull(schema.todos.parentId)
      )
    );

  const total = Number(totalResult[0]?.count || 0);
  const completed = Number(completedResult[0]?.count || 0);

  return {
    total,
    completed,
    pending: total - completed,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  };
}

/**
 * カテゴリ別の統計情報を取得
 */
export async function getCategoryStats() {
  const result = await db
    .select({
      categoryId: schema.todos.categoryId,
      categoryName: schema.categories.name,
      categoryColor: schema.categories.color,
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${schema.todos.status} = 'completed' then 1 else 0 end)`,
    })
    .from(schema.todos)
    .leftJoin(
      schema.categories,
      eq(schema.todos.categoryId, schema.categories.id)
    )
    .where(isNull(schema.todos.parentId))
    .groupBy(schema.todos.categoryId, schema.categories.name);

  return result.map((row) => ({
    categoryId: row.categoryId,
    categoryName: row.categoryName || 'Uncategorized',
    categoryColor: row.categoryColor || '#999999',
    total: Number(row.total),
    completed: Number(row.completed),
    pending: Number(row.total) - Number(row.completed),
  }));
}
