import { useQuery } from '@tanstack/react-query';

import { getBatchByIdWithQuestions } from '@/lib/api/batchApi';

export const useGetBatchByIdWithQuestionQuery = (id: string) => {
  return useQuery({
    queryKey: ['batch-with-questions', id],
    queryFn: () => getBatchByIdWithQuestions(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
