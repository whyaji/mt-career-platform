import { useQuery } from '@tanstack/react-query';

import { getProgramCategories } from '@/lib/api/programCategoryApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useProgramCategoriesQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['program-categories', params],
    queryFn: () => getProgramCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
