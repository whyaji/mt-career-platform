import { createFileRoute } from '@tanstack/react-router';

import { ProgramCategoryListScreen } from '@/feature/talenthub/screen/program-category/screen/ProgramCategoryListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/program-category/')({
  component: ProgramCategoryListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
