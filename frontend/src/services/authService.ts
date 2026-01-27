import apiClient, { tokenService } from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string, confirmPassword: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/accounts/signup/', {
      email,
      password,
      confirm_password: confirmPassword,
    });
    const authData = response.data;

    // Store tokens
    tokenService.setAuthData(authData);

    return authData;
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/accounts/signin/', { email, password });
    const authData = response.data;

    // Store tokens
    tokenService.setAuthData(authData);

    return authData;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/accounts/me/');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/accounts/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenService.clearTokens();
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenService.getAccessToken();
  },

  // Get stored user without API call
  getStoredUser: (): User | null => {
    return tokenService.getStoredUser();
  },
};
