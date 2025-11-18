import { createCategory, createTodo } from '@/db';
import type { CreateCategoryInput, CreateTodoInput } from '@/types/todo';

/**
 * ダミーデータを挿入
 */
export async function seedData() {
  try {
    console.log('Seeding data...');

    // カテゴリを作成
    const workCategory = await createCategory({
      name: '仕事',
      color: '#2196F3',
      icon: 'briefcase',
      sortOrder: 0,
    });

    const personalCategory = await createCategory({
      name: '個人',
      color: '#4CAF50',
      icon: 'user',
      sortOrder: 1,
    });

    const shoppingCategory = await createCategory({
      name: '買い物',
      color: '#FF9800',
      icon: 'shopping-cart',
      sortOrder: 2,
    });

    const hobbyCategory = await createCategory({
      name: '趣味',
      color: '#9C27B0',
      icon: 'star',
      sortOrder: 3,
    });

    // TODOを作成
    const todos: CreateTodoInput[] = [
      {
        title: 'プロジェクト仕様書を作成',
        description: '新プロジェクトの仕様書をまとめる',
        priority: 'high',
        status: 'in_progress',
        categoryId: workCategory.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['重要', '緊急']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 0,
        reminderTime: null,
      },
      {
        title: 'ミーティング資料準備',
        description: '明日のミーティングで使う資料を準備する',
        priority: 'high',
        status: 'pending',
        categoryId: workCategory.id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['ミーティング']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 1,
        reminderTime: null,
      },
      {
        title: 'コードレビュー',
        description: 'プルリクエストをレビューする',
        priority: 'medium',
        status: 'pending',
        categoryId: workCategory.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['開発']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 2,
        reminderTime: null,
      },
      {
        title: '歯医者の予約',
        description: '定期検診の予約を取る',
        priority: 'medium',
        status: 'pending',
        categoryId: personalCategory.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['健康']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 3,
        reminderTime: null,
      },
      {
        title: '書類を整理',
        description: '溜まっている書類を整理する',
        priority: 'low',
        status: 'pending',
        categoryId: personalCategory.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['整理整頓']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 4,
        reminderTime: null,
      },
      {
        title: '食材を買う',
        description: '今週分の食材を購入する',
        priority: 'medium',
        status: 'pending',
        categoryId: shoppingCategory.id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['食品']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 5,
        reminderTime: null,
      },
      {
        title: '本を読む',
        description: '積読になっている本を読み進める',
        priority: 'low',
        status: 'in_progress',
        categoryId: hobbyCategory.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['読書']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 6,
        reminderTime: null,
      },
      {
        title: 'ジムに行く',
        description: '週3回のトレーニング',
        priority: 'medium',
        status: 'completed',
        categoryId: hobbyCategory.id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['運動', '健康']),
        isRecurring: true,
        recurringPattern: JSON.stringify({ frequency: 'weekly', days: [1, 3, 5] }),
        parentId: null,
        sortOrder: 7,
        reminderTime: null,
      },
      {
        title: 'メールの返信',
        description: '溜まっているメールに返信する',
        priority: 'high',
        status: 'completed',
        categoryId: workCategory.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['メール']),
        isRecurring: false,
        recurringPattern: null,
        parentId: null,
        sortOrder: 8,
        reminderTime: null,
      },
      {
        title: '家の掃除',
        description: 'リビングと寝室を掃除する',
        priority: 'low',
        status: 'pending',
        categoryId: personalCategory.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['掃除']),
        isRecurring: true,
        recurringPattern: JSON.stringify({ frequency: 'weekly', days: [0] }),
        parentId: null,
        sortOrder: 9,
        reminderTime: null,
      },
    ];

    for (const todoData of todos) {
      await createTodo(todoData);
    }

    console.log('Seed data created successfully!');
    console.log(`Created ${todos.length} todos and 4 categories`);
  } catch (error) {
    console.error('Failed to seed data:', error);
    throw error;
  }
}

/**
 * 開発用：データベースをリセットしてシードデータを挿入
 */
export async function resetAndSeedData() {
  // TODO: データベースをリセットする機能を実装
  await seedData();
}
