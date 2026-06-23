import { LoginForm } from './LoginForm';
import { Illustration } from '@/components/Illustration';

export default function LoginPage({ searchParams }: { searchParams: { from?: string } }) {
  const from = searchParams.from || '';

  return (
    <div className="login-page">
      <div className="login-page__art illus-wrap anim anim--1">
        <Illustration name="hero" className="login-page__illus" priority />
      </div>
      <div className="login-card">
        <div className="brand brand--large">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12h15M16 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="brand__name">LogiDesk</span>
            <span className="brand__sub">拠点間配送</span>
          </span>
        </div>
        <p className="login-subtitle">拠点間配送システムへログイン</p>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
