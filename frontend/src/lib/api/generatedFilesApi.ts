import { authenticatedFetch, baseApiUrl } from './api';

const talentHubGeneratedFilesUrl = `${baseApiUrl}/talenthub/generated-files`;

export interface GlobalGeneratedFile {
  id: string;
  type: string;
  model_type: string;
  model_id: string;
  ext: string;
  request_at: string;
  created_at: string;
  updated_at: string;
  is_ready: boolean;
  download_url?: string;
  file_size?: number;
}

export interface GeneratedFilesListParams {
  filters?: {
    type?: string;
    model_type?: string;
    model_id?: string;
    ext?: string;
    date_from?: string;
    date_to?: string;
    is_ready?: boolean;
    search?: string;
  };
  pagination?: {
    page: number;
    per_page: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface GeneratedFilesListResponse {
  success: boolean;
  data: GlobalGeneratedFile[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
  message: string;
}

export interface GeneratedFilesStatsResponse {
  success: boolean;
  data: {
    total_files: number;
    ready_files: number;
    pending_files: number;
    total_size: number;
    total_size_formatted: string;
    by_type: Record<string, number>;
    by_model_type: Record<string, number>;
    by_extension: Record<string, number>;
    created_today: number;
    created_this_week: number;
    created_this_month: number;
  };
  message: string;
}

// Get list of generated files
export const getGlobalGeneratedFiles = async (
  params: GeneratedFilesListParams = {}
): Promise<GeneratedFilesListResponse> => {
  const response = await authenticatedFetch(`${talentHubGeneratedFilesUrl}/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return response.json();
};

// Get status of multiple files
export const getGlobalGeneratedFilesStatus = async (
  fileIds: string[]
): Promise<{ success: boolean; data: GlobalGeneratedFile[]; message: string }> => {
  const response = await authenticatedFetch(`${talentHubGeneratedFilesUrl}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_ids: fileIds }),
  });
  return response.json();
};

// Get statistics
export const getGlobalGeneratedFilesStats = async (
  filters: GeneratedFilesListParams['filters'] = {}
): Promise<GeneratedFilesStatsResponse> => {
  const response = await authenticatedFetch(`${talentHubGeneratedFilesUrl}/stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filters }),
  });
  return response.json();
};

// Download files
export const downloadGlobalGeneratedFiles = async (fileIds: string[]): Promise<Blob> => {
  const response = await authenticatedFetch(`${talentHubGeneratedFilesUrl}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_ids: fileIds }),
  });
  return response.blob();
};

// Delete files
export const deleteGlobalGeneratedFiles = async (
  fileIds: string[]
): Promise<{
  success: boolean;
  data: { deleted_count: number; not_found_count: number };
  message: string;
}> => {
  const response = await authenticatedFetch(talentHubGeneratedFilesUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_ids: fileIds }),
  });
  return response.json();
};
