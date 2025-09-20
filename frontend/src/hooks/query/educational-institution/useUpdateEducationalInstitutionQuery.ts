import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateEducationalInstitution } from '@/lib/api/educationalInstitutionApi';
import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';

export const useUpdateEducationalInstitutionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<
        Omit<EducationalInstitutionType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
      >;
    }) => updateEducationalInstitution(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch educational institutions list and specific institution
      queryClient.invalidateQueries({ queryKey: ['educationalInstitutions'] });
      queryClient.invalidateQueries({ queryKey: ['educationalInstitution', id] });
    },
  });
};
