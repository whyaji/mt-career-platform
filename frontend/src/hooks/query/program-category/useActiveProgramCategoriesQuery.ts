import { useQuery } from '@tanstack/react-query';

import { getActiveProgramCategories } from '@/lib/api/programCategoryApi';

export const useActiveProgramCategoriesQuery = () => {
  return useQuery({
    queryKey: ['program-categories', 'active'],
    queryFn: () => getActiveProgramCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
