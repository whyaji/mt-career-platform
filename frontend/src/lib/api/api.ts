import { BASE_URL_API } from '@/constants/env';

import { authApi } from './authApi';

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

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const refreshTokens = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await authApi.refresh();

      if (response.success && 'data' in response && response.data) {
        // Update localStorage with new tokens
        localStorage.setItem('access_token', response.data.tokens.access_token.token);
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token.token);
        return true;
      }
      return false;
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/talenthub/login';
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('access_token');

  const makeRequest = async (accessToken: string | null): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    });
  };

  // First attempt with current token
  let response = await makeRequest(token);

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && localStorage.getItem('refresh_token')) {
    const refreshSuccess = await refreshTokens();

    if (refreshSuccess) {
      // Retry the original request with new token
      const newToken = localStorage.getItem('access_token');
      response = await makeRequest(newToken);
    }
  }
  return response;
};
