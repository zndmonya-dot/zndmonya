# zndmonya

**非公開のファイルやり取りサイト**です。

## 概要

| 項目 | 内容 |
|------|------|
| 用途 | 自宅PCからアップロード → 社内PCからダウンロード |
| 公開範囲 | **非公開**（パスワード認証必須） |
| デプロイ | Vercel · ドメイン `zndmonya.com` |

## 起動

```bash
cp .env.example .env.local
npm install
npm run dev:clean
```

## ページ構成

| パス | 認証 | 内容 |
|------|------|------|
| `/login` | 不要 | ログイン |
| `/` | 必要 | ホーム（アップロード + ダウンロード） |
| `/privacy` `/terms` `/support` | 不要 | 法的ページ（App Store 用） |

## Vercel デプロイ

Root Directory は **空（リポジトリ直下）** のままで OK です。
環境変数 `VAULT_PASSWORD` / `SESSION_SECRET` / `BLOB_READ_WRITE_TOKEN` を設定してください。

詳細: [SPEC.md](SPEC.md)
