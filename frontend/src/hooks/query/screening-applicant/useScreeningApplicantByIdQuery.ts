import { useQuery } from '@tanstack/react-query';

import { getScreeningApplicantById } from '@/lib/api/screeningApplicantApi';

export const useScreeningApplicantByIdQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['screening-applicant', id],
    queryFn: () => getScreeningApplicantById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
