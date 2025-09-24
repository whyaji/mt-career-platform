import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type BulkBatchQuestionOperation, bulkBatchQuestionOperations } from '@/lib/api/batchApi';

export function useBulkBatchQuestionOperationsMutation(batchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operations: BulkBatchQuestionOperation[]) =>
      bulkBatchQuestionOperations(batchId, operations),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['batch-questions', batchId],
      });
      queryClient.invalidateQueries({ queryKey: ['batch-questions', batchId] });
      queryClient.invalidateQueries({ queryKey: ['available-questions', batchId] });
    },
  });
}
