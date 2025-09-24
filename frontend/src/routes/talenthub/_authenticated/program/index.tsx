import { createFileRoute } from '@tanstack/react-router';

import { ProgramListScreen } from '@/feature/talenthub/screen/program/screen/ProgramListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/program/')({
  component: ProgramListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
