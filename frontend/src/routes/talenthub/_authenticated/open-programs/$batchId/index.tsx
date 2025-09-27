import { createFileRoute } from '@tanstack/react-router';

import { ScreeningApplicantListScreen } from '@/feature/talenthub/screen/open-program/screen/ScreeningApplicantListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/open-programs/$batchId/')({
  component: ScreeningApplicantListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
