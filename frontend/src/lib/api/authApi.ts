import { queryOptions } from '@tanstack/react-query';

import type { UserType } from '@/types/user.type';

import { baseApiUrl, type DefaultResponseType } from './api';

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
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserType;
}>;

const getUserProfileFunction = async (): Promise<
  DefaultResponseType<{ user: UserType; token_payload: Record<string, unknown> }>
> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${baseApiUrl}/auth/user-profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user profile');
  }

  return response.json();
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${baseApiUrl}/auth/login`, {
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

    const response = await fetch(`${baseApiUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  },

  refresh: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${baseApiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
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
