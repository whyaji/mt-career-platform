import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBatch } from '@/lib/api/batchApi';
import type { BatchType } from '@/types/batch.type';

export const useCreateBatchQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<BatchType, 'id'>) => createBatch(data),
    onSuccess: () => {
      // Invalidate and refetch batches list
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};
