import { useQuery } from '@tanstack/react-query';

import { getOpenPrograms } from '@/lib/api/openProgramApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useOpenProgramsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['open-programs', params],
    queryFn: () => getOpenPrograms(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
