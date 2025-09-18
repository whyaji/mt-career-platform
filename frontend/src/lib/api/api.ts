import { BASE_URL_API } from '@/constants/env';

export const baseApiUrl = `${BASE_URL_API}/api/v1`;

export type DefaultResponseType<T = undefined> =
  | {
      success: boolean;
      message: string;
      data?: T;
    }
  | {
      success: boolean;
      error: string;
      message: string;
    };

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};
