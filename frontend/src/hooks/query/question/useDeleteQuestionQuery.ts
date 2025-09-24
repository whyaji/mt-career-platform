import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteQuestion } from '@/lib/api/questionApi';

export const useDeleteQuestionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};
