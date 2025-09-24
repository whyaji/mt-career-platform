import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';
import type { ProgramType } from '@/types/program.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

export const getActivePrograms = async (): Promise<DefaultResponseType<ProgramType[]>> => {
  const response = await fetch(`${baseApiUrl}/program/active`);
  return response.json();
};

export const getPrograms = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<ProgramType>> => {
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

  const response = await authenticatedFetch(`${baseApiUrl}/program?${searchParams.toString()}`);
  return response.json();
};

export const getProgramById = async (id: string): Promise<DefaultResponseType<ProgramType>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/program/${id}`);
  return response.json();
};

export const createProgram = async (
  data: Omit<ProgramType, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'program_category'>
): Promise<DefaultResponseType<ProgramType>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/program`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateProgram = async (
  id: string,
  data: Partial<Omit<ProgramType, 'id'>>
): Promise<DefaultResponseType<ProgramType>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/program/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteProgram = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${baseApiUrl}/program/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
