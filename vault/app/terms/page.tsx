import { LegalLayout } from '@/components/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout title="利用規約" meta="Last updated: 2025-12-12">
      <p>この利用規約は、提供するアプリケーションの利用条件を定めるものです。</p>
      <h2>1. 適用</h2>
      <p>本規約は、利用者と開発者との間の当アプリの利用に関わる一切の関係に適用されるものとします。</p>
      <h2>2. 禁止事項</h2>
      <ul>
        <li>法令または公序良俗に違反する行為</li>
        <li>当アプリの運営を妨害するおそれのある行為</li>
        <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
      </ul>
      <h2>3. 免責事項</h2>
      <p>当アプリの利用により、利用者の端末やデータ等に損害が生じた場合でも、開発者は一切の責任を負わないものとします。</p>
      <h2>4. 準拠法</h2>
      <p>本規約の解釈にあたっては、日本法を準拠法とします。</p>
    </LegalLayout>
  );
}
