import { useQuery } from '@tanstack/react-query';

import { getScreeningApplicantsByStatus } from '@/lib/api/screeningApplicantApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useScreeningApplicantsByStatusQuery = (
  status: number,
  params: PaginationParams = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['screening-applicants', 'status', status, params],
    queryFn: () => getScreeningApplicantsByStatus(status, params),
    enabled: enabled && status !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
