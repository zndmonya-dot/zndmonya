import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { fontBody } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'ファイル転送サービス（仮）',
  description: 'ファイル転送',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={fontBody.variable}>
      <body className={fontBody.className}>
        {children}
        <Toaster position="bottom-center" theme="light" richColors />
      </body>
    </html>
  );
}
