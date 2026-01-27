import apiClient from './api';
import { ShopkeeperProfile, Location, Order } from '@/types';

export const shopkeeperService = {
  // Get shopkeeper profile
  getProfile: async (): Promise<ShopkeeperProfile> => {
    const response = await apiClient.get('/api/shopkeepers/profile/');
    return response.data;
  },

  // Create/Update shopkeeper profile
  updateProfile: async (profileData: Partial<ShopkeeperProfile>): Promise<ShopkeeperProfile> => {
    const response = await apiClient.put('/api/shopkeepers/profile/', profileData);
    return response.data;
  },

  // Update location
  updateLocation: async (location: Location): Promise<ShopkeeperProfile> => {
    const response = await apiClient.patch('/api/shopkeepers/profile/', {
      latitude: location.latitude,
      longitude: location.longitude,
    });
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await apiClient.post('/api/shopkeepers/profile/upload-picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get orders
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/api/shopkeepers/orders/');
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/api/shopkeepers/orders/${orderId}/`);
    return response.data;
  },
};
