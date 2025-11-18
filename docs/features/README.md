# 未実装機能一覧

このディレクトリには、TODOアプリの未実装機能に関するドキュメントが格納されています。

## 機能概要

| 機能 | 優先度 | 状況 | ドキュメント |
|------|--------|------|-------------|
| DateTimePicker | 中 | 未実装 | [date-time-picker.md](./date-time-picker.md) |
| 通知機能 | 中 | 一部実装 | [notifications.md](./notifications.md) |
| 繰り返しタスク | 中〜高 | 基盤のみ | [recurring-tasks.md](./recurring-tasks.md) |
| サブタスク | 高 | 表示のみ | [subtasks.md](./subtasks.md) |

## 各機能の詳細

### 1. DateTimePicker実装

**ファイル:** [date-time-picker.md](./date-time-picker.md)

**概要:**
- expo-uiのDateTimePickerを使用した期限設定UI
- 現在は期限設定ボタンのみ実装済み

**技術:**
- @expo/ui (v0.2.0-beta.7)
- ネイティブの日付選択ピッカー

**実装場所:**
- `app/todo/[id].tsx`（プレースホルダー: 442-443行）

---

### 2. 通知機能

**ファイル:** [notifications.md](./notifications.md)

**概要:**
- expo-notificationsを使用したリマインダー通知
- 期限が近づいたTODOの通知
- 通知タップ時のアプリ内ナビゲーション

**技術:**
- expo-notifications (v0.32.13)
- ローカル通知のスケジューリング
- バックグラウンド通知処理

**実装場所:**
- `app/_layout.tsx`（通知ハンドラー）
- `app/todo/[id].tsx`（リマインダー設定UI）
- `utils/notification-scheduler.ts`（新規作成）
- `hooks/use-notifications.ts`（新規作成）

**必要な設定:**
- `app.json`に通知プラグイン設定を追加

---

### 3. 繰り返しタスク

**ファイル:** [recurring-tasks.md](./recurring-tasks.md)

**概要:**
- 定期的に実施するTODOの自動再生成
- 毎日・毎週・毎月・毎年の繰り返しパターン
- タスク完了時に次回タスクを自動生成

**技術:**
- 繰り返しパターンのJSON保存（既存スキーマ使用）
- 日付計算ロジック
- カスタムの繰り返しパターン設定UI

**実装場所:**
- `types/todo.ts`（RecurringPattern型定義追加）
- `app/todo/[id].tsx`（繰り返し設定UI追加）
- `utils/recurring-tasks.ts`（新規作成）
- `components/RecurringPatternSelector.tsx`（新規作成）

**現状:**
- データベーススキーマに`isRecurring`と`recurringPattern`が存在
- UIと自動生成ロジックが未実装

---

### 4. サブタスク機能

**ファイル:** [subtasks.md](./subtasks.md)

**概要:**
- 大きなTODOを小さなタスクに分割
- 階層構造での管理
- 親タスクの進捗自動更新

**技術:**
- 親子関係のデータベース設計（既存）
- サブタスク作成・編集UI
- 進捗バーコンポーネント
- ドラッグ&ドロップ並び替え（オプション）

**実装場所:**
- `app/todo/[id].tsx`（サブタスク追加・編集UI）
- `components/SubtaskItem.tsx`（新規作成）
- `components/SubtaskProgressBar.tsx`（新規作成）
- `components/SubtaskForm.tsx`（新規作成）
- `utils/subtask-manager.ts`（新規作成）

**現状:**
- データベーススキーマに`parentId`が存在
- `useSubTodos`フックで取得可能
- TODO詳細画面で読み取り専用表示のみ

---

## 実装の優先順位

### 高優先度
1. **サブタスク機能** - 基盤が整っており、UIを追加するだけで大きく機能向上

### 中〜高優先度
2. **繰り返しタスク** - TODOアプリの差別化要因となる重要機能

### 中優先度
3. **通知機能** - ユーザー体験を大きく向上させるが、基本機能は動作している
4. **DateTimePicker** - UX向上のために実装が望ましい

## 実装時の注意事項

### 共通
- React 19.1の新機能を活用（refをpropsとして受け取れる、use API など）
- React Native New Architecture対応
- Expo SDK 54の機能を活用
- TypeScriptのStrictモードに準拠
- プラットフォーム固有の動作を考慮（iOS/Android/Web）

### テスト
- 各機能の実装後は必ずテストを実施
- iOS/Android両方での動作確認
- エッジケースの考慮（タイムゾーン、月末日、ネスト制限など）

### パフォーマンス
- React Compiler有効のため、過度なメモ化は不要
- 大量データの場合の仮想化を検討
- 画像やアセットの最適化

## 関連ドキュメント

- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体の技術スタック・規約
- [WEBVIEW_INTEGRATION.md](../../WEBVIEW_INTEGRATION.md) - WebView統合（別プロジェクト参考）

## 実装手順の一般的な流れ

1. **ドキュメント確認**
   - 該当機能のドキュメントを熟読
   - 依存関係・技術仕様を確認

2. **型定義の追加**
   - `types/todo.ts`に必要な型を追加

3. **データベース拡張（必要な場合）**
   - `db/schema.ts`の更新
   - マイグレーション考慮

4. **ユーティリティ関数の実装**
   - `utils/`配下に新規ファイル作成
   - ビジネスロジックの実装

5. **コンポーネントの作成**
   - `components/`配下に新規コンポーネント作成
   - 再利用可能な設計

6. **画面への統合**
   - `app/`配下の該当画面に統合
   - UIの調整

7. **フックの作成・更新**
   - `hooks/`配下にカスタムフック作成
   - データフェッチ・状態管理

8. **テスト**
   - 機能テスト
   - エッジケーステスト
   - パフォーマンステスト

9. **ドキュメント更新**
   - CLAUDE.mdへの機能追加の記載
   - 実装済みマークの更新

## 質問・フィードバック

実装中に不明点があれば、各ドキュメントの「参考ドキュメント」セクションを参照してください。

Expoの最新ドキュメントは以下で検索可能：
```bash
expo-agent-cli search <query>
expo-agent-cli docs <path>
```
