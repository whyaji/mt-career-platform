import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteEducationalInstitution } from '@/lib/api/educationalInstitutionApi';

export const useDeleteEducationalInstitutionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEducationalInstitution(id),
    onSuccess: () => {
      // Invalidate and refetch educational institutions list
      queryClient.invalidateQueries({ queryKey: ['educationalInstitutions'] });
    },
  });
};
