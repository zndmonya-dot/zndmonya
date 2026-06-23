'use client';

import { useFormState } from 'react-dom';
import { loginAction } from './actions';

export function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useFormState(loginAction, { error: '' });

  return (
    <form action={formAction}>
      <input type="hidden" name="from" value={from} />
      <label className="label" htmlFor="password">パスワード</label>
      <input type="password" id="password" name="password" autoComplete="current-password" required />
      <div style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn-primary">ログイン</button>
      </div>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  );
}
