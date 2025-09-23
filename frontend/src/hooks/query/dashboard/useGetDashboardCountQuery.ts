import { useQuery } from '@tanstack/react-query';

import { getDashboardCounts } from '@/lib/api/dashboardApi';

export const useGetDashboardCountQuery = () => {
  return useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: () => getDashboardCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
