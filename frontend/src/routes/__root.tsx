import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import type { AuthState } from '@/lib/auth';

interface MyRouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      {/* <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
    </>
  ),
});
