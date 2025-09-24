import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from '@/lib/api/api';

export interface DashboardCountsType {
  total_batches: number;
  total_applicants: number;
  total_institutions: number;
}

const talentHubDashboardUrl = `${baseApiUrl}/talenthub/dashboard`;

export const getDashboardCounts = async (): Promise<DefaultResponseType<DashboardCountsType>> => {
  const response = await authenticatedFetch(`${talentHubDashboardUrl}/counts`);
  return response.json();
};
