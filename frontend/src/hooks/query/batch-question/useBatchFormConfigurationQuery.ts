import { useQuery } from '@tanstack/react-query';

import { getBatchFormConfiguration } from '@/lib/api/batchApi';

export const useBatchFormConfigurationQuery = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-form-configuration', batchId],
    queryFn: () => getBatchFormConfiguration(batchId),
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
