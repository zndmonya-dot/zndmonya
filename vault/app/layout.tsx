import type { Metadata } from 'next';
import { Barlow_Condensed, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const barlow = Barlow_Condensed({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const noto = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'LogiDesk',
  description: '社内物流ポータル',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${barlow.variable} ${noto.variable}`}>
      <body>
        <div className="bg-grid" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
