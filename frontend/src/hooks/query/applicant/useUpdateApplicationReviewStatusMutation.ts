import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateApplicationReviewStatus } from '@/lib/api/applicantApi';

export const useUpdateApplicationReviewStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      review_status,
      review_remark,
    }: {
      id: string;
      review_status: number;
      review_remark?: string;
    }) => updateApplicationReviewStatus(id, { review_status, review_remark }),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch applications list and specific application
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
    },
  });
};
