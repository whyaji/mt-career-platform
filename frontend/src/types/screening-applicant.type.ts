import type { BatchType } from './batch.type';

export type ScreeningApplicantType = {
  id: string;
  batch_id: string;
  answers: Array<{
    question_id: string;
    question_code: string;
    answer: unknown;
  }>;
  scoring: Array<{
    question_id: string;
    question_code: string;
    score: number;
    max_score: number;
    scoring_rules: {
      points: number;
      enabled: boolean;
      max_score: number;
      conditions: {
        operator: string;
        value: unknown;
        points: number;
      }[];
    } | null;
  }> | null;
  total_score: number | null;
  max_score: number | null;
  marking: MarkingScreeningApplicantType[] | null;
  total_marking: number | null;
  ai_scoring: Array<{
    question_id: string;
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
    question_id: string;
    answer: unknown;
  }>;
  scoring?: Array<{
    question_id: string;
    score: number;
  }>;
  total_score?: number;
  max_score?: number;
  marking?: MarkingScreeningApplicantType[];
  total_marking?: number;
  ai_scoring?: Array<{
    question_id: string;
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

export type MarkingScreeningApplicantPayloadType = {
  marking: {
    question_id: string;
    marking_score: number;
  }[];
};

export type MarkingScreeningApplicantType = {
  marking_by: string;
  marking_by_name?: string;
  marking_at: string;
  marking: {
    question_id: string;
    marking_score: number;
    from_score: number;
  }[];
};
