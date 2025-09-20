import { useQuery } from '@tanstack/react-query';

import { getActiveEducationalInstitutions } from '@/lib/api/educationalInstitutionApi';

export const useActiveEducationalInstitutionsQuery = () => {
  return useQuery({
    queryKey: ['activeEducationalInstitutions'],
    queryFn: getActiveEducationalInstitutions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
