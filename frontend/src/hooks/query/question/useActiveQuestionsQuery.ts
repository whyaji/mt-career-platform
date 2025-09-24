import { useQuery } from '@tanstack/react-query';

import { getActiveQuestions } from '@/lib/api/questionApi';

export const useActiveQuestionsQuery = () => {
  return useQuery({
    queryKey: ['questions', 'active'],
    queryFn: getActiveQuestions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
