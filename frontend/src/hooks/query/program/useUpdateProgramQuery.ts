import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProgram } from '@/lib/api/programApi';
import type { ProgramType } from '@/types/program.type';

export const useUpdateProgramQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<
        Omit<ProgramType, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'program_category'>
      >;
    }) => updateProgram(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch programs list and specific program
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', id] });
    },
  });
};
