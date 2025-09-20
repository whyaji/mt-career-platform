import { useQuery } from '@tanstack/react-query';

import { getApplications } from '@/lib/api/applicantApi';
import type { PaginationParams } from '@/types/pagination.type';

export const useApplicationsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => getApplications(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
