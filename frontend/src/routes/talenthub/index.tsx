import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/talenthub/')({
  beforeLoad: () => redirect({ to: '/talenthub/dashboard' }),
  component: () => null,
});
