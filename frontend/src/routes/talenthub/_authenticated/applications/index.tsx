import { createFileRoute } from '@tanstack/react-router';

import { BatchApplicationListScreen } from '@/feature/talenthub/screen/applications/screen/BatchApplicationListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/applications/')({
  component: BatchApplicationListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
