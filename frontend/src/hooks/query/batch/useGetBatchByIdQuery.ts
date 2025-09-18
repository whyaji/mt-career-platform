import { useQuery } from '@tanstack/react-query';

import { getBatchById } from '@/lib/api/batchApi';

export const useGetBatchByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatchById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
