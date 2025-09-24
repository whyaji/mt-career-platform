import { useQuery } from '@tanstack/react-query';

import { getQuestions } from '@/lib/api/questionApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useQuestionsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: () => getQuestions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
