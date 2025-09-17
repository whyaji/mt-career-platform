import { createFileRoute } from '@tanstack/react-router';

import TalentHubDashboardScreen from '@/feature/talenthub/screen/dashboard/screen/TalentHubDashboardScreen';

export const Route = createFileRoute('/talenthub/_authenticated/dashboard/')({
  component: TalentHubDashboardScreen,
});
