import { useQuery } from '@tanstack/react-query';

import { getBatchQuestions } from '@/lib/api/batchApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useBatchQuestionsQuery = (batchId: string, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['batch-questions', batchId, params],
    queryFn: () => getBatchQuestions(batchId, params),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
