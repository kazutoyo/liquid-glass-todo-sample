# 繰り返しタスク機能

## 概要

定期的に実施する必要があるTODOを自動的に再生成する繰り返しタスク機能の実装。毎日・毎週・毎月などのパターンに対応し、完了後に次回のタスクを自動生成します。

## 現状

### 実装済み
- データベーススキーマに繰り返し関連フィールドが存在
  - `isRecurring: boolean` - 繰り返しタスクフラグ
  - `recurringPattern: string | null` - 繰り返しパターン（JSON文字列）
  - [db/schema.ts:12-13](../db/schema.ts#L12-13)
- Todo型に繰り返し関連の型定義
  - [types/todo.ts](../types/todo.ts)
- TODO作成時に`isRecurring`と`recurringPattern`を保存可能
  - [app/todo/[id].tsx:83-84](../app/todo/[id].tsx#L83-84)

### 未実装
- 繰り返しパターン設定UI
- 繰り返しパターンの型定義
- タスク完了時の次回タスク自動生成ロジック
- 繰り返しタスクの一覧表示・管理UI
- 繰り返しタスクのスキップ機能

## 技術仕様

### 繰り返しパターンの型定義

**実装場所:** `types/todo.ts`（追加）

```typescript
export type RecurringFrequency =
  | 'daily'      // 毎日
  | 'weekly'     // 毎週
  | 'monthly'    // 毎月
  | 'yearly';    // 毎年

export type RecurringPattern = {
  frequency: RecurringFrequency;
  interval: number; // 間隔（例: 2 = 2日ごと、2週間ごと）
  daysOfWeek?: number[]; // 曜日指定（0=日曜, 1=月曜, ...）※weekly時のみ
  dayOfMonth?: number; // 月の日付（1-31）※monthly時のみ
  endDate?: string | null; // 繰り返し終了日（null=無期限）
  count?: number | null; // 繰り返し回数（null=無制限）
};

// 使用例
const weeklyPattern: RecurringPattern = {
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: [1, 3, 5], // 月・水・金
  endDate: null,
  count: null,
};

const monthlyPattern: RecurringPattern = {
  frequency: 'monthly',
  interval: 1,
  dayOfMonth: 1, // 毎月1日
  endDate: null,
  count: null,
};
```

### データベーススキーマ拡張

現在のスキーマで`recurringPattern`は`text`型（JSON文字列）として保存されています。これは十分ですが、追加フィールドを検討：

```typescript
// db/schema.ts（追加を検討）
export const todos = sqliteTable('todos', {
  // ... 既存フィールド
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  recurringPattern: text('recurring_pattern'), // JSON文字列
  recurringParentId: integer('recurring_parent_id'), // 繰り返しタスクの親ID
  lastGeneratedDate: text('last_generated_date'), // 最後に生成された日時
  completedCount: integer('completed_count').default(0), // 完了回数
});
```

## 実装要件

### 1. 繰り返しパターン設定UI

**実装場所:** `app/todo/[id].tsx`（セクション追加）

```typescript
const [isRecurring, setIsRecurring] = useState(false);
const [recurringPattern, setRecurringPattern] = useState<RecurringPattern | null>(null);

// UIコンポーネント
<View style={styles.section}>
  <Text style={[styles.label, { color: colors.text }]}>繰り返し</Text>

  {/* 繰り返しON/OFFトグル */}
  <TouchableOpacity
    style={styles.toggleButton}
    onPress={() => setIsRecurring(!isRecurring)}
    activeOpacity={0.7}>
    <FontAwesome
      name={isRecurring ? 'toggle-on' : 'toggle-off'}
      size={24}
      color={isRecurring ? colors.tint : colors.text + '60'}
    />
    <Text style={[styles.toggleText, { color: colors.text }]}>
      繰り返しタスク
    </Text>
  </TouchableOpacity>

  {/* 繰り返しパターン設定（isRecurring=trueの時のみ表示） */}
  {isRecurring && (
    <RecurringPatternSelector
      pattern={recurringPattern}
      onChange={setRecurringPattern}
    />
  )}
</View>
```

### 2. 繰り返しパターン選択コンポーネント

**実装場所:** `components/RecurringPatternSelector.tsx`（新規作成）

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { RecurringPattern, RecurringFrequency } from '@/types/todo';

type Props = {
  pattern: RecurringPattern | null;
  onChange: (pattern: RecurringPattern) => void;
};

export function RecurringPatternSelector({ pattern, onChange }: Props) {
  const [frequency, setFrequency] = useState<RecurringFrequency>('daily');
  const [interval, setInterval] = useState(1);

  // 頻度選択ボタン
  const frequencies: { value: RecurringFrequency; label: string }[] = [
    { value: 'daily', label: '毎日' },
    { value: 'weekly', label: '毎週' },
    { value: 'monthly', label: '毎月' },
    { value: 'yearly', label: '毎年' },
  ];

  return (
    <View style={styles.container}>
      {/* 頻度選択 */}
      <View style={styles.buttonGroup}>
        {frequencies.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.button,
              frequency === f.value && styles.buttonActive,
            ]}
            onPress={() => {
              setFrequency(f.value);
              onChange({ ...pattern, frequency: f.value, interval });
            }}>
            <Text>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 間隔設定 */}
      <View style={styles.intervalContainer}>
        <Text>間隔:</Text>
        <TextInput
          value={interval.toString()}
          onChangeText={(text) => {
            const num = parseInt(text) || 1;
            setInterval(num);
            onChange({ ...pattern, frequency, interval: num });
          }}
          keyboardType="number-pad"
          style={styles.intervalInput}
        />
        <Text>{getIntervalLabel(frequency)}</Text>
      </View>

      {/* 曜日選択（weekly時のみ） */}
      {frequency === 'weekly' && (
        <WeekdaySelector
          selectedDays={pattern?.daysOfWeek || []}
          onChange={(days) => onChange({ ...pattern, frequency, interval, daysOfWeek: days })}
        />
      )}

      {/* 日付選択（monthly時のみ） */}
      {frequency === 'monthly' && (
        <DayOfMonthSelector
          selectedDay={pattern?.dayOfMonth || 1}
          onChange={(day) => onChange({ ...pattern, frequency, interval, dayOfMonth: day })}
        />
      )}
    </View>
  );
}
```

### 3. 次回タスク生成ロジック

**実装場所:** `utils/recurring-tasks.ts`（新規作成）

```typescript
import type { Todo, RecurringPattern } from '@/types/todo';

