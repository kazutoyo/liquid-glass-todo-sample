# 通知機能（expo-notifications）

## 概要

TODOアプリにおける通知機能の実装。期限が近づいたTODOや、ユーザーが設定したリマインダー時刻に通知を送信する機能を追加します。

## 現状

### 実装済み
- expo-notifications (v0.32.13) のインストール
- データベーススキーマに`reminderTime`フィールドが存在（[db/schema.ts](../db/schema.ts)）
- Todo型に`reminderTime: string | null`が定義済み（[types/todo.ts](../types/todo.ts)）

### 未実装
- 通知パーミッションのリクエスト
- リマインダー時刻設定UI
- ローカル通知のスケジューリング
- 通知タップ時のアプリ内ナビゲーション
- バックグラウンド通知の処理

## 技術仕様

### 使用ライブラリ
- **expo-notifications** (v0.32.13) - 既にインストール済み

### 参考ドキュメント
```bash
expo-agent-cli search expo-notifications | jq '.results[0].path' | xargs -I {} expo-agent-cli docs {}
```

### app.json設定

現在の`app.json`には通知設定が未追加です。以下を追加する必要があります：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#007AFF",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#007AFF",
      "androidMode": "default",
      "androidCollapsedTitle": "TODOリマインダー"
    }
  }
}
```

## 実装要件

### 1. 通知パーミッション

**実装場所:** `app/_layout.tsx` または専用のhooks

```typescript
import * as Notifications from 'expo-notifications';

// アプリ起動時に通知パーミッションをリクエスト
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('通知の許可が必要です');
    return false;
  }

  return true;
}
```

### 2. リマインダー時刻設定UI

**実装場所:** `app/todo/[id].tsx`

- DateTimePickerを使用（date-time-picker.md参照）
- `reminderTime`状態の追加
- UIセクションの追加（期限設定の下など）

```typescript
const [reminderTime, setReminderTime] = useState<Date | null>(null);

// 保存時にreminderTimeをISO文字列に変換
reminderTime: reminderTime ? reminderTime.toISOString() : null,
```

### 3. 通知のスケジューリング

**実装場所:** `utils/notification-scheduler.ts`（新規作成）

```typescript
import * as Notifications from 'expo-notifications';

export async function scheduleTodoNotification(
  todoId: number,
  title: string,
  reminderTime: Date
) {
  // 既存の通知をキャンセル
  await cancelTodoNotification(todoId);

  // 新しい通知をスケジュール
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'TODOリマインダー',
      body: title,
      data: { todoId },
      sound: true,
    },
    trigger: {
      date: reminderTime,
    },
  });

  // 通知IDを保存（データベースに新しいフィールドが必要な場合）
  return identifier;
}

export async function cancelTodoNotification(todoId: number) {
  // データベースから通知IDを取得してキャンセル
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const todoNotifications = allNotifications.filter(
    n => n.content.data?.todoId === todoId
  );

  for (const notification of todoNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}
```

### 4. 通知ハンドラー

**実装場所:** `app/_layout.tsx`

```typescript
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

// 通知の表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // 通知タップ時のハンドラー
    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        const todoId = response.notification.request.content.data.todoId;
        if (todoId) {
          router.push(`/todo/${todoId}`);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  // ...
}
```

### 5. カスタムフック

**実装場所:** `hooks/use-notifications.ts`（新規作成）

```typescript
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export function useNotificationPermission() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
}

export function useScheduleTodoNotification() {
  return async (todoId: number, title: string, reminderTime: Date | null) => {
    if (!reminderTime) {
      await cancelTodoNotification(todoId);
      return;
    }

    await scheduleTodoNotification(todoId, title, reminderTime);
  };
}
```

## データベース拡張

現在のスキーマには`reminderTime`がありますが、通知IDを保存するフィールドを追加することを検討：

```typescript
// db/schema.ts
export const todos = sqliteTable('todos', {
  // ... 既存フィールド
  reminderTime: text('reminder_time'),
  notificationId: text('notification_id'), // 新規追加
});
```

## 通知の種類

### 1. リマインダー通知
- ユーザーが設定した`reminderTime`に通知
- TODO詳細画面から設定可能

### 2. 期限通知（推奨機能）
- 期限の1日前、1時間前などに自動通知
- 設定画面で通知タイミングをカスタマイズ可能

### 3. 繰り返しタスク通知（推奨機能）
- 繰り返しタスクの次回実施日に通知
- `isRecurring`と`recurringPattern`に基づく

## 実装手順

1. **app.json設定の追加**
   - 通知アイコンの作成（適切なサイズのPNG）
   - pluginsセクションの更新

2. **パーミッション処理**
   - ルートレイアウトでパーミッションリクエスト
   - 設定画面に通知許可状態の表示

3. **UI実装**
   - TODO詳細画面にリマインダー時刻設定を追加
   - DateTimePickerの統合（date-time-picker.mdと連携）

4. **通知スケジューリング**
   - `utils/notification-scheduler.ts`の作成
   - TODO保存時に通知をスケジュール
   - TODO削除時に通知をキャンセル

5. **通知ハンドラー**
   - ルートレイアウトで通知レスポンスの処理
   - タップ時のナビゲーション実装

6. **テスト**
   - 通知のスケジュール・キャンセルの確認
   - 通知タップ時の遷移確認
   - バックグラウンド/フォアグラウンド動作確認

## プラットフォーム固有の考慮事項

### iOS
- 通知設定でサウンド、バッジ、アラートを個別に制御可能
- バックグラウンド通知の制限あり

### Android
- 通知チャンネルの設定が必要（Android 8.0以降）
- 通知の優先度設定

```typescript
// Android通知チャンネル設定例
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('todo-reminders', {
    name: 'TODOリマインダー',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#007AFF',
  });
}
```

## 関連ファイル

- `db/schema.ts` - データベーススキーマ（reminderTimeフィールド）
- `types/todo.ts` - Todo型定義
- `app/todo/[id].tsx` - TODO詳細画面（UI追加場所）
- `app/_layout.tsx` - ルートレイアウト（パーミッション・ハンドラー）

## 優先度

**中** - ユーザー体験を大きく向上させる機能だが、基本機能は動作している

## 参考リンク

- [Expo Notifications公式ドキュメント](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Nativeの通知ベストプラクティス](https://reactnative.dev/docs/pushnotificationios)
