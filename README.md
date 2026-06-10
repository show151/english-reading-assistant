# English Reading Assistant

英語長文を効率的に学習するための読解支援 Web アプリです。全文和訳への依存を減らし、**英文を読みながら分からない単語・フレーズだけをタップして確認**する学習体験を提供します。

AI は教材登録時のみ利用し、学習中は保存済みの注釈を辞書のように高速に表示します。

## 主な機能

### 学習者
- メールアドレス＋パスワードでログイン / 新規登録
- 公開教材の一覧・閲覧
- 注釈付き英文の読解（タップで意味・品詞を表示）
- 和訳・要約の表示（デフォルト非表示）
- 学習履歴の記録

### 管理者
- 教材の作成・編集・公開管理
- Gemini による AI 一括解析（和訳・段落要約・注釈抽出）
- 解析結果の手動修正

## 技術スタック

| 区分 | 技術 |
|------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers |
| Database | Supabase (PostgreSQL) |
| Authentication | Auth.js（メール＋パスワード） |
| AI | Google Gemini（教材解析専用） |
| Hosting | Vercel（想定） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.example` を `.env.local` にコピーして値を設定します。

```bash
cp .env.example .env.local
```

| 変数 | 説明 |
|------|------|
| `AUTH_SECRET` | Auth.js 用シークレット（`openssl rand -base64 32` で生成） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role キー |
| `GEMINI_API_KEY` | Google AI Studio の API キー |
| `GEMINI_MODEL` | （任意）優先 Gemini モデル名 |
| `ADMIN_EMAILS` | 管理者メール（カンマ区切り）。このメールで登録すると `admin` 権限になる |

### 3. データベース

Supabase の SQL エディタで、以下のマイグレーションを順に実行します。

```
supabase/migrations/001_initial.sql
supabase/migrations/002_add_password.sql
```

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 5. 初回管理者の作成

1. `.env.local` の `ADMIN_EMAILS` に自分のメールアドレスを設定
2. 開発サーバーを再起動
3. `/register` からそのメールアドレスで新規登録
4. `/admin` にアクセスして教材を登録

## 使い方

### 管理者フロー

1. `/admin` → **新規登録** で教材を作成（タイトル・本文・レベル・ジャンル）
2. 教材編集画面で **解析開始** をクリック（Gemini が和訳・注釈・要約を生成）
3. 内容を確認・修正し、公開設定を **公開** にして **保存**

> 段落は本文中の空行（`\n\n`）で区切ってください。

### 学習者フロー

1. `/passages` で教材を選択
2. 英文を読み、下線付きの単語・フレーズをタップ
3. 必要なときだけ和訳・要約パネルを開く

## 注釈の色分け

| 種別 | 色 | 説明 |
|------|-----|------|
| `word` | 青 | 単語 |
| `phrase` | 緑 | 熟語・フレーズ |
| `grammar` | 赤 | 文法 |
| `structure` | 紫 | 構文 |

定義場所: `src/lib/annotations.ts` の `ANNOTATION_COLORS`

## レスポンシブ対応

| 画面幅 | レイアウト |
|--------|-----------|
| PC（`xl` 以上） | 左: 教材一覧 / 中央: 英文 / 右: 和訳・注釈 |
| スマホ・タブレット | 上: 英文 / 下: 和訳・注釈パネル（☰ メニューで教材一覧） |

## プロジェクト構成

```
src/
├── app/
│   ├── login/              # ログイン
│   ├── register/           # 新規登録
│   ├── passages/           # 学習画面
│   ├── admin/              # 管理画面
│   └── api/                # API Routes
├── components/
│   ├── reading/            # 読解 UI（注釈・和訳パネル等）
│   ├── admin/              # 管理 UI
│   └── auth/               # 認証フォーム
└── lib/
    ├── gemini.ts           # AI 解析（教材登録時のみ）
    ├── annotations.ts      # 注釈ハイライト・位置解決
    ├── passages.ts         # 教材 CRUD
    └── users.ts            # ユーザー管理
supabase/migrations/        # DB スキーマ
```

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| `POST` | `/api/auth/register` | 新規ユーザー登録 |
| `GET/POST` | `/api/passages` | 教材一覧 / 作成（管理者） |
| `GET/PATCH` | `/api/passages/[id]` | 教材取得 / 更新 |
| `POST` | `/api/passages/[id]/analyze` | AI 解析（管理者） |
| `GET/POST` | `/api/study-history` | 学習履歴 |

## 本番デプロイ（Vercel）

1. GitHub リポジトリを Vercel に接続
2. 環境変数を Vercel ダッシュボードに設定
3. デプロイ

```bash
npm run build   # ローカルビルド確認
npm run start   # 本番モード起動
```

## AI 利用方針

- **学習中は AI を呼ばない** — 注釈・和訳はすべて DB から取得
- **教材登録時に 1 回だけ** Gemini で解析
- 503 混雑時は自動リトライ＋フォールバックモデルに切り替え

## ライセンス

Private（未設定）
