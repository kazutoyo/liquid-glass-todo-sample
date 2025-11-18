# サブタスク機能

## 概要

大きなTODOを小さなタスクに分割し、階層構造で管理するサブタスク機能の実装。親タスクの進捗状況をサブタスクの完了状況に基づいて自動更新します。

## 現状

### 実装済み
- データベーススキーマに`parentId`フィールドが存在
  - [db/schema.ts:14](../db/schema.ts#L14)
- Todo型に`parentId: number | null`が定義済み
  - [types/todo.ts](../types/todo.ts)
- サブタスク取得用のフック
  - `useSubTodos(parentId)` - [hooks/use-todos.ts](../hooks/use-todos.ts)
- TODO詳細画面でサブタスク一覧を表示
  - [app/todo/[id].tsx:359-399](../app/todo/[id].tsx#L359-399)
  - 読み取り専用（編集・追加機能なし）

### 未実装
- サブタスクの作成UI
- サブタスクの編集・削除UI
- サブタスクの並び替え（ドラッグ&ドロップ）
- 親タスクの進捗状況自動更新
- サブタスクの完了チェックボックス
- ネストレベルの制限（無限ネスト防止）

## 技術仕様

### データベーススキーマ

現在のスキーマで基本的な親子関係は表現可能ですが、追加フィールドを検討：

```typescript
// db/schema.ts（拡張を検討）
export const todos = sqliteTable('todos', {
  // ... 既存フィールド
  parentId: integer('parent_id'), // 親タスクのID
  sortOrder: integer('sort_order').notNull().default(0), // 既存（サブタスクの並び順に使用）
  depth: integer('depth').notNull().default(0), // ネストレベル（0=ルート）
  completedSubtasks: integer('completed_subtasks').default(0), // 完了したサブタスク数
  totalSubtasks: integer('total_subtasks').default(0), // 総サブタスク数
});
```

### サブタスク関連の型定義

**実装場所:** `types/todo.ts`（追加）

```typescript
// サブタスクの統計情報
export type SubtaskStats = {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number; // 0-100
};

// サブタスク付きTodo型
export type TodoWithSubtasks = Todo & {
  subtasks?: Todo[];
  subtaskStats?: SubtaskStats;
};
```

## 実装要件

### 1. サブタスク作成UI

**実装場所:** `app/todo/[id].tsx`（サブタスクセクション拡張）

#### オプション1: インライン追加

```typescript
{/* サブタスク */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={[styles.label, { color: colors.text }]}>
      サブタスク ({subTodos.length})
    </Text>

    {/* 進捗バー */}
    {subTodos.length > 0 && (
      <SubtaskProgressBar subtasks={subTodos} />
    )}
  </View>

  {/* サブタスク一覧 */}
  {subTodos.map((subTodo, index) => (
    <SubtaskItem
      key={subTodo.id}
      subtask={subTodo}
      onToggleComplete={() => handleToggleSubtask(subTodo.id)}
      onEdit={() => handleEditSubtask(subTodo.id)}
      onDelete={() => handleDeleteSubtask(subTodo.id)}
    />
  ))}

  {/* サブタスク追加ボタン */}
  <TouchableOpacity
    style={styles.addSubtaskButton}
    onPress={handleAddSubtask}
    activeOpacity={0.7}>
    <FontAwesome name="plus-circle" size={20} color={colors.tint} />
    <Text style={[styles.addSubtaskText, { color: colors.tint }]}>
      サブタスクを追加
    </Text>
  </TouchableOpacity>
</View>
```

#### オプション2: モーダルで追加

```typescript
const [showSubtaskModal, setShowSubtaskModal] = useState(false);
const [editingSubtask, setEditingSubtask] = useState<Todo | null>(null);

const handleAddSubtask = () => {
  setEditingSubtask(null);
  setShowSubtaskModal(true);
};

// モーダル内で簡易フォーム
<Modal
  visible={showSubtaskModal}
  animationType="slide"
  presentationStyle="formSheet">
  <SubtaskForm
    parentId={todoId}
    subtask={editingSubtask}
    onSave={async (subtaskData) => {
      if (editingSubtask) {
        await updateTodo({ id: editingSubtask.id, ...subtaskData });
      } else {
        await createTodo({ ...subtaskData, parentId: todoId });
      }
      setShowSubtaskModal(false);
      // サブタスクを再読み込み
    }}
    onCancel={() => setShowSubtaskModal(false)}
  />
</Modal>
```

### 2. サブタスクアイテムコンポーネント

**実装場所:** `components/SubtaskItem.tsx`（新規作成）

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Todo } from '@/types/todo';

type Props = {
  subtask: Todo;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function SubtaskItem({ subtask, onToggleComplete, onEdit, onDelete }: Props) {
  const isCompleted = subtask.status === 'completed';

  return (
    <View style={styles.container}>
      {/* チェックボックス */}
      <TouchableOpacity onPress={onToggleComplete} activeOpacity={0.7}>
        <FontAwesome
          name={isCompleted ? 'check-circle' : 'circle-o'}
          size={20}
          color={isCompleted ? '#4CAF50' : '#999'}
        />
      </TouchableOpacity>

      {/* タイトル */}
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onEdit}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.completedTitle,
          ]}>
          {subtask.title}
        </Text>

        {/* サブタスクの優先度・期限などを表示 */}
        {subtask.dueDate && (
          <Text style={styles.dueDate}>
            {new Date(subtask.dueDate).toLocaleDateString('ja-JP')}
          </Text>
        )}
      </TouchableOpacity>

      {/* アクションボタン */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
          <FontAwesome name="edit" size={16} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
          <FontAwesome name="trash" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#333',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
```

### 3. サブタスク進捗バー

**実装場所:** `components/SubtaskProgressBar.tsx`（新規作成）

```typescript
import { View, Text, StyleSheet } from 'react-native';
import type { Todo } from '@/types/todo';

type Props = {
  subtasks: Todo[];
};

export function SubtaskProgressBar({ subtasks }: Props) {
  const total = subtasks.length;
  const completed = subtasks.filter(t => t.status === 'completed').length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {completed}/{total} 完了
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 60,
  },
});
```

### 4. サブタスクフォーム

**実装場所:** `components/SubtaskForm.tsx`（新規作成）

```typescript
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Todo, CreateTodoInput, TodoPriority } from '@/types/todo';

