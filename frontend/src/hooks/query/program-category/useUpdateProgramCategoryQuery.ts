import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProgramCategory } from '@/lib/api/programCategoryApi';
import type { ProgramCategoryType } from '@/types/programCategory.type';

export const useUpdateProgramCategoryQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<ProgramCategoryType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
    }) => updateProgramCategory(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch program categories list and specific program category
      queryClient.invalidateQueries({ queryKey: ['program-categories'] });
      queryClient.invalidateQueries({ queryKey: ['program-category', id] });
    },
  });
};
