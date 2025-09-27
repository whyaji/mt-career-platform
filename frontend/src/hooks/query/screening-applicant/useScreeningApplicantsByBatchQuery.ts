import { useQuery } from '@tanstack/react-query';

import { getScreeningApplicantsByBatch } from '@/lib/api/screeningApplicantApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useScreeningApplicantsByBatchQuery = (
  batchId: string,
  params: PaginationParams = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['screening-applicants', 'batch', batchId, params],
    queryFn: () => getScreeningApplicantsByBatch(batchId, params),
    enabled: enabled && !!batchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
