import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateApplication } from '@/lib/api/applicantApi';
import type { ApplicantDataFormType } from '@/types/applicant.type';

export const useUpdateApplicationQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicantDataFormType> }) =>
      updateApplication(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch applications list and specific application
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
    },
  });
};
