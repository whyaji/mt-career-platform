import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBatch } from '@/lib/api/batchApi';

export const useDeleteBatchQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBatch(id),
    onSuccess: () => {
      // Invalidate and refetch batches list
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};
