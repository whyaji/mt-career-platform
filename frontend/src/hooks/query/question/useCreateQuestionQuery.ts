import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createQuestion } from '@/lib/api/questionApi';
import type { QuestionFormData } from '@/types/question.type';

export const useCreateQuestionQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionFormData) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};
