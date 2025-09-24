import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateQuestion } from '@/lib/api/questionApi';
import type { QuestionFormData } from '@/types/question.type';

export const useUpdateQuestionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuestionFormData> }) =>
      updateQuestion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', variables.id] });
    },
  });
};