/**
 * 繰り返しパターンに基づいて次回のタスク実施日を計算
 */
export function calculateNextDueDate(
  currentDueDate: Date,
  pattern: RecurringPattern
): Date | null {
  const next = new Date(currentDueDate);

  switch (pattern.frequency) {
    case 'daily':
      next.setDate(next.getDate() + pattern.interval);
      break;

    case 'weekly':
      // 次の該当曜日を探す
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = pattern.daysOfWeek.sort((a, b) => a - b);

        // 今日より後の曜日を探す
        let nextDay = sortedDays.find(day => day > currentDay);

        if (!nextDay) {
          // なければ次の週の最初の曜日
          nextDay = sortedDays[0];
          next.setDate(next.getDate() + 7 * pattern.interval);
        }

        const daysToAdd = nextDay - currentDay;
        next.setDate(next.getDate() + daysToAdd);
      } else {
        next.setDate(next.getDate() + 7 * pattern.interval);
      }
      break;

    case 'monthly':
      next.setMonth(next.getMonth() + pattern.interval);
      if (pattern.dayOfMonth) {
        next.setDate(pattern.dayOfMonth);
      }
      break;

    case 'yearly':
      next.setFullYear(next.getFullYear() + pattern.interval);
      break;
  }

  // 終了日チェック
  if (pattern.endDate && next > new Date(pattern.endDate)) {
    return null;
  }

  return next;
}

/**
 * タスク完了時に次回のタスクを生成
 */
export async function generateNextRecurringTask(
  completedTodo: Todo
): Promise<number | null> {
  if (!completedTodo.isRecurring || !completedTodo.recurringPattern) {
    return null;
  }

  const pattern: RecurringPattern = JSON.parse(completedTodo.recurringPattern);

  // 回数制限チェック
  if (pattern.count !== null && pattern.count !== undefined) {
    const completedCount = completedTodo.completedCount || 0;
    if (completedCount >= pattern.count) {
      return null; // 制限回数に達した
    }
  }

  // 次回の期限を計算
  const currentDueDate = completedTodo.dueDate
    ? new Date(completedTodo.dueDate)
    : new Date();

  const nextDueDate = calculateNextDueDate(currentDueDate, pattern);

  if (!nextDueDate) {
    return null; // 繰り返し終了
  }

  // 新しいタスクを作成
  const newTodo = await createTodo({
    title: completedTodo.title,
    description: completedTodo.description,
    priority: completedTodo.priority,
    status: 'pending', // 新しいタスクは未着手
    categoryId: completedTodo.categoryId,
    dueDate: nextDueDate.toISOString(),
    tags: completedTodo.tags,
    isRecurring: true,
    recurringPattern: completedTodo.recurringPattern,
    parentId: completedTodo.recurringParentId || completedTodo.id, // 親IDを保持
    sortOrder: completedTodo.sortOrder,
    reminderTime: null, // リマインダーは再設定が必要
  });

  return newTodo.id;
}
```

### 4. タスク完了時のフック統合

**実装場所:** `hooks/use-todos.ts`（修正）

```typescript
import { generateNextRecurringTask } from '@/utils/recurring-tasks';

