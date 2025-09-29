import { queryOptions } from '@tanstack/react-query';

import type { UserType } from '@/types/user.type';

import { authenticatedFetch, baseApiUrl, type DefaultResponseType } from './api';

export interface LoginRequest {
  email: string;
  password: string;
  turnstileToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export type AuthResponse = DefaultResponseType<{
  user: UserType;
  tokens: {
    access_token: {
      token: string;
      expires_at: string;
      token_type: string;
    };
    refresh_token: {
      token: string;
      expires_at: string;
      token_type: string;
    };
  };
}>;

const talentHubAuthUrl = `${baseApiUrl}/talenthub/auth`;

const getUserProfileFunction = async (): Promise<
  DefaultResponseType<{
    local_user: UserType;
    parent_user: UserType;
    token_payload: Record<string, unknown>;
  }>
> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await authenticatedFetch(`${talentHubAuthUrl}/user-profile`, {
    method: 'GET',
  });

  if (!response.ok && [400, 401, 404].includes(response.status)) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user profile');
  }

  return response.json();
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${talentHubAuthUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json() as Promise<AuthResponse>;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    const response = await authenticatedFetch(`${talentHubAuthUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  },

  refresh: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No token found');
    }

    const response = await fetch(`${talentHubAuthUrl}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && [400, 401, 404].includes(response.status)) {
      const error = await response.json();
      throw new Error(error.error || 'Token refresh failed');
    }

    return response.json();
  },

  getUserProfile: getUserProfileFunction,
};

export const userQueryOptions = queryOptions({
  queryKey: ['get-current-user'],
  queryFn: getUserProfileFunction,
  staleTime: Infinity,
});

export const clearAuthData = () => {
  localStorage.removeItem('user-storage');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};
