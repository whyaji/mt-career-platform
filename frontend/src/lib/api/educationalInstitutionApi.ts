import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

const talentHubEducationalInstitutionUrl = `${baseApiUrl}/talenthub/educational-institution`;

export const getActiveEducationalInstitutions = async (): Promise<
  DefaultResponseType<EducationalInstitutionType[]>
> => {
  const response = await authenticatedFetch(`${talentHubEducationalInstitutionUrl}/active`);
  return response.json();
};

export const getEducationalInstitutions = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<EducationalInstitutionType>> => {
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
    `${talentHubEducationalInstitutionUrl}?${searchParams.toString()}`
  );
  return response.json();
};

export const getEducationalInstitutionById = async (
  id: string
): Promise<DefaultResponseType<EducationalInstitutionType>> => {
  const response = await authenticatedFetch(`${talentHubEducationalInstitutionUrl}/${id}`);
  return response.json();
};

export const createEducationalInstitution = async (
  data: Omit<EducationalInstitutionType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<DefaultResponseType<EducationalInstitutionType>> => {
  const response = await authenticatedFetch(`${talentHubEducationalInstitutionUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateEducationalInstitution = async (
  id: string,
  data: Partial<Omit<EducationalInstitutionType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
): Promise<DefaultResponseType<EducationalInstitutionType>> => {
  const response = await authenticatedFetch(`${talentHubEducationalInstitutionUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteEducationalInstitution = async (
  id: string
): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${talentHubEducationalInstitutionUrl}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
