import type { BatchType } from '@/types/batch.type';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

const talentHubBatchUrl = `${baseApiUrl}/talenthub/batch`;

export const getActiveBatches = async (): Promise<DefaultResponseType<BatchType[]>> => {
  const response = await fetch(`${baseApiUrl}/batch/active`);
  return response.json();
};

export const getBatches = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<BatchType>> => {
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
    `${baseApiUrl}/talenthub/batch?${searchParams.toString()}`
  );
  return response.json();
};

export const getBatchById = async (id: string): Promise<DefaultResponseType<BatchType>> => {
  const response = await authenticatedFetch(`${talentHubBatchUrl}/${id}`);
  return response.json();
};

export const createBatch = async (
  data: Omit<BatchType, 'id'>
): Promise<DefaultResponseType<BatchType>> => {
  const response = await authenticatedFetch(`${talentHubBatchUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateBatch = async (
  id: string,
  data: Partial<Omit<BatchType, 'id'>>
): Promise<DefaultResponseType<BatchType>> => {
  const response = await authenticatedFetch(`${talentHubBatchUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteBatch = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${talentHubBatchUrl}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
