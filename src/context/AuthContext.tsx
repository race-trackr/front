import React, { createContext, ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UserType, LoginPayload, RegisterPayload } from '@/types'

interface AuthContextType {
  user: UserType | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginPayload) => Promise<void>
  register: (userData: RegisterPayload) => Promise<void>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, token, isAuthenticated, login, register, logout, loading } = useAuthStore()

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
