import { useQuery } from '@tanstack/react-query';

import { getBatchApplications } from '@/lib/api/batchApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useBatchApplicationsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['batch-applications', params],
    queryFn: () => getBatchApplications(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
