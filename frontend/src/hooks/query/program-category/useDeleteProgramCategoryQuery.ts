import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProgramCategory } from '@/lib/api/programCategoryApi';

export const useDeleteProgramCategoryQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProgramCategory(id),
    onSuccess: () => {
      // Invalidate and refetch program categories list
      queryClient.invalidateQueries({ queryKey: ['program-categories'] });
    },
  });
};
