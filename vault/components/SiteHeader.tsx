import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export function SiteHeader() {
  return (
    <header className="logi-header">
      <div className="logi-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12h15M16 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="brand__name">LogiDesk</span>
            <span className="brand__sub">ファイル転送センター</span>
          </span>
        </Link>
        <nav className="nav">
          <span className="nav__status">稼働中</span>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
