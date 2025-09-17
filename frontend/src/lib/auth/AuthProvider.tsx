import { RouterProvider } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';

import { useLoading } from '@/hooks/useLoading.hook';
import type { UserType } from '@/types/user.type';

import { AuthContext } from './useAuth.hook';

export interface AuthState {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  access_token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string, turnstileToken: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserType) => void;
}
interface AuthProviderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any; // Router instance
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ router }) => {
  const { showLoading, hideLoading } = useLoading();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    access_token: null,
  });

  useEffect(() => {
    // Show loading while checking for existing token
    showLoading();

    // Check for existing token on app load
    const access_token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (access_token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          access_token,
        });
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }

    // Hide loading when authentication check is complete
    hideLoading();
  }, [showLoading, hideLoading]);

  const login = async (email: string, password: string, turnstileToken: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      showLoading();

      // Import login function dynamically to avoid circular dependency
      const { authApi } = await import('@/lib/api/authApi');
      const response = await authApi.login({ email, password, turnstileToken });

      // Check if login was successful and extract data
      if ('success' in response && response.success && 'data' in response && response.data) {
        const { user, access_token } = response.data;

        // Store in localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_data', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          access_token,
        });
      } else {
        throw new Error('Login failed');
      }
    } catch {
      throw new Error('Login failed');
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      hideLoading();
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      access_token: null,
    });
    window.location.href = '/talenthub';
  };

  const setUser = (user: UserType) => {
    setAuthState((prev) => ({ ...prev, user }));
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <RouterProvider router={router} context={{ auth: authState }} />
    </AuthContext.Provider>
  );
};
