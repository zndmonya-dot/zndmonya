# zndmonya

**非公開のファイルやり取りサイト**です。`vault/` がメインのホームページになります。

## 概要

| 項目 | 内容 |
|------|------|
| 用途 | 自宅PCからアップロード → 社内PCからダウンロード |
| 公開範囲 | **非公開**（パスワード認証必須） |
| デプロイ | Vercel · Root Directory = `vault` · ドメイン `zndmonya.com` |

## 起動

```bash
cd vault
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

## 旧ポートフォリオ

旧静的サイト（`zndmonya/`）は削除済みです。Vercel の Root Directory を `vault` に設定してください。

詳細: [vault/SPEC.md](vault/SPEC.md)
