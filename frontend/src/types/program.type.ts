export interface ProgramType {
  id: string;
  code: string;
  name: string;
  program_category_id: string;
  description?: string;
  min_education: 'D3' | 'S1' | 'S2';
  majors: string[];
  min_gpa: number;
  marital_status: 'single' | 'any';
  placement: string;
  training_duration: number;
  ojt_duration: number;
  contract_duration?: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  program_category?: {
    id: string;
    code: string;
    name: string;
  };
}
