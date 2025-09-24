import { createFileRoute } from '@tanstack/react-router';

import { QuestionsListScreen } from '@/feature/talenthub/screen/questions/screen/QuestionsListScreen';
import { defaultPaginationSearchSchema } from '@/types/pagination.type';

export const Route = createFileRoute('/talenthub/_authenticated/questions/')({
  component: QuestionsListScreen,
  validateSearch: defaultPaginationSearchSchema,
});
