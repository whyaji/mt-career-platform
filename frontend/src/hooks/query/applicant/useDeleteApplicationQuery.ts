import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteApplication } from '@/lib/api/applicantApi';

export const useDeleteApplicationQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => {
      // Invalidate and refetch applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};
