import type { PaginatedResponse, PaginationParams } from '@/types/pagination.type';
import type {
  QuestionFormData,
  QuestionType,
  QuestionTypesResponse,
  ValidationRulesResponse,
} from '@/types/question.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

const talentHubQuestionUrl = `${baseApiUrl}/talenthub/question`;

// Question CRUD operations
export const getActiveQuestions = async (): Promise<DefaultResponseType<QuestionType[]>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/active`);
  return response.json();
};

export const getQuestions = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<QuestionType>> => {
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

  const response = await authenticatedFetch(`${talentHubQuestionUrl}?${searchParams.toString()}`);
  return response.json();
};

export const getQuestionById = async (id: string): Promise<DefaultResponseType<QuestionType>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/${id}`);
  return response.json();
};

export const getQuestionByCode = async (
  code: string
): Promise<DefaultResponseType<QuestionType>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/code/${code}`);
  return response.json();
};

export const createQuestion = async (
  data: QuestionFormData
): Promise<DefaultResponseType<QuestionType>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateQuestion = async (
  id: string,
  data: Partial<QuestionFormData>
): Promise<DefaultResponseType<QuestionType>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteQuestion = async (id: string): Promise<DefaultResponseType<void>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const duplicateQuestion = async (
  id: string,
  newCode?: string
): Promise<DefaultResponseType<QuestionType>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/${id}/duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: newCode }),
  });
  return response.json();
};

// Question metadata
export const getQuestionTypes = async (): Promise<DefaultResponseType<QuestionTypesResponse>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/types`);
  return response.json();
};

export const getValidationRules = async (): Promise<
  DefaultResponseType<ValidationRulesResponse>
> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/validation-rules`);
  return response.json();
};

export const getCommonValidationRules = async (): Promise<
  DefaultResponseType<
    Array<{
      rule: string;
      value: string;
      message: string;
      description: string;
    }>
  >
> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/common-validation-rules`);
  return response.json();
};

export const getIcons = async (): Promise<DefaultResponseType<Record<string, string>>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/icons`);
  return response.json();
};

export const getQuestionsByGroup = async (
  group: string
): Promise<DefaultResponseType<QuestionType[]>> => {
  const response = await authenticatedFetch(`${talentHubQuestionUrl}/group/${group}`);
  return response.json();
};
