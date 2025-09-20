import { useQuery } from '@tanstack/react-query';

import { getApplicationById } from '@/lib/api/applicantApi';

export const useGetApplicationByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
