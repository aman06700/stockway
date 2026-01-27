import apiClient from './api';
import { Rider, RiderProfile, RiderStatus } from '@/types';

export const riderService = {
  // Get rider profile
  getRiderProfile: async (): Promise<RiderProfile> => {
    const response = await apiClient.get('/api/riders/profile/');
    return response.data;
  },

  // Update rider profile
  updateRiderProfile: async (data: { status: RiderStatus }): Promise<RiderProfile> => {
    const response = await apiClient.put('/api/riders/profile/', data);
    return response.data;
  },

  // Update rider location
  updateRiderLocation: async (latitude: number, longitude: number): Promise<void> => {
    await apiClient.post('/api/riders/location/update/', {
      latitude,
      longitude,
    });
  },

  // Register rider (Warehouse Admin)
  registerRider: async (userId: number, warehouseId: number, status: RiderStatus = 'available'): Promise<Rider> => {
    const response = await apiClient.post('/api/riders/register/', {
      user_id: userId,
      warehouse_id: warehouseId,
      status,
    });
    return response.data;
  },

  // List riders for warehouse (Warehouse Admin)
  listWarehouseRiders: async (warehouseId: number): Promise<Rider[]> => {
    const response = await apiClient.get(`/api/warehouses/${warehouseId}/riders/`);
    return response.data;
  },

  // Get available riders (Warehouse Admin)
  getAvailableRiders: async (warehouseId: number): Promise<Rider[]> => {
    const response = await apiClient.get(`/api/warehouses/${warehouseId}/riders/?status=available`);
    return response.data;
  },
};
