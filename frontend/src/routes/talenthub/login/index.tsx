import { createFileRoute, redirect } from '@tanstack/react-router';

import { LoginScreen } from '@/feature/talenthub/screen/login/screen/LoginScreen';

export const Route = createFileRoute('/talenthub/login/')({
  beforeLoad: ({ search }) => {
    if (localStorage.getItem('access_token')) {
      if ('redirect' in search && search.redirect) {
        return redirect({ to: search.redirect as never });
      }
      return redirect({ to: '/talenthub/dashboard' });
    }
  },
  component: LoginScreen,
});
