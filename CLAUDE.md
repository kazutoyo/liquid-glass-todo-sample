# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは**TODOアプリ**です。Expo + React Nativeを使用し、SQLite + FTS5で全文検索に対応した高機能なタスク管理アプリケーションです。

### 技術スタック

- **フレームワーク**: React 19.2 + React Native 0.83.2 + TypeScript 5.9
- **開発プラットフォーム**: Expo SDK 55
- **ルーティング**: Expo Router 55 (ファイルベースルーティング、Typed Routes有効)
- **タブナビゲーション**: Native Tabs (iOS Liquid Glass対応、minimizeBehavior対応)
- **ナビゲーション**: React Navigation 7
- **データベース**: expo-sqlite (SQLite with FTS5)
- **ORM**: Drizzle ORM
- **UI**: expo-ui (SwiftUI/Jetpack Composeコンポーネント)
- **通知**: expo-notifications
- **アーキテクチャ**: React Native New Architecture有効

### 開発コマンド

```bash
# 開発サーバー起動
bun start           # 開発モード選択画面を表示
bun run android     # Android開発サーバー起動
bun run ios         # iOS開発サーバー起動
bun run web         # Web開発サーバー起動
```

**注意**: このプロジェクトはBunをパッケージマネージャーとして使用しています（bun.lockが存在）。npmではなくbunコマンドを使用してください。

## アーキテクチャ

### Expo Routerのファイルベースルーティング

このプロジェクトはExpo Router v6を使用しており、`app/`ディレクトリの構造がそのままルーティングになります。

**Typed Routes**: `experiments.typedRoutes: true`が有効なため、型安全なナビゲーションが可能です。

**ルーティング規則:**

- `(tabs)` - ルートグループ（URLに表示されない）
- `+` プレフィックス - 特殊ファイル（not-found、htmlなど）
- `_layout.tsx` - ネストルート用のレイアウトコンポーネント
- `[id].tsx` - 動的ルート（パラメータ付き）

### React Native New Architecture

SDK 55ではNew Architectureがデフォルト有効です。以下の機能が使えます：

- Fabric（新レンダラー）
- TurboModules
- Bridgeless Mode（将来的に）

### テーマシステム

- `constants/Colors.ts` - ライト/ダークモードの色定義
- `components/Themed.tsx` - テーマ対応コンポーネント（`Text`, `View`）
- `components/useColorScheme.ts/web.ts` - プラットフォーム別カラースキームフック
- `useThemeColor` - 動的なテーマ対応色のフック

システムのカラースキームに自動対応（`app.json`の`userInterfaceStyle: "automatic"`）。

### 重要な設定

**TypeScript:**

- Strictモード有効
- パスエイリアス: `@/*` → プロジェクトルート

**Expo設定（app.json）:**

- Android: Edge-to-edge有効、予測的バックジェスチャー無効
- iOS: タブレットサポート有効
- Web: Metroバンドラー、静的出力

**React Native Reanimated:**

- `import 'react-native-reanimated'`をルートレイアウトでインポート
- UIスレッドで実行される高性能アニメーション
- `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`を活用

## コーディング規約

### React 19の新機能活用

このプロジェクトはReact 19.2を使用しているため、以下の機能を活用できます：

1. **refをpropsとして受け取れる** - `forwardRef`が不要
2. **`use` API** - コンテキストやPromiseを条件付きで読み取り
3. **Actions** - フォーム処理の簡素化
4. **メタデータのネイティブサポート** - `<title>`, `<meta>`をコンポーネント内で使用可能

### ファイル命名規則

- **コンポーネント**: PascalCase（例: `EditScreenInfo.tsx`）
- **フック**: camelCase、`use`プレフィックス（例: `useColorScheme.ts`）
- **定数**: PascalCase（例: `Colors.ts`）
- **プラットフォーム固有**: `.web.ts`や`.native.ts`サフィックス

### プラットフォーム固有コード

プラットフォーム別の実装が必要な場合は、ファイル拡張子で分岐：

```
useColorScheme.ts      # React Native用（デフォルト）
useColorScheme.web.ts  # Web用
```

React Nativeの`Platform.OS`でランタイム分岐も可能。

### コンポーネントProps規約

TypeScriptの交差型を使用してネイティブコンポーネントのpropsを拡張：

```typescript
export type TextProps = ThemeProps & DefaultText["props"];
```

### ナビゲーション規約

Expo Routerの`Link`コンポーネントまたは`useRouter`フックを使用：

```typescript
import { Link, useRouter } from "expo-router";
```

### アイコン使用法

Font Awesomeアイコンは`@expo/vector-icons/FontAwesome`経由で使用：

