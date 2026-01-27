import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token storage keys
const TOKEN_KEY = 'stockway_access_token';
const REFRESH_TOKEN_KEY = 'stockway_refresh_token';
const USER_KEY = 'stockway_user';

// Token management
export const tokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  setAuthData: (authResponse: AuthResponse): void => {
    tokenService.setAccessToken(authResponse.access_token);
    tokenService.setRefreshToken(authResponse.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear tokens and redirect to login
      tokenService.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Error handler helper
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Check for error response
    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Handle different error formats
      if (typeof data === 'string') {
        return data;
      }

      if (data.detail) {
        return data.detail;
      }

      if (data.error) {
        if (typeof data.error === 'string') {
          return data.error;
        }
        // Handle field errors
        if (typeof data.error === 'object') {
          const firstKey = Object.keys(data.error)[0];
          const firstError = data.error[firstKey];
          return Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }

      // Handle field-level errors
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) {
        return `${firstKey}: ${data[firstKey][0]}`;
      }
    }

    // Fallback to status text
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }

    // Network error
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return 'An unexpected error occurred';
};

export default apiClient;
