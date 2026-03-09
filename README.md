# Liquid Glass TODO App

iOS 26のLiquid Glassエフェクトに対応した、モダンなTODOアプリケーションです。React Native、Expo、SQLiteを使用して構築されています。

## ✨ 特徴

- 🎨 **iOS 26 Liquid Glassエフェクト** - Native Tabsによる美しいガラス効果のタブバー
- 🔍 **全文検索** - SQLite FTS5による高速な全文検索
- 📱 **クロスプラットフォーム** - iOS、Android、Webに対応
- ⚡ **高性能** - React Native New Architectureによる高速レンダリング
- 🎯 **タスク管理** - 優先度、ステータス、カテゴリ、期限による管理
- 📊 **統計表示** - タスクの達成率や進捗状況を可視化
- 🏷️ **カテゴリ管理** - カラフルなカテゴリでタスクを整理
- 🔄 **リアルタイム更新** - データベース変更の即座な反映

## 🛠️ 技術スタック

- **フレームワーク**: React 19.2 + React Native 0.83.2 + TypeScript 5.9
- **開発プラットフォーム**: Expo SDK 55
- **ルーティング**: Expo Router 7（ファイルベースルーティング）
- **タブナビゲーション**: Native Tabs（iOS Liquid Glass対応）
- **データベース**: expo-sqlite（SQLite with FTS5）
- **状態管理**: TanStack Query
- **UI**: @expo/ui 55（SwiftUI BETA / Jetpack Compose BETA）
- **アニメーション**: React Native Reanimated 4
- **パッケージマネージャー**: Bun

## 📋 必要環境

- Node.js 18以降
- Bun（推奨）または npm
- iOS開発の場合: Xcode 15以降、macOS
- Android開発の場合: Android Studio
- Expo CLI

> **Note**: Expo SDK 55ではNew Architectureが常に有効（無効化不可）です。

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/kazutoyo/liquid-glass-todo-sample.git
cd liquid-glass-todo-sample
```

### 2. 依存関係のインストール

```bash
bun install
# または
npm install
```

### 3. 開発サーバーの起動

```bash
# 開発モード選択画面を表示
bun start

# または特定のプラットフォームで起動
bun run ios       # iOSシミュレータで起動
bun run android   # Androidエミュレータで起動
bun run web       # Webブラウザで起動
```

## 📱 主な機能

### ホーム画面
- タスクの統計情報（全TODO、完了、未完了、達成率）
- 今日のTODO一覧
- 期限が近いTODO（7日以内）
- 最近追加したTODO
- Pull-to-refresh対応

### TODO一覧画面
- フィルタリング（すべて、未着手、進行中、完了）
- ソート（期限順、優先度順、作成日順）
- FAB（Floating Action Button）で新規作成

### 検索画面
- FTS5による高速な全文検索（タイトル・説明）
- リアルタイム検索結果表示
- iOS: タブバー内検索フィールド（`role="search"` タブ）
- Android: カスタム検索バー

### TODO詳細/編集画面
- タイトル、説明、ステータス、優先度、カテゴリ、期限の設定
- サブタスク表示
- 削除機能（`Stack.Toolbar` によるヘッダーボタン）

### カテゴリ管理画面
- カテゴリの作成、編集、削除
- カラーピッカー（16色のプリセット）
- アイコン選択
- プレビュー機能

### 設定画面
- カテゴリ管理へのリンク
- カテゴリ別統計表示
- アプリ情報

## 🎯 データベース構造

### todos テーブル
- `id`: 主キー
- `title`: タイトル（必須）
- `description`: 説明
- `dueDate`: 期限
- `priority`: 優先度（low, medium, high）
- `status`: ステータス（pending, in_progress, completed）
- `categoryId`: カテゴリID
- `tags`: タグ（JSON配列）
- `isRecurring`: 繰り返しフラグ
- `parentId`: 親TODO ID（サブタスク用）
- その他のメタデータ

### categories テーブル
- `id`: 主キー
- `name`: カテゴリ名
- `color`: カラーコード
- `icon`: アイコン名
- `sortOrder`: 並び順

### todos_fts テーブル（FTS5仮想テーブル）
- タイトルと説明の全文検索用

## 🏗️ プロジェクト構造

```
.
├── app/                    # Expo Routerのルート
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── index.tsx      # ホーム画面
│   │   ├── todos/         # TODO一覧
│   │   ├── search/        # 検索画面
│   │   └── settings.tsx   # 設定画面
│   ├── todo/[id].tsx      # TODO詳細/編集
│   ├── categories.tsx     # カテゴリ管理
│   └── _layout.tsx        # ルートレイアウト
├── components/            # 再利用可能なコンポーネント
├── constants/             # 定数（色、テーマなど）
├── db/                    # データベース操作
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
└── utils/                 # ユーティリティ関数
```

## 🔧 開発

### TypeScript

- Strictモード有効
- パスエイリアス: `@/*` → プロジェクトルート

### コーディング規約

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。
