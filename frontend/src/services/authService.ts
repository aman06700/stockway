import apiClient, { tokenService } from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  // Send OTP to email
  sendOTP: async (email: string): Promise<{ success: boolean; message: string; email: string }> => {
    const response = await apiClient.post('/api/auth/send-otp/', { email });
    return response.data;
  },

  // Verify OTP and login
  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/verify-otp/', { email, otp });
    const authData = response.data;

    // Store tokens
    tokenService.setAuthData(authData);

    return authData;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me/');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout/');
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
