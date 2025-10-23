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
    console.log('AuthContext useEffect: storedToken', storedToken ? 'exists' : 'none');
    if (storedToken) {
      setToken(storedToken);
      // Verify the token and fetch user details
      apiClient.get('/auth/me')
        .then(response => {
          console.log('AuthContext: /auth/me success', response.data.user);
          setUser(response.data.user);
        })
        .catch((error) => {
          console.error('AuthContext: /auth/me error', error);
          // If token is invalid or expired, clear it
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          showError(t('session_expired'));
        })
        .finally(() => {
          setLoading(false); // Auth state determined
          console.log('AuthContext: useEffect finished loading');
        });
    } else {
      setLoading(false); // No token, not authenticated
      console.log('AuthContext: useEffect finished loading (no token)');
    }
  }, []);

  const login = async (credentials: LoginPayload) => {
    setLoading(true); // Start loading for login process
    console.log('AuthContext: login started');
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { token: newToken } = response.data;
      console.log('AuthContext: login successful, token received');

      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      // Fetch user details after login
      const userResponse = await apiClient.get('/auth/me');
      setUser(userResponse.data.user);
      console.log('AuthContext: user fetched after login', userResponse.data.user);
      showSuccess(t('logged_in_successfully'));
    } catch (error: any) {
      console.error('AuthContext: login error', error.response?.data || error.message);
      showError(error.response?.data?.message || t('login_failed'));
      throw error;
    } finally {
      setLoading(false); // End loading for login process
      console.log('AuthContext: login finished loading');
    }
  };

  const register = async (userData: RegisterPayload) => {
    setLoading(true); // Start loading for registration process
    console.log('AuthContext: register started');
    try {
      await apiClient.post('/auth/register', userData);
      console.log('AuthContext: registration successful');
      showSuccess(t('registration_successful'));
    } catch (error: any) {
      console.error('AuthContext: registration error', error.response?.data || error.message);
      showError(error.response?.data?.message || t('registration_failed'));
      throw error;
    } finally {
      setLoading(false); // End loading for registration process
      console.log('AuthContext: register finished loading');
    }
  };

  const logout = () => {
    setLoading(true); // Start loading for logout process
    console.log('AuthContext: logout started');
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    showSuccess(t('logged_out_successfully'));
    setLoading(false); // End loading for logout process
    console.log('AuthContext: logout finished');
  };

  const isAuthenticated = !!token && !!user;
  console.log('AuthContext: isAuthenticated', isAuthenticated, 'user', user);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};