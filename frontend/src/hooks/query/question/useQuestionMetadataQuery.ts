import { useQuery } from '@tanstack/react-query';

import {
  getCommonValidationRules,
  getIcons,
  getQuestionsByGroup,
  getQuestionTypes,
  getValidationRules,
} from '@/lib/api/questionApi';

export const useQuestionTypesQuery = () => {
  return useQuery({
    queryKey: ['question', 'types'],
    queryFn: getQuestionTypes,
    staleTime: 30 * 60 * 1000, // 30 minutes (metadata doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useValidationRulesQuery = () => {
  return useQuery({
    queryKey: ['question', 'validation-rules'],
    queryFn: getValidationRules,
    staleTime: 30 * 60 * 1000, // 30 minutes (metadata doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useQuestionsByGroupQuery = (group: string) => {
  return useQuery({
    queryKey: ['questions', 'group', group],
    queryFn: () => getQuestionsByGroup(group),
    enabled: !!group,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCommonValidationRulesQuery = () => {
  return useQuery({
    queryKey: ['question', 'common-validation-rules'],
    queryFn: getCommonValidationRules,
    staleTime: 30 * 60 * 1000, // 30 minutes (metadata doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useIconsQuery = () => {
  return useQuery({
    queryKey: ['question', 'icons'],
    queryFn: getIcons,
    staleTime: 30 * 60 * 1000, // 30 minutes (metadata doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
