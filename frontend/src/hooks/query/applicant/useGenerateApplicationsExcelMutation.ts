import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateApplicationsExcel } from '@/lib/api/applicantApi';

export function useGenerateApplicationsExcelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateApplicationsExcel(),
    onSuccess: () => {
      notifications.show({
        title: 'Excel Generation Started',
        message:
          'Your Excel file is being generated. You can check the Files Manager for progress.',
        color: 'blue',
      });

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['global-generated-files-stats'] });
      queryClient.invalidateQueries({ queryKey: ['global-generated-files'] });
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
