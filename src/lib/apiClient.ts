import axios from 'axios';
import { UserProfileFormValues } from '@/components/UserProfileForm'; // Import the type

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'; // Default API URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration or invalid token globally
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;