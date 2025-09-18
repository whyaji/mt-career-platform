import { createFileRoute, redirect } from '@tanstack/react-router';

import TalentHubDashboardScreen from '@/feature/talenthub/screen/dashboard/screen/TalentHubDashboardScreen';

export const Route = createFileRoute('/talenthub/_authenticated/dashboard/')({
  beforeLoad: () => {
    if (!localStorage.getItem('access_token')) {
      return redirect({ to: '/talenthub/login' });
    }
  },
  component: TalentHubDashboardScreen,
});
