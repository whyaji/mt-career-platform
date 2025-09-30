import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteGlobalGeneratedFiles,
  downloadGlobalGeneratedFiles,
  type GeneratedFilesListParams,
  type GeneratedFilesListResponse,
  type GeneratedFilesStatsResponse,
  getGlobalGeneratedFiles,
  getGlobalGeneratedFilesStats,
  getGlobalGeneratedFilesStatus,
  type GlobalGeneratedFile,
} from '@/lib/api/generatedFilesApi';

// Re-export types for convenience
export type {
  GeneratedFilesListParams,
  GeneratedFilesListResponse,
  GeneratedFilesStatsResponse,
  GlobalGeneratedFile,
};

// Get list of generated files
export function useGlobalGeneratedFilesQuery(
  params: GeneratedFilesListParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: ['global-generated-files', params],
    queryFn: () => getGlobalGeneratedFiles(params),
    enabled, // Auto-trigger when params change
    refetchOnWindowFocus: false,
  });
}

// Get status of multiple files
export function useGlobalGeneratedFilesStatusQuery() {
  return useMutation({
    mutationFn: (fileIds: string[]) => getGlobalGeneratedFilesStatus(fileIds),
  });
}

// Get statistics
export function useGlobalGeneratedFilesStatsQuery(
  params: GeneratedFilesListParams['filters'] = {},
  enabled = true
) {
  return useQuery({
    queryKey: ['global-generated-files-stats', params],
    queryFn: () => getGlobalGeneratedFilesStats(params),
    enabled, // Auto-trigger when params change
    refetchOnWindowFocus: false,
  });
}

// Download files
export function useGlobalGeneratedFilesDownloadMutation() {
  return useMutation({
    mutationFn: (fileIds: string[]) => downloadGlobalGeneratedFiles(fileIds),
    onSuccess: (data, fileIds) => {
      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;

      if (fileIds.length === 1) {
        // Single file - use original filename if available
        link.download = `generated-file-${Date.now()}.xlsx`;
      } else {
        // Multiple files - ZIP
        link.download = `generated-files-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Delete files
export function useGlobalGeneratedFilesDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileIds: string[]) => deleteGlobalGeneratedFiles(fileIds),
    onSuccess: () => {
      // Invalidate all generated files queries
      queryClient.invalidateQueries({ queryKey: ['global-generated-files'] });
      queryClient.invalidateQueries({ queryKey: ['global-generated-files-stats'] });
    },
  });
}
