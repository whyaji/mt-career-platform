import { createFileRoute } from '@tanstack/react-router';

import { OpenProgramListScreen } from '@/feature/talenthub/screen/open-program/screen/OpenProgramListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/open-programs/')({
  component: OpenProgramListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
