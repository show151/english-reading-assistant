-- メール＋パスワード認証用
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
