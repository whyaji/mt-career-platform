import { createRootRoute, Outlet } from '@tanstack/react-router';

import { BackgroundLayer } from '@/components/BackgroundLayer';

const RootLayout = () => (
  <BackgroundLayer>
    <Outlet />
  </BackgroundLayer>
);

export const Route = createRootRoute({
  component: RootLayout,
});
