import { useQuery } from '@tanstack/react-query';

import { getScreeningApplicants } from '@/lib/api/screeningApplicantApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useScreeningApplicantsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['screening-applicants', params],
    queryFn: () => getScreeningApplicants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
