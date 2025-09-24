import { useQuery } from '@tanstack/react-query';

import { getPrograms } from '@/lib/api/programApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useProgramsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['programs', params],
    queryFn: () => getPrograms(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
