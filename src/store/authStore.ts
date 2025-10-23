import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/lib/apiClient';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import i18n from '@/i18n'; // Import i18n instance for translations

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>; // New function to initialize auth state
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true, // Initial loading state

      initializeAuth: async () => {
        set({ loading: true });
        const storedToken = get().token; // Get token from persisted state
        if (storedToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          try {
            const response = await apiClient.get('/auth/me');
            set({ user: response.data.user, isAuthenticated: true, loading: false });
          } catch (error: any) {
            console.error('AuthStore: /auth/me error', error);
            set({ user: null, token: null, isAuthenticated: false, loading: false });
            showError(error.response?.data?.message || i18n.t('session_expired'));
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
          set({ loading: false });
          showSuccess(i18n.t('registration_successful'));
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
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ token: state.token }), // Only persist the token
      onRehydrateStorage: (state) => {
        // This function runs when the store is rehydrated from storage
        if (state?.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
        // Return a function that will be called after rehydration
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate auth store', error);
            // Clear any corrupted state
            state?.logout();
          } else if (state) {
            // After rehydration, initialize auth state (fetch user details)
            state.initializeAuth();
          }
        };
      },
    }
  )
);