import { createFileRoute } from '@tanstack/react-router';

import { BackgroundLayer } from '@/components/BackgroundLayer';
import HomeScreen from '@/feature/home/screen/HomeScreen';

const RouteComponent = () => (
  <BackgroundLayer>
    <HomeScreen />
  </BackgroundLayer>
);

export const Route = createFileRoute('/')({
  component: RouteComponent,
});
