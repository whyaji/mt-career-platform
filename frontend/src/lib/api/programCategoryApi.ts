import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';
import type { ProgramCategoryType } from '@/types/programCategory.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

const talentHubProgramCategoryUrl = `${baseApiUrl}/talenthub/program-category`;

export const getActiveProgramCategories = async (): Promise<
  DefaultResponseType<ProgramCategoryType[]>
> => {
  const response = await authenticatedFetch(`${talentHubProgramCategoryUrl}/active`);
  return response.json();
};

export const getProgramCategories = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<ProgramCategoryType>> => {
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
    `${talentHubProgramCategoryUrl}?${searchParams.toString()}`
  );
  return response.json();
};

export const getProgramCategoryById = async (
  id: string
): Promise<DefaultResponseType<ProgramCategoryType>> => {
  const response = await authenticatedFetch(`${talentHubProgramCategoryUrl}/${id}`);
  return response.json();
};

export const createProgramCategory = async (
  data: Omit<ProgramCategoryType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
): Promise<DefaultResponseType<ProgramCategoryType>> => {
  const response = await authenticatedFetch(`${talentHubProgramCategoryUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateProgramCategory = async (
  id: string,
  data: Partial<Omit<ProgramCategoryType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
): Promise<DefaultResponseType<ProgramCategoryType>> => {
  const response = await authenticatedFetch(`${talentHubProgramCategoryUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteProgramCategory = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${talentHubProgramCategoryUrl}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
