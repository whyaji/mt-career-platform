import './index.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { ErrorScreenComponent } from './components/ErrorScreenComponent';
import { NotFoundScreenComponent } from './components/NotFoundScreenComponent';
import { PendingScreenComponent } from './components/PendingScreenComponent';
import { AuthProvider, type AuthState } from './lib/auth';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { theme } from './theme/theme';

// Define the router context type
// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      access_token: null,
    } as AuthState,
  },
  defaultPreload: 'intent',
  defaultErrorComponent: ErrorScreenComponent,
  defaultNotFoundComponent: NotFoundScreenComponent,
  defaultPendingComponent: PendingScreenComponent,
  scrollRestoration: true,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications />
        <AuthProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
