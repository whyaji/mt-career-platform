import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppLayout } from '@/components/layout/AppLayout';
import { PendingScreenComponent } from '@/components/PendingScreenComponent';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/talenthub/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // Check if user is authenticated
    if (!context.auth?.isAuthenticated && !context.auth?.isLoading) {
      throw redirect({
        to: '/talenthub/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoading, user, logout } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <PendingScreenComponent />;
  }

  return (
    <AppLayout user={user ? { name: user.name, email: user.email } : undefined} onLogout={logout}>
      <Outlet />
    </AppLayout>
  );
}
