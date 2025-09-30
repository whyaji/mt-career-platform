import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createScreeningApplicant,
  deleteScreeningApplicant,
  updateScreeningApplicant,
  updateScreeningApplicantStatus,
} from '@/lib/api/screeningApplicantApi';
import type {
  CreateScreeningApplicantType,
  UpdateScreeningApplicantType,
} from '@/types/screening-applicant.type';

export const useCreateScreeningApplicantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScreeningApplicantType) => createScreeningApplicant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['screening-applicant-stats'] });
    },
  });
};

export const useUpdateScreeningApplicantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScreeningApplicantType }) =>
      updateScreeningApplicant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['screening-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['screening-applicant', id] });
      queryClient.invalidateQueries({ queryKey: ['screening-applicant-stats'] });
    },
  });
};

export const useDeleteScreeningApplicantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteScreeningApplicant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['screening-applicant-stats'] });
    },
  });
};

export const useUpdateScreeningApplicantStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      updateScreeningApplicantStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['screening-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['screening-applicant', id] });
      queryClient.invalidateQueries({ queryKey: ['screening-applicant-stats'] });
    },
  });
};