```typescript
import FontAwesome from '@expo/vector-icons/FontAwesome';
<FontAwesome name="code" size={28} color={color} />
```

## 開発のベストプラクティス

### Expo Routerの使用

1. **ナビゲーション**: `expo-router`の`Link`コンポーネントまたは`useRouter`フックを使用
2. **レイアウト**: `_layout.tsx`で共通レイアウトを定義
3. **Dynamic Routes**: `[id].tsx`形式でパラメータ付きルート作成
4. **モーダル**: `presentation: 'modal'`でモーダル画面定義

### パフォーマンス最適化

- **React Native New Architecture**: Fabricレンダラーにより高速レンダリング
- **Reanimated**: UIスレッドで実行される高性能アニメーション
- **Expo Router**: 自動コード分割とレイジーロード

### エラーハンドリング

- `ErrorBoundary`が`expo-router`でエクスポートされており、ナビゲーションツリーのエラーをキャッチ
- ルートレイアウト（`app/_layout.tsx`）でフォント読み込みエラーをスロー

## プロジェクト固有の注意事項

### フォント管理

ルートレイアウト（`app/_layout.tsx`）で以下のフォントを読み込み：

- SpaceMono-Regular.ttf
- FontAwesome（`@expo/vector-icons`）

フォントが読み込まれるまでスプラッシュスクリーンを表示。

### スプラッシュスクリーン

`expo-splash-screen`を使用して、アセット読み込み完了まで自動非表示を防止：

```typescript
SplashScreen.preventAutoHideAsync();
```

### ナビゲーション状態

- 初期ルート: `(tabs)` グループ（`unstable_settings`で定義）
- モーダルプレゼンテーション: `modal`ルートでサポート

### VSCode設定

プロジェクトの`.vscode/settings.json`で以下を自動実行：

- 保存時にコード修正
- インポート整理
- メンバーソート

### テスト

現在、テストフレームワークはpackage.jsonに設定されていませんが、以下のテストファイルが存在します：

- `components/__tests__/StyledText-test.js` (レガシーJavaScriptテスト)

テストを追加する場合は、JestまたはVitestのセットアップを検討してください。

## Expo ドキュメント参照ルール

### 重要：Expo公式ドキュメントの参照方法

Expo SDK / Expo Router などのドキュメントを参照する際は、
**必ずMarkdown版のURLを使用すること**。

### URLの変換ルール

通常のWebページのURLの末尾に `.md` を付けるか、
末尾が `/` の場合は `index.md` を付ける。

| WebページURL | 使用すべきMarkdown URL |
|---|---|
| `https://docs.expo.dev/versions/latest/sdk/router/` | `https://docs.expo.dev/versions/latest/sdk/router/index.md` |
| `https://docs.expo.dev/router/introduction/` | `https://docs.expo.dev/router/introduction/index.md` |
| `https://docs.expo.dev/versions/latest/sdk/camera/` | `https://docs.expo.dev/versions/latest/sdk/camera/index.md` |

### ルール
- `docs.expo.dev` のURLを参照する場合は**常に** `.md` バージョンを使う
- Web検索でExpoドキュメントのURLが見つかった場合も、アクセス前にURLを変換する
- Markdown版は構造化されており、AIが正確に情報を読み取りやすい

## TODOアプリの機能

### データベース構造

**SQLite + FTS5 (全文検索対応):**

- `todos`: TODOテーブル（タイトル、説明、期限、優先度、ステータス、カテゴリ、タグ、繰り返し設定など）
- `categories`: カテゴリテーブル（名前、色、アイコン、並び順）
- `todos_fts`: FTS5仮想テーブル（タイトルと説明の全文検索）

**型定義（types/todo.ts）:**

- `Todo`: TODOアイテム（id, title, description, dueDate, priority, status, categoryId, tags, isRecurring, parentId, etc.）
- `Category`: カテゴリ（id, name, color, icon, sortOrder）
- `TodoPriority`: 優先度（low, medium, high）
- `TodoStatus`: ステータス（pending, in_progress, completed）

### データレイヤー

**データベース操作（db/index.ts）:**

- `initDatabase()`: データベース初期化、FTS5テーブルとトリガー作成
- `createTodo()`, `updateTodo()`, `deleteTodo()`, `getTodos()`: TODO CRUD操作
- `searchTodos()`: FTS5による全文検索
- `createCategory()`, `updateCategory()`, `deleteCategory()`, `getCategories()`: カテゴリ CRUD操作
- `getTodoStats()`, `getCategoryStats()`: 統計情報取得

**カスタムフック（hooks/）:**

