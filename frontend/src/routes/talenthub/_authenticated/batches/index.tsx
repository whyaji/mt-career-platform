import { createFileRoute } from '@tanstack/react-router';

import { BatchesListScreen } from '@/feature/talenthub/screen/batches/screen/BatchesListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/batches/')({
  component: BatchesListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
