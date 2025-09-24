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
  program_category?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    status: number;
  } | null;
};
