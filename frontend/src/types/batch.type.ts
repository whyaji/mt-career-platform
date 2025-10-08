import type { ProgramType } from './program.type';
import type { QuestionType } from './question.type';

export type ScreeningConfigType = {
  age?: {
    enabled?: boolean;
    min_age?: number;
    max_age?: number;
  };
  physical?: {
    enabled?: boolean;
    min_height?: number;
    min_weight?: number;
    max_weight?: number;
  };
  program?: {
    enabled?: boolean;
    allowed_education_levels?: string[];
  };
  education?: {
    enabled?: boolean;
    valid_levels?: string[];
    require_diploma?: boolean;
  };
  university?: {
    enabled?: boolean;
  };
  marital?: {
    enabled?: boolean;
    valid_statuses?: string[];
  };
  continue_education?: {
    enabled?: boolean;
    valid_options?: string[];
  };
};

export type BatchType = {
  id: string;
  number: number;
  number_code: string;
  location: string;
  location_code: string;
  year: number;
  institutes: string[] | null;
  status: number;
  program_category_id: string | null;
  screening_config?: ScreeningConfigType | null;
  program_category?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    status: number;
    programs?: ProgramType[] | null;
  } | null;
  questions?: QuestionType[] | null;
};
