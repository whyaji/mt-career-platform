import { createFileRoute } from '@tanstack/react-router';

import { LoginScreen } from '@/feature/talenthub/screen/login/screen/LoginScreen';

export const Route = createFileRoute('/talenthub/login/')({
  component: LoginScreen,
});
