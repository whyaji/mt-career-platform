import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createEducationalInstitution } from '@/lib/api/educationalInstitutionApi';
import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';

export const useCreateEducationalInstitutionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<EducationalInstitutionType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    ) => createEducationalInstitution(data),
    onSuccess: () => {
      // Invalidate and refetch educational institutions list
      queryClient.invalidateQueries({ queryKey: ['educationalInstitutions'] });
    },
  });
};
