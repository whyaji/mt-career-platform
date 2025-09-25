import type { BatchType } from '@/types/batch.type';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';
import type {
  BatchFormConfiguration,
  BatchQuestionType,
  QuestionType,
} from '@/types/question.type';

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

// Batch Question operations
export const getBatchQuestions = async (
  batchId: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<BatchQuestionType>> => {
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
    `${talentHubBatchUrl}/${batchId}/questions?${searchParams.toString()}`
  );
  return response.json();
};

export const getBatchQuestionById = async (
  batchId: string,
  questionId: string
): Promise<DefaultResponseType<BatchQuestionType>> => {
  const response = await authenticatedFetch(
    `${talentHubBatchUrl}/${batchId}/questions/${questionId}`
  );
  return response.json();
};

export const getAvailableQuestionsForBatch = async (
  batchId: string
): Promise<DefaultResponseType<QuestionType[]>> => {
  const response = await authenticatedFetch(
    `${talentHubBatchUrl}/${batchId}/questions-list/available`
  );
  return response.json();
};

export const getBatchFormConfiguration = async (
  batchId: string
): Promise<DefaultResponseType<BatchFormConfiguration>> => {
  const response = await authenticatedFetch(`${talentHubBatchUrl}/${batchId}/form-configuration`);
  return response.json();
};

// Bulk operations for batch questions
export interface BulkBatchQuestionOperation {
  question_id: string;
  info: 'create' | 'update' | 'delete';
  display_order?: number;
  is_required?: boolean;
  is_active?: boolean;
  batch_specific_options?: unknown;
  batch_specific_validation?: unknown;
  batch_specific_scoring?: unknown;
}

export interface BulkBatchQuestionResponse {
  batch_id: string;
  total_processed: number;
  created_count: number;
  updated_count: number;
  deleted_count: number;
  error_count: number;
  created_questions: BatchQuestionType[];
  updated_questions: BatchQuestionType[];
  deleted_questions: Array<{ question_id: string; batch_id: string }>;
  errors: Array<{
    index: number;
    question_id: string | null;
    operation: string | null;
    error: string;
  }>;
}

export const bulkBatchQuestionOperations = async (
  batchId: string,
  operations: BulkBatchQuestionOperation[]
): Promise<DefaultResponseType<BulkBatchQuestionResponse>> => {
  const response = await authenticatedFetch(
    `${talentHubBatchUrl}/${batchId}/questions-list/bulk-operations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions: operations }),
    }
  );
  return response.json();
};
