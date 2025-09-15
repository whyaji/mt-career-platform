import { createFileRoute } from '@tanstack/react-router';

import HomeScreen from '@/feature/home/screen/HomeScreen';

export const Route = createFileRoute('/')({
  component: HomeScreen,
});
