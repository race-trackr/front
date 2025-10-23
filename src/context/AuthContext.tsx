import React, { createContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore'; // Import the Zustand store
import { User, LoginPayload, RegisterPayload } from '@/types';

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
  const { user, token, isAuthenticated, login, register, logout, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the AuthProvider mounts
    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};