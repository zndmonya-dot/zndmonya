import type { ReactNode } from 'react';

export function PageScene({ children }: { children: ReactNode }) {
  return (
    <div className="vault-scene">
      <div className="vault-scene__grid" aria-hidden />
      <div className="vault-scene__orb vault-scene__orb--a" aria-hidden />
      <div className="vault-scene__orb vault-scene__orb--b" aria-hidden />
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
