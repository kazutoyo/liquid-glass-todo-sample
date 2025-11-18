/**
 * TODO優先度
 */
export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * TODOステータス
 */
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

/**
 * TODOアイテム
 */
export type Todo = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null; // ISO 8601形式
  priority: TodoPriority;
  status: TodoStatus;
  categoryId: number | null;
  tags: string | null; // JSON文字列として保存（例: ["work", "urgent"]）
  isRecurring: boolean;
  recurringPattern: string | null; // cron形式またはJSON
  parentId: number | null; // サブタスクの親TODO
  sortOrder: number;
  reminderTime: string | null; // ISO 8601形式
  completedAt: string | null; // ISO 8601形式
  createdAt: string;
  updatedAt: string;
};

/**
 * TODOカテゴリ
 */
export type Category = {
  id: number;
  name: string;
  color: string; // hex形式（例: "#FF5733"）
  icon: string | null; // SF Symbols / Material Iconsの名前
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * 新規TODO作成時の入力データ
 */
export type CreateTodoInput = Omit<
  Todo,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt'
> & {
  createdAt?: string;
  updatedAt?: string;
};

/**
 * TODO更新時の入力データ
 */
export type UpdateTodoInput = Partial<CreateTodoInput> & {
  id: number;
};

/**
 * 新規カテゴリ作成時の入力データ
 */
export type CreateCategoryInput = Omit<
  Category,
  'id' | 'createdAt' | 'updatedAt'
> & {
  createdAt?: string;
  updatedAt?: string;
};

/**
 * カテゴリ更新時の入力データ
 */
export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: number;
};

/**
 * TODOフィルタ条件
 */
export type TodoFilter = {
  status?: TodoStatus[];
  priority?: TodoPriority[];
  categoryId?: number[];
  dueBefore?: string; // ISO 8601形式
  dueAfter?: string; // ISO 8601形式
  hasParent?: boolean; // サブタスクかどうか
  parentId?: number | null;
};

/**
 * TODOソート条件
 */
export type TodoSort = {
  field: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'sortOrder';
  order: 'asc' | 'desc';
};
