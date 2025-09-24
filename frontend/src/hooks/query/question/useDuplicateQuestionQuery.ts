import { useMutation, useQueryClient } from '@tanstack/react-query';

import { duplicateQuestion } from '@/lib/api/questionApi';

export const useDuplicateQuestionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newCode }: { id: string; newCode?: string }) =>
      duplicateQuestion(id, newCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};