export function useTodos(filter?: TodoFilter, sort?: TodoSort) {
  // ... 既存コード

  const updateTodoStatus = async (id: number, status: TodoStatus) => {
    const todo = todos.find(t => t.id === id);

    if (!todo) return;

    // ステータスを更新
    await updateTodo({ id, status });

    // 完了状態になった場合、繰り返しタスクの次回を生成
    if (status === 'completed' && todo.isRecurring) {
      const nextTaskId = await generateNextRecurringTask(todo);

      if (nextTaskId) {
        // 次回タスクが生成されたことを通知
        Alert.alert('成功', '次回のタスクを作成しました');
      }
    }

    loadTodos();
  };

  return { todos, loading, refresh: loadTodos, updateTodoStatus };
}
```

### 5. 繰り返しタスク一覧表示

**実装場所:** `app/(tabs)/todos.tsx`（セクション追加）

繰り返しタスクを通常のタスクと区別して表示：

```typescript
// 繰り返しタスクのアイコン表示
{todo.isRecurring && (
  <FontAwesome
    name="repeat"
    size={14}
    color={colors.text + '60'}
    style={styles.recurringIcon}
  />
)}
```

## 実装手順

1. **型定義の追加**
   - `types/todo.ts`に`RecurringPattern`と`RecurringFrequency`を追加

2. **繰り返しパターン選択UIの実装**
   - `components/RecurringPatternSelector.tsx`の作成
   - `components/WeekdaySelector.tsx`の作成（曜日選択用）
   - `components/DayOfMonthSelector.tsx`の作成（日付選択用）

3. **TODO詳細画面の更新**
   - `app/todo/[id].tsx`に繰り返し設定セクションを追加
   - 保存時に`recurringPattern`をJSON文字列化

4. **次回タスク生成ロジックの実装**
   - `utils/recurring-tasks.ts`の作成
   - `calculateNextDueDate`関数の実装
   - `generateNextRecurringTask`関数の実装

5. **フックの統合**
   - `hooks/use-todos.ts`に完了時の自動生成ロジックを追加
   - `updateTodoStatus`関数の拡張

6. **UI表示の改善**
   - 繰り返しタスクアイコンの表示
   - 次回実施日の表示
   - 繰り返しパターンの可読表示（"毎週月・水・金"など）

7. **テスト**
   - 各頻度パターンの動作確認
   - タスク完了時の次回生成確認
   - 終了日・回数制限の動作確認

## 追加機能（推奨）

### 繰り返しタスクのスキップ
- 特定の回だけスキップする機能
- スキップ時は次の次回を生成

### 繰り返しタスクの一括編集
- 「このタスクのみ」or「今後のすべて」を選択
- 親タスクと子タスクの関係を管理

### 繰り返しパターンのテンプレート
- よく使うパターンをプリセット化
  - 平日毎日
  - 月初
  - 週次レビュー
  - など

### 繰り返し履歴の表示
- 過去の完了履歴を一覧表示
- 完了率の統計表示

## 関連ファイル

- `db/schema.ts` - データベーススキーマ（繰り返し関連フィールド）
- `types/todo.ts` - Todo型定義
- `app/todo/[id].tsx` - TODO詳細画面（UI追加場所）
- `hooks/use-todos.ts` - TODOデータ管理フック

## 優先度

**中〜高** - TODOアプリの差別化要因となる重要機能

## 注意事項

- タイムゾーンの扱いに注意（日付計算時）
- 月末日の扱い（31日指定で30日の月など）
- DST（夏時間）の影響を考慮
- バックグラウンドでの次回タスク生成（通知機能と連携）
