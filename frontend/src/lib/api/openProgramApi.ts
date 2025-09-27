import type { BatchType } from '@/types/batch.type';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';

import { authenticatedFetch, baseApiUrl } from './api';

const talentHubOpenProgramUrl = `${baseApiUrl}/talenthub/open-program`;

export const getOpenPrograms = async (
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
    `${talentHubOpenProgramUrl}?${searchParams.toString()}`
  );
  return response.json();
};
