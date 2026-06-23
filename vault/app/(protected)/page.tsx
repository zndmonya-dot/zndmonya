import dynamic from 'next/dynamic';
import { SiteHeader } from '@/components/SiteHeader';

const FileHub = dynamic(
  () => import('@/components/FileHub').then((m) => m.FileHub),
  { loading: () => <div className="empty">読み込み中...</div> },
);

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div className="shell">
        <FileHub />
      </div>
    </>
  );
}
