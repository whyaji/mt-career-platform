import type { BatchType } from './batch.type';

export type ScreeningApplicantType = {
  id: string;
  batch_id: string;
  answers: Array<{
    question_code: string;
    answer: unknown;
  }>;
  scoring: Array<{
    question_code: string;
    score: number;
  }> | null;
  total_score: number | null;
  max_score: number | null;
  marking: Array<{
    question_code: string;
    marking: number;
  }> | null;
  total_marking: number | null;
  ai_scoring: Array<{
    question_code: string;
    ai_score: number;
  }> | null;
  total_ai_scoring: number | null;
  status: number;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  batch?: BatchType;
};

export type ScreeningApplicantStatsType = {
  total_applicants: number;
  pending_applicants: number;
  scored_applicants: number;
  approved_applicants: number;
  rejected_applicants: number;
  average_score: number | null;
  average_marking: number | null;
  average_ai_scoring: number | null;
};

export type CreateScreeningApplicantType = {
  batch_id: string;
  answers: Array<{
    question_code: string;
    answer: unknown;
  }>;
  scoring?: Array<{
    question_code: string;
    score: number;
  }>;
  total_score?: number;
  max_score?: number;
  marking?: Array<{
    question_code: string;
    marking: number;
  }>;
  total_marking?: number;
  ai_scoring?: Array<{
    question_code: string;
    ai_score: number;
  }>;
  total_ai_scoring?: number;
  status: number;
  user_agent?: string;
  ip_address?: string;
};

export type UpdateScreeningApplicantType = Partial<CreateScreeningApplicantType>;

export const SCREENING_APPLICANT_STATUS = {
  PENDING: 0,
  SCORED: 1,
  APPROVED: 2,
  REJECTED: 3,
} as const;

export const SCREENING_APPLICANT_STATUS_LABELS = {
  [SCREENING_APPLICANT_STATUS.PENDING]: 'Pending',
  [SCREENING_APPLICANT_STATUS.SCORED]: 'Scored',
  [SCREENING_APPLICANT_STATUS.APPROVED]: 'Approved',
  [SCREENING_APPLICANT_STATUS.REJECTED]: 'Rejected',
} as const;
