import { useQuery } from '@tanstack/react-query';

import { getEducationalInstitutionById } from '@/lib/api/educationalInstitutionApi';

export const useGetEducationalInstitutionByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['educationalInstitution', id],
    queryFn: () => getEducationalInstitutionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
