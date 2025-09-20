import { createFileRoute } from '@tanstack/react-router';

import { EducationalInstitutionsListScreen } from '@/feature/talenthub/screen/educational-institutions/screen/EducationalInstitutionsListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/educational-institution/')({
  component: EducationalInstitutionsListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
