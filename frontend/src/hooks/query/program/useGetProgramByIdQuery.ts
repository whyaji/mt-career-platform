import { useQuery } from '@tanstack/react-query';

import { getProgramById } from '@/lib/api/programApi';

export const useGetProgramByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['program', id],
    queryFn: () => getProgramById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