type Props = {
  parentId: number;
  subtask: Todo | null; // null=新規作成
  onSave: (data: CreateTodoInput) => Promise<void>;
  onCancel: () => void;
};

export function SubtaskForm({ parentId, subtask, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(subtask?.title || '');
  const [description, setDescription] = useState(subtask?.description || '');
  const [priority, setPriority] = useState<TodoPriority>(
    subtask?.priority || 'medium'
  );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    const data: CreateTodoInput = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status: 'pending',
      categoryId: null,
      dueDate: null,
      tags: null,
      isRecurring: false,
      recurringPattern: null,
      parentId,
      sortOrder: 0,
      reminderTime: null,
    };

    await onSave(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {subtask ? 'サブタスク編集' : '新規サブタスク'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="タイトル"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="説明（任意）"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* 優先度選択 */}
      <View style={styles.priorityContainer}>
        {(['low', 'medium', 'high'] as TodoPriority[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityButton,
              priority === p && styles.priorityButtonActive,
            ]}
            onPress={() => setPriority(p)}>
            <Text>{p === 'low' ? '低' : p === 'medium' ? '中' : '高'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ボタン */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### 5. 親タスクの進捗状況自動更新

**実装場所:** `utils/subtask-manager.ts`（新規作成）

```typescript
import { getTodos, updateTodo } from '@/db';
import type { Todo, TodoStatus } from '@/types/todo';

/**
 * サブタスクの状況に基づいて親タスクのステータスを更新
 */
export async function updateParentTaskStatus(parentId: number) {
  // サブタスクを取得
  const subtasks = await getTodos({ parentId });

  if (subtasks.length === 0) {
    return;
  }

  const completedCount = subtasks.filter(t => t.status === 'completed').length;
  const inProgressCount = subtasks.filter(t => t.status === 'in_progress').length;

  // 親タスクのステータスを決定
  let parentStatus: TodoStatus;

  if (completedCount === subtasks.length) {
    // すべて完了
    parentStatus = 'completed';
  } else if (completedCount > 0 || inProgressCount > 0) {
    // 一部完了または進行中
    parentStatus = 'in_progress';
  } else {
    // すべて未着手
    parentStatus = 'pending';
  }

  // 親タスクを更新
  await updateTodo({
    id: parentId,
    status: parentStatus,
    completedSubtasks: completedCount,
    totalSubtasks: subtasks.length,
  });
}

/**
 * サブタスクの完了状態をトグル
 */
export async function toggleSubtaskCompletion(subtaskId: number) {
  const subtasks = await getTodos({ id: subtaskId });
  const subtask = subtasks[0];

  if (!subtask) return;

  const newStatus: TodoStatus =
    subtask.status === 'completed' ? 'pending' : 'completed';

  await updateTodo({ id: subtaskId, status: newStatus });

  // 親タスクの状態を更新
  if (subtask.parentId) {
    await updateParentTaskStatus(subtask.parentId);
  }
}
```

### 6. サブタスクの並び替え

**実装場所:** `components/SubtaskList.tsx`（新規作成）

React Native Reanimatedを使用したドラッグ&ドロップの実装：

```typescript
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Todo } from '@/types/todo';
import { SubtaskItem } from './SubtaskItem';

type Props = {
  subtasks: Todo[];
  onReorder: (reorderedSubtasks: Todo[]) => void;
  onToggleComplete: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export function SubtaskList({
  subtasks,
  onReorder,
  onToggleComplete,
  onEdit,
  onDelete,
}: Props) {
  const [data, setData] = useState(subtasks);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Todo>) => (
    <ScaleDecorator>
      <SubtaskItem
        subtask={item}
        onToggleComplete={() => onToggleComplete(item.id)}
        onEdit={() => onEdit(item.id)}
        onDelete={() => onDelete(item.id)}
        onLongPress={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={({ data }) => {
          setData(data);
          onReorder(data);
        }}
      />
    </GestureHandlerRootView>
  );
}
```

**注意:** `react-native-draggable-flatlist`と`react-native-gesture-handler`のインストールが必要：

```bash
bun add react-native-draggable-flatlist react-native-gesture-handler
```

## 実装手順

1. **コンポーネントの作成**
   - `components/SubtaskItem.tsx`
   - `components/SubtaskProgressBar.tsx`
   - `components/SubtaskForm.tsx`
   - `components/SubtaskList.tsx`（オプション：ドラッグ&ドロップ用）

2. **ユーティリティ関数の実装**
   - `utils/subtask-manager.ts`
   - `updateParentTaskStatus`関数
   - `toggleSubtaskCompletion`関数

3. **TODO詳細画面の拡張**
   - `app/todo/[id].tsx`のサブタスクセクションを更新
   - サブタスク追加・編集・削除機能の実装
   - 進捗バーの表示

4. **データベース関数の拡張**
   - `db/index.ts`にサブタスク関連のクエリを追加
   - `getSubtasks(parentId)`
   - `updateSubtaskOrder(subtasks)`

5. **フックの拡張**
   - `hooks/use-todos.ts`にサブタスク操作関数を追加
   - `useSubTodos`の機能拡張

6. **UI/UXの改善**
   - サブタスクの展開/折りたたみ
   - サブタスクのインデント表示
   - 親タスク一覧でのサブタスク数表示

7. **テスト**
   - サブタスクの作成・編集・削除
   - 親タスクの自動ステータス更新
   - 並び替え機能（実装した場合）

## 追加機能（推奨）

### ネストレベルの制限
- 無限ネストを防ぐため、最大2-3階層に制限
- 深い階層のサブタスク作成を禁止

```typescript
const MAX_DEPTH = 2;

async function canAddSubtask(parentId: number): Promise<boolean> {
  const parent = await getTodo(parentId);
  return (parent?.depth || 0) < MAX_DEPTH;
}
```

### サブタスクのバルク操作
- 複数サブタスクを一括完了
- すべてのサブタスクをコピー

### サブタスクテンプレート
- よく使うサブタスクのセットを保存
- テンプレートから一括追加

### サブタスクの統計表示
- 完了率のグラフ表示
- 所要時間の集計

## 関連ファイル

- `db/schema.ts` - データベーススキーマ（parentIdフィールド）
- `types/todo.ts` - Todo型定義
- `app/todo/[id].tsx` - TODO詳細画面（サブタスク表示）
- `hooks/use-todos.ts` - useSubTodosフック

## 優先度

**高** - 既に基盤は実装済みで、UIを追加するだけで大きく機能向上

## 依存関係

### 必須
- なし（既存の実装で基本機能は可能）

### オプション（ドラッグ&ドロップの場合）
- `react-native-draggable-flatlist`
- `react-native-gesture-handler`
- React Native Reanimated（既にインストール済み）

## 注意事項

- サブタスクの削除時に親タスクの統計を更新
- 循環参照の防止（タスクAのサブタスクBが、タスクBの親タスクAになるケース）
- 親タスクを削除した場合のサブタスクの扱い（カスケード削除 or 孤立）
