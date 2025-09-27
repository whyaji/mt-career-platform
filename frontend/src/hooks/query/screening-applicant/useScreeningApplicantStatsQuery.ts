import { useQuery } from '@tanstack/react-query';

import { getScreeningApplicantStats } from '@/lib/api/screeningApplicantApi';

export const useScreeningApplicantStatsQuery = () => {
  return useQuery({
    queryKey: ['screening-applicant-stats'],
    queryFn: () => getScreeningApplicantStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