- `useTodos()`: TODO操作とリアルタイム更新
- `useTodo()`: 単一TODO取得
- `useSearchTodos()`: 全文検索
- `useSubTodos()`: サブタスク取得
- `useTodoStats()`: 統計情報
- `useCategories()`: カテゴリ操作
- `useCategoryStats()`: カテゴリ別統計

### UIコンポーネント

**基本コンポーネント（components/）:**

- `TodoCard`: TODOカード（優先度、期限、ステータス表示）
- `TodoList`: TODO一覧表示
- `SectionHeader`: セクション見出し（カウント付き）
- `DevTools`: 開発用ツール（ダミーデータ挿入）

### Native Tabs実装

このアプリは**Expo Router 6のNative Tabs**を使用しています。

**特徴:**

- **iOS 26以降**: 自動的にLiquid Glassエフェクトが適用
- **minimizeBehavior**: スクロール時にタブバーを最小化（`onScrollDown`）
- **SF Symbols**: iOSではシステムアイコンを使用
- **Vector Icons**: Androidでは`@expo/vector-icons/FontAwesome`を使用
- **検索タブ**: `role="search"`で検索タブを分離
- **DynamicColorIOS**: ライト/ダークモードに自動対応

**実装（app/(tabs)/\_layout.tsx）:**

```tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Platform, DynamicColorIOS } from "react-native";

<NativeTabs
  minimizeBehavior="onScrollDown"
  style={{
    color:
      Platform.OS === "ios"
        ? DynamicColorIOS({ dark: "white", light: "black" })
        : undefined,
    tintColor:
      Platform.OS === "ios"
        ? DynamicColorIOS({ dark: "white", light: "#007AFF" })
        : "#007AFF",
  }}
>
  <NativeTabs.Trigger name="index">
    <Label>ホーム</Label>
    <Icon sf={{ default: "house", selected: "house.fill" }} />
  </NativeTabs.Trigger>
  {/* ... */}
</NativeTabs>;
```

### 画面構成

**タブナビゲーション（app/(tabs)/）:**

- `index.tsx`: **ホーム画面**
  - 統計カード（全TODO、完了、未完了、達成率）
  - 今日のTODO
  - 期限が近いTODO（7日以内）
  - 最近追加したTODO
  - Pull-to-refresh対応

- `todos.tsx`: **TODO一覧画面**
  - フィルタリング（すべて、未着手、進行中、完了）
  - ソート（期限順、優先度順、作成日順）
  - FAB（Floating Action Button）で新規作成

- `search/`: **検索画面**（Stack navigator内）
  - `_layout.tsx`: Stack navigatorのレイアウト
  - `index.tsx`: 検索画面本体
  - **iOS**: `headerSearchBarOptions`でタブバー内検索フィールド
  - **Android**: カスタム検索バー
  - FTS5による全文検索（タイトル・説明）
  - リアルタイム検索結果表示

- `settings.tsx`: **設定画面**
  - カテゴリ管理へのリンク
  - カテゴリ別統計表示
  - アプリ情報

**その他の画面（app/）:**

- `todo/[id].tsx`: **TODO詳細/編集画面**
  - TODO作成・編集フォーム
  - タイトル、説明、ステータス、優先度、カテゴリ、期限設定
  - サブタスク表示
  - 削除機能

- `categories.tsx`: **カテゴリ管理画面**
  - カテゴリ一覧、作成、編集、削除
  - カラーピッカー（16色のプリセット）
  - プレビュー機能

### 開発用機能

**ダミーデータ（utils/seed-data.ts）:**

- `seedData()`: カテゴリとTODOのダミーデータを挿入
- 4つのカテゴリ（仕事、個人、買い物、趣味）
- 10件のサンプルTODO

**DevTools（components/DevTools.tsx）:**

- 開発モード（`__DEV__`）でのみ表示
- ダミーデータ挿入ボタン
- ホーム画面左下に表示

### 使用例

```typescript
// TODO作成
const { create } = useTodos();
await create({
  title: "新しいタスク",
  description: "詳細な説明",
  priority: "high",
  status: "pending",
  categoryId: 1,
  dueDate: new Date().toISOString(),
  // ...
});

// 全文検索
const { search, results } = useSearchTodos();
await search("プロジェクト");

// カテゴリ作成
const { create } = useCategories();
await create({
  name: "仕事",
  color: "#2196F3",
  icon: "briefcase",
  sortOrder: 0,
});
```

### 今後の拡張予定

- expo-ui の DateTimePicker 使用（現在はプレースホルダー）
- expo-notifications によるリマインダー機能
- 繰り返しタスクの完全実装
- サブタスクの追加・編集UI
- 添付ファイル対応
- エクスポート/インポート機能
- ダークモード対応強化
