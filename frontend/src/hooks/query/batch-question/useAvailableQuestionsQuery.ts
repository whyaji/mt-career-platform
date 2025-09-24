import { useQuery } from '@tanstack/react-query';

import { getAvailableQuestionsForBatch } from '@/lib/api/batchApi';

export const useAvailableQuestionsQuery = (batchId: string) => {
  return useQuery({
    queryKey: ['available-questions', batchId],
    queryFn: () => getAvailableQuestionsForBatch(batchId),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
