import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/talenthub/_authenticated/batches/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/talenthub/_authenticated/batches/"!</div>;
}
