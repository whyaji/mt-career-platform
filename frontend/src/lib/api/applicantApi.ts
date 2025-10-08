import type { ApplicantDataFormType, ApplicantDataType } from '@/types/applicantData.type';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

const talentHubApplicantUrl = `${baseApiUrl}/talenthub/applications`;

export const getApplications = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<ApplicantDataType>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await authenticatedFetch(`${talentHubApplicantUrl}?${searchParams.toString()}`);
  return response.json();
};

export const getApplicationsByBatch = async (
  batchId: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<ApplicantDataType>> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value.toString());
    }
  });
  const response = await authenticatedFetch(
    `${talentHubApplicantUrl}/batch/${batchId}?${searchParams.toString()}`
  );
  return response.json();
};

export const getApplicationById = async (
  id: string
): Promise<DefaultResponseType<ApplicantDataType>> => {
  const response = await authenticatedFetch(`${talentHubApplicantUrl}/${id}`);
  return response.json();
};

export const updateApplication = async (
  id: string,
  data: Partial<ApplicantDataFormType>
): Promise<DefaultResponseType<ApplicantDataType>> => {
  const response = await authenticatedFetch(`${talentHubApplicantUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteApplication = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${talentHubApplicantUrl}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const updateApplicationReviewStatus = async (
  id: string,
  data: { review_status: number; review_remark?: string }
): Promise<DefaultResponseType<ApplicantDataType>> => {
  const response = await authenticatedFetch(`${talentHubApplicantUrl}/${id}/review-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const generateApplicationsExcel = async (
  filters?: PaginationParams
): Promise<DefaultResponseType<{ generated_file_id: string; status: string }>> => {
  const searchParams = new URLSearchParams();

  // Add filter parameters if provided
  if (filters) {
    if (filters.search) {
      searchParams.append('search', filters.search);
    }
    if (filters.sort_by) {
      searchParams.append('sort_by', filters.sort_by);
    }
    if (filters.order) {
      searchParams.append('order', filters.order);
    }
    if (filters.filter) {
      searchParams.append('filter', filters.filter);
    }
    if (filters.json_filters) {
      searchParams.append('json_filters', filters.json_filters);
    }
  }

  const url = searchParams.toString()
    ? `${talentHubApplicantUrl}/generate-excel?${searchParams.toString()}`
    : `${talentHubApplicantUrl}/generate-excel`;

  const response = await authenticatedFetch(url, {
    method: 'POST',
  });
  return response.json();
};

export const generateApplicationsExcelByBatch = async (
  batchId: string,
  filters?: PaginationParams
): Promise<
  DefaultResponseType<{ generated_file_id: string; batch_id: string; status: string }>
> => {
  const searchParams = new URLSearchParams();

  // Add filter parameters if provided
  if (filters) {
    if (filters.search) {
      searchParams.append('search', filters.search);
    }
    if (filters.sort_by) {
      searchParams.append('sort_by', filters.sort_by);
    }
    if (filters.order) {
      searchParams.append('order', filters.order);
    }
    if (filters.filter) {
      searchParams.append('filter', filters.filter);
    }
    if (filters.json_filters) {
      searchParams.append('json_filters', filters.json_filters);
    }
  }

  const url = searchParams.toString()
    ? `${talentHubApplicantUrl}/batch/${batchId}/generate-excel?${searchParams.toString()}`
    : `${talentHubApplicantUrl}/batch/${batchId}/generate-excel`;

  const response = await authenticatedFetch(url, {
    method: 'POST',
  });
  return response.json();
};

export const triggerScreening = async (
  applicationId: string
): Promise<DefaultResponseType<{ triggered_count: number; total_requested: number }>> => {
  const response = await authenticatedFetch(`${talentHubApplicantUrl}/screening/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ applicant_ids: [applicationId] }),
  });
  return response.json();
};

export const rescreenAllByBatch = async (
  batchId: string,
  statusFilter?: number[]
): Promise<
  DefaultResponseType<{
    triggered_count: number;
    total_found: number;
    batch_id: string;
    filters: { status_filter?: number[] };
  }>
> => {
  const response = await authenticatedFetch(
    `${talentHubApplicantUrl}/screening/rescreen-all-by-batch/${batchId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status_filter: statusFilter }),
    }
  );
  return response.json();
};
