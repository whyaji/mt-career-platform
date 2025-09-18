import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';
import { userQueryOptions } from '@/lib/api/authApi';
import { useUserStore } from '@/lib/store/userStore';

export const Route = createFileRoute('/talenthub/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const queryClient = context.queryClient;
    let userData = null;
    // Check if we have a token first
    const token = localStorage.getItem('access_token');
    if (!token) {
      return { userData: null, location: location.href };
    }

    try {
      const result = await queryClient.fetchQuery(userQueryOptions);
      if (result.success && 'data' in result && result.data) {
        userData = result.data;
      }
      return { userData, location: location.href };
    } catch (error) {
      return { userData: null, location: location.href };
    }
  },
  component: AuthenticatedLayout,
  notFoundComponent: NotFoundScreenComponent,
});

function AuthenticatedLayout() {
  const { userData: userDataFromContext, location } = Route.useRouteContext();
  const { user, setUser, clearUser } = useUserStore();
  const navigate = useNavigate();

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;

      // If we have user data from context (from beforeLoad), use it
      if (userDataFromContext) {
        setUser(userDataFromContext.user);
      }
      // If we don't have user data from context and no user in store, redirect to login
      else if (!user) {
        clearUser();
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate({
          to: '/talenthub/login',
          search: {
            redirect: location,
          },
        });
      }
    }
  }, [user, userDataFromContext]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
