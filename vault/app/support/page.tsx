import { LegalLayout } from '@/components/LegalLayout';

export default function SupportPage() {
  return (
    <LegalLayout title="お問い合わせ" meta="App Support">
      <p>アプリケーションに関するお問い合わせは、以下より受け付けております。</p>
      <h2>Contact</h2>
      <p><a href="mailto:zndmonya@gmail.com"><strong>zndmonya@gmail.com</strong></a></p>
      <p>※ 原則として24時間以内に返信いたします。</p>
      <h2>FAQ</h2>
      <p><strong>Q. アプリが起動しない</strong><br />App Storeより最新バージョンへのアップデートをお試しください。</p>
      <p><strong>Q. 返信が届かない</strong><br />迷惑メールフォルダに振り分けられている可能性があります。</p>
    </LegalLayout>
  );
}
