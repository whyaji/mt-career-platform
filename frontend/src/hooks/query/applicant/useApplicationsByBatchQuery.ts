import { useQuery } from '@tanstack/react-query';

import { getApplicationsByBatch } from '@/lib/api/applicantApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useApplicationsByBatchQuery = (
  batchId: string,
  params: PaginationParams = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['applications', 'batch', batchId, params],
    queryFn: () => getApplicationsByBatch(batchId, params),
    enabled: enabled && !!batchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
