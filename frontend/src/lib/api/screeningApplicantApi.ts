import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';
import type {
  CreateScreeningApplicantType,
  MarkingScreeningApplicantPayloadType,
  ScreeningApplicantStatsType,
  ScreeningApplicantType,
  UpdateScreeningApplicantType,
} from '@/types/screening-applicant.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

const talentHubScreeningApplicantUrl = `${baseApiUrl}/talenthub/screening-applicant`;

export const getScreeningApplicants = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<ScreeningApplicantType>> => {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.search) {
    searchParams.append('search', params.search);
  }
  if (params.sort_by) {
    searchParams.append('sort_by', params.sort_by);
  }
  if (params.order) {
    searchParams.append('order', params.order);
  }
  if (params.filter) {
    searchParams.append('filter', params.filter);
  }

  const response = await authenticatedFetch(
    `${talentHubScreeningApplicantUrl}?${searchParams.toString()}`
  );
  return response.json();
};

export const getScreeningApplicantById = async (
  id: string
): Promise<DefaultResponseType<ScreeningApplicantType>> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/${id}`);
  return response.json();
};

export const createScreeningApplicant = async (
  data: CreateScreeningApplicantType
): Promise<DefaultResponseType<ScreeningApplicantType>> => {
  const response = await authenticatedFetch(talentHubScreeningApplicantUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateScreeningApplicant = async (
  id: string,
  data: UpdateScreeningApplicantType
): Promise<DefaultResponseType<ScreeningApplicantType>> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteScreeningApplicant = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const getScreeningApplicantsByBatch = async (
  batchId: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<ScreeningApplicantType>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await authenticatedFetch(
    `${talentHubScreeningApplicantUrl}/batch/${batchId}?${searchParams.toString()}`
  );
  return response.json();
};

export const getScreeningApplicantsByStatus = async (
  status: number,
  params: PaginationParams = {}
): Promise<PaginatedResponse<ScreeningApplicantType>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await authenticatedFetch(
    `${talentHubScreeningApplicantUrl}/status/${status}?${searchParams.toString()}`
  );
  return response.json();
};

export const updateScreeningApplicantStatus = async (
  id: string,
  status: number
): Promise<DefaultResponseType<ScreeningApplicantType>> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};

export const getScreeningApplicantStats = async (): Promise<
  DefaultResponseType<ScreeningApplicantStatsType>
> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/stats`);
  return response.json();
};

export const markingScreeningApplicant = async (
  id: string,
  data: MarkingScreeningApplicantPayloadType
): Promise<DefaultResponseType> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/${id}/marking`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const generateScreeningApplicantsExcelByBatch = async (
  batchId: string
): Promise<DefaultResponseType<{ generated_file_id: string; batch_id: string; status: string }>> => {
  const response = await authenticatedFetch(`${talentHubScreeningApplicantUrl}/batch/${batchId}/generate-excel`, {
    method: 'POST',
  });
  return response.json();
};
