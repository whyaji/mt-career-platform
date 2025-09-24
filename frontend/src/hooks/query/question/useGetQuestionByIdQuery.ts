import { useQuery } from '@tanstack/react-query';

import { getQuestionById } from '@/lib/api/questionApi';

export const useGetQuestionByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
