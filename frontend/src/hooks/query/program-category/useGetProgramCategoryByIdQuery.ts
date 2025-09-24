import { useQuery } from '@tanstack/react-query';

import { getProgramCategoryById } from '@/lib/api/programCategoryApi';

export const useGetProgramCategoryByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['program-category', id],
    queryFn: () => getProgramCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
