export interface QuestionType {
  id: string;
  code: string;
  label: string;
  placeholder?: string;
  description?: string;
  type: QuestionFieldType;
  options?: string[];
  validation_rules?: ValidationRule[];
  scoring_rules?: ScoringRule;
  display_order: number;
  required: boolean;
  readonly: boolean;
  disabled: boolean;
  icon?: string;
  group?: string;
  conditional_logic?: ConditionalLogic;
  default_value?: unknown;
  has_custom_other_input: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuestionFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'hidden';

export interface ValidationRule {
  rule: string;
  value?: unknown;
  message?: string;
}

export interface ScoringRule {
  enabled: boolean;
  points: number;
  conditions: ScoringCondition[];
  max_score: number;
}

export interface ScoringCondition {
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'greater_equal'
    | 'less_equal'
    | 'in'
    | 'not_in';
  value: unknown;
  points: number;
}

export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
  show_when: boolean;
}

export interface QuestionFormData {
  code: string;
  label: string;
  placeholder?: string;
  description?: string;
  type: QuestionFieldType;
  options?: string[];
  validation_rules?: ValidationRule[];
  scoring_rules?: ScoringRule;
  display_order?: number;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  icon?: string;
  group?: string;
  conditional_logic?: ConditionalLogic;
  default_value?: unknown;
  has_custom_other_input?: boolean;
  is_active?: boolean;
}

export interface QuestionTypesResponse {
  [key: string]: string;
}

export interface ValidationRulesResponse {
  [key: string]: string;
}

export interface BatchQuestionType {
  id: string;
  batch_id: string;
  question_id: string;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  batch_specific_options?: string[];
  batch_specific_validation?: ValidationRule[];
  batch_specific_scoring?: ScoringRule;
  question?: QuestionType;
  created_at: string;
  updated_at: string;
}

export interface BatchFormConfiguration {
  batch_id: string;
  batch_info: {
    number: number;
    location: string;
    year: number;
  };
  questions: QuestionType[];
  total_questions: number;
}
