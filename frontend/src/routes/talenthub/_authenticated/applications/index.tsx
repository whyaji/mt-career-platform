import { createFileRoute } from '@tanstack/react-router';

import { ApplicationsListScreen } from '@/feature/talenthub/screen/applications/screen/ApplicationsListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/applications/')({
  component: ApplicationsListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
