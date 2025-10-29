import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/lib/apiClient';
import { UserType, LoginPayload, RegisterPayload, AuthResponse } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import i18n from '@/i18n';

interface AuthState {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  setUser: (user: UserType) => void; // Added setUser method
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,

      initializeAuth: async () => {
        set({ loading: true });
        const storedToken = get().token;
        if (storedToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          try {
            const response = await apiClient.get('/auth/me');
            set({ user: response.data.user, isAuthenticated: true, loading: false });
          } catch (error: any) {
            console.error('AuthStore: /auth/me error', error);
            set({ user: null, token: null, isAuthenticated: false, loading: false });
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } else {
          set({ loading: false });
        }
      },

      login: async (credentials: LoginPayload) => {
        set({ loading: true });
        try {
          const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
          const newToken = response.data.token;
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          const userResponse = await apiClient.get('/auth/me');
          set({ token: newToken, user: userResponse.data.user, isAuthenticated: true, loading: false });
          showSuccess(i18n.t('logged_in_successfully'));
        } catch (error: any) {
          console.error('AuthStore: login error', error.response?.data || error.message);
          set({ loading: false });
          showError(error.response?.data?.message || i18n.t('login_failed'));
          throw error;
        }
      },

      register: async (userData: RegisterPayload) => {
        set({ loading: true });
        try {
          await apiClient.post('/auth/register', userData);
          // showSuccess(i18n.t('registration_successful')); // Supprimé car l'utilisateur est auto-connecté
          // Automatically log in the user after successful registration
          await get().login({ email: userData.email, password: userData.password });
        } catch (error: any) {
          console.error('AuthStore: registration error', error.response?.data || error.message);
          set({ loading: false });
          showError(error.response?.data?.message || i18n.t('registration_failed'));
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, loading: false });
        delete apiClient.defaults.headers.common['Authorization'];
        showSuccess(i18n.t('logged_out_successfully'));
      },

      setUser: (user: UserType) => { // Implementation of setUser
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: (state) => {
        if (state?.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate auth store', error);
            state?.logout();
          } else if (state) {
            state.initializeAuth();
          }
        };
      },
    }
  )
);