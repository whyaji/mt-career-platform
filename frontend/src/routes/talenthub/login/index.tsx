import { createFileRoute, redirect } from '@tanstack/react-router';

import { LoginScreen } from '@/feature/talenthub/screen/login/screen/LoginScreen';

export const Route = createFileRoute('/talenthub/login/')({
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.auth?.isAuthenticated) {
      throw redirect({
        to: '/talenthub/dashboard',
      });
    }
  },
  component: LoginScreen,
});
