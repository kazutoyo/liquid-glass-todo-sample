import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * カテゴリテーブル
 */
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * TODOテーブル
 */
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date'), // ISO 8601形式
  priority: text('priority', {
    enum: ['low', 'medium', 'high'],
  })
    .notNull()
    .default('medium'),
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed'],
  })
    .notNull()
    .default('pending'),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  tags: text('tags'), // JSON文字列
  isRecurring: integer('is_recurring', { mode: 'boolean' })
    .notNull()
    .default(false),
  recurringPattern: text('recurring_pattern'),
  parentId: integer('parent_id').references((): any => todos.id, {
    onDelete: 'cascade',
  }),
  sortOrder: integer('sort_order').notNull().default(0),
  reminderTime: text('reminder_time'), // ISO 8601形式
  completedAt: text('completed_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * FTS5仮想テーブル（全文検索用）
 */
export const todosFts = sqliteTable('todos_fts', {
  rowid: integer('rowid').primaryKey(),
  title: text('title'),
  description: text('description'),
});
