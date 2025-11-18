# DateTimePicker実装（expo-ui）

## 概要

現在、TODO詳細画面（`app/todo/[id].tsx`）では期限（dueDate）の設定UIがありますが、DateTimePickerの実装が未完了です。expo-uiのDateTimePickerを使用して日時選択機能を実装する必要があります。

## 現状

### 実装済み
- 期限設定ボタンのUI（[app/todo/[id].tsx:327-357](app/todo/[id].tsx#L327-357)）
- 期限の表示・クリア機能
- dueDate状態管理（`useState<Date | null>`）
- データベースへの保存（ISO文字列形式）

### 未実装
- DateTimePickerの表示ロジック
- ネイティブの日時選択UI
- 日付のみ/日時両方の選択モード

## 技術仕様

### 使用ライブラリ
- **@expo/ui** (v0.2.0-beta.7) - 既にインストール済み

### 参考ドキュメント
- Expo UI SDK: `expo-agent-cli docs versions/v54.0.0/sdk/ui.mdx`
- 公式URL: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/

### 実装場所
- ファイル: `app/todo/[id].tsx`
- 行: 442-443（プレースホルダーコメント）

## 実装要件

### 必須機能
1. **日付選択UI**
   - ネイティブの日付選択ピッカー
   - iOS: UIDatePicker相当
   - Android: Material DatePicker相当

2. **状態管理**
   - `showDatePicker` state (既存)
   - 選択された日時の反映

3. **ユーザー体験**
   - モーダル/ボトムシート表示
   - 選択のキャンセル機能
   - 選択完了時の確定処理

### 推奨機能
1. **選択モード**
   - 日付のみ選択
   - 日時選択（時刻も含む）
   - モード切り替えオプション

2. **デフォルト値**
   - 既存の期限がある場合: その日時を初期値に設定
   - 新規設定の場合: 現在時刻を初期値に設定

3. **バリデーション**
   - 過去の日付の警告（任意）
   - 日付フォーマットの統一

## 実装例（擬似コード）

```typescript
import { DateTimePicker } from '@expo/ui'; // 実際のインポートパスは要確認

// モーダル/ピッカー表示
{showDatePicker && (
  <DateTimePicker
    value={dueDate || new Date()}
    mode="datetime" // または "date"
    onChange={(event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    }}
    onDismiss={() => setShowDatePicker(false)}
  />
)}
```

## 関連ファイル

- `app/todo/[id].tsx` - TODO詳細画面（実装場所）
- `types/todo.ts` - Todo型定義（dueDateフィールド）
- `db/schema.ts` - データベーススキーマ（dueDate TEXT型）
- `db/index.ts` - データベース操作（ISO文字列として保存）

## 実装手順

1. **expo-uiのDateTimePickerドキュメント確認**
   ```bash
   expo-agent-cli search DateTimePicker | jq '.results[0].path' | xargs -I {} expo-agent-cli docs {}
   ```

2. **DateTimePickerのインポートと基本実装**
   - 正しいインポートパスの確認
   - 基本的なピッカーの表示

3. **状態管理の統合**
   - `showDatePicker`との連携
   - `dueDate`への反映

4. **UI/UXの改善**
   - プラットフォーム固有の表示スタイル
   - アニメーション
   - アクセシビリティ対応

5. **テスト**
   - iOS/Androidでの動作確認
   - 日付選択・クリアの動作確認
   - データベース保存の確認

## 注意事項

- expo-uiはベータ版（v0.2.0-beta.7）のため、APIが変更される可能性があります
- プラットフォームごとに表示が異なる可能性があるため、両OSでテストが必要です
- React 19.1の新機能（refをpropsとして受け取れる）を活用できます

## 優先度

**中** - 基本的なTODO機能は動作しているが、UX向上のために実装が望ましい
