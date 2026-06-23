import { logoutAction } from '@/app/actions';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit">ログアウト</button>
    </form>
  );
}
