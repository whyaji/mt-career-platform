import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateBatch } from '@/lib/api/batchApi';
import type { BatchType } from '@/types/batch.type';

export const useUpdateBatchQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<BatchType, 'id'>> }) =>
      updateBatch(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch batches list and specific batch
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
    },
  });
};
