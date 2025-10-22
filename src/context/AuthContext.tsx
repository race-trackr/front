import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/apiClient';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you'd verify the token with the backend and fetch user details
      // For now, we'll assume a valid token means authenticated
      // A more robust solution would involve a /me endpoint
      apiClient.get('/auth/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          showError('Session expired or invalid. Please log in again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginPayload) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { token: newToken } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      // Fetch user details after login
      const userResponse = await apiClient.get('/auth/me');
      setUser(userResponse.data.user);
      showSuccess('Logged in successfully!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Login failed.');
      throw error;
    }
  };

  const register = async (userData: RegisterPayload) => {
    try {
      await apiClient.post('/auth/register', userData);
      showSuccess('Registration successful! Please log in.');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Registration failed.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    showSuccess('Logged out successfully.');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};