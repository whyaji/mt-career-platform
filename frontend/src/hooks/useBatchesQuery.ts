import { useQuery } from '@tanstack/react-query';

import { getBatches } from '@/lib/api/batchApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useBatchesQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => getBatches(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
