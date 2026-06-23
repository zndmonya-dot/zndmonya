import Link from 'next/link';

export function LegalLayout({ title, meta, children }: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="prose-page min-h-screen bg-background">
      <p><Link href="/login" className="text-sm text-primary">← ログインへ</Link></p>
      <h1>{title}</h1>
      {meta && <p className="meta">{meta}</p>}
      {children}
    </div>
  );
}
