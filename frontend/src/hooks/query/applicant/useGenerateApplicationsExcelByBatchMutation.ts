import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateApplicationsExcelByBatch } from '@/lib/api/applicantApi';
import type { PaginationParams } from '@/types/pagination.type';

export function useGenerateApplicationsExcelByBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, filters }: { batchId: string; filters?: PaginationParams }) =>
      generateApplicationsExcelByBatch(batchId, filters),
    onSuccess: (_, { batchId, filters }) => {
      const isFiltered = filters && (filters.search || filters.filter || filters.json_filters);
      const message = isFiltered
        ? 'Your filtered Excel file is being generated. You can check the Files Manager for progress.'
        : 'Your Excel file is being generated. You can check the Files Manager for progress.';

      notifications.show({
        title: 'Excel Generation Started',
        message,
        color: 'blue',
      });

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['global-generated-files-stats'] });
      queryClient.invalidateQueries({ queryKey: ['global-generated-files'] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'batch', batchId] });
    },
    onError: () => {
      notifications.show({
        title: 'Generation Failed',
        message: 'Failed to start Excel generation. Please try again.',
        color: 'red',
      });
    },
  });
}
