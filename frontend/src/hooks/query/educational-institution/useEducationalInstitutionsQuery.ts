import { useQuery } from '@tanstack/react-query';

import { getEducationalInstitutions } from '@/lib/api/educationalInstitutionApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useEducationalInstitutionsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['educationalInstitutions', params],
    queryFn: () => getEducationalInstitutions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
