import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rescreenAllByBatch } from '@/lib/api/applicantApi';

export function useRescreenAllByBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, statusFilter }: { batchId: string; statusFilter?: number[] }) =>
      rescreenAllByBatch(batchId, statusFilter),
    onSuccess: (data, { batchId }) => {
      const triggeredCount = 'data' in data && data.data ? data.data.triggered_count : 0;
      const totalFound = 'data' in data && data.data ? data.data.total_found : 0;

      notifications.show({
        title: 'Rescreening Started',
        message: `Rescreening triggered for ${triggeredCount} out of ${totalFound} applicant(s).`,
        color: 'blue',
      });

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['applications', 'batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Rescreening Failed',
        message: error.message || 'Failed to trigger rescreening. Please try again.',
        color: 'red',
      });
    },
  });
}
