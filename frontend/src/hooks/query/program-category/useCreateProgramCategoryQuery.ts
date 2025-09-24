import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProgramCategory } from '@/lib/api/programCategoryApi';
import type { ProgramCategoryType } from '@/types/programCategory.type';

export const useCreateProgramCategoryQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<ProgramCategoryType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    ) => createProgramCategory(data),
    onSuccess: () => {
      // Invalidate and refetch program categories list
      queryClient.invalidateQueries({ queryKey: ['program-categories'] });
    },
  });
};
