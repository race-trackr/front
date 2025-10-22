import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/apiClient';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  loading: boolean; // This indicates if the auth state is currently being determined or changed
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initial loading state
  const { t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Verify the token and fetch user details
      apiClient.get('/auth/me')
        .then(response => {
          console.log(response)
          setUser(response.data.user);
        })
        .catch(() => {
          // If token is invalid or expired, clear it
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          showError(t('session_expired'));
        })
        .finally(() => {
          setLoading(false); // Auth state determined
        });
    } else {
      setLoading(false); // No token, not authenticated
    }
  }, []);

  const login = async (credentials: LoginPayload) => {
    setLoading(true); // Start loading for login process
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { token: newToken } = response.data;

      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      // Fetch user details after login
      const userResponse = await apiClient.get('/auth/me');
      setUser(userResponse.data.user);
      showSuccess(t('logged_in_successfully'));
    } catch (error: any) {
      showError(document.URL || t('login_failed'));
      throw error;
    } finally {
      setLoading(false); // End loading for login process
    }
  };

  const register = async (userData: RegisterPayload) => {
    setLoading(true); // Start loading for registration process
    try {
      await apiClient.post('/auth/register', userData);
      showSuccess(t('registration_successful'));
    } catch (error: any) {
      showError(error.response?.data?.message || t('registration_failed'));
      throw error;
    } finally {
      setLoading(false); // End loading for registration process
    }
  };

  const logout = () => {
    setLoading(true); // Start loading for logout process
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    showSuccess(t('logged_out_successfully'));
    setLoading(false); // End loading for logout process
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};