import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProgram } from '@/lib/api/programApi';

export const useDeleteProgramQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: () => {
      // Invalidate and refetch programs list
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
};
