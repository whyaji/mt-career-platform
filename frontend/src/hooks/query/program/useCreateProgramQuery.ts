import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProgram } from '@/lib/api/programApi';
import type { ProgramType } from '@/types/program.type';

export const useCreateProgramQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<
        ProgramType,
        'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'program_category'
      >
    ) => createProgram(data),
    onSuccess: () => {
      // Invalidate and refetch programs list
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
};
