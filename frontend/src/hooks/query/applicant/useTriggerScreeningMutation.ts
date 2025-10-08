import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { triggerScreening } from '@/lib/api/applicantApi';

export function useTriggerScreeningMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => triggerScreening(applicationId),
    onSuccess: (_, applicationId) => {
      notifications.show({
        title: 'Screening Started',
        message: 'Screening process has been triggered successfully.',
        color: 'blue',
      });

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
    onError: () => {
      notifications.show({
        title: 'Screening Failed',
        message: 'Failed to trigger screening. Please try again.',
        color: 'red',
      });
    },
  });
}
