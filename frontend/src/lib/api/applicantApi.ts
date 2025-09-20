import type { ApplicantDataFormType, ApplicantDataType } from '@/types/applicant.type';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

export const getApplications = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<ApplicantDataType>> => {
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
    `${baseApiUrl}/applications?${searchParams.toString()}`
  );
  return response.json();
};

export const getApplicationById = async (
  id: string
): Promise<DefaultResponseType<ApplicantDataType>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/applications/${id}`);
  return response.json();
};

export const updateApplication = async (
  id: string,
  data: Partial<ApplicantDataFormType>
): Promise<DefaultResponseType<ApplicantDataType>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteApplication = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/applications/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
