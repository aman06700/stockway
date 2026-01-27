import apiClient from './api';
import { Warehouse, Location } from '@/types';

export const warehouseService = {
  // List all warehouses
  listWarehouses: async (filters?: {
    is_active?: boolean;
    is_approved?: boolean;
    search?: string;
  }): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.is_approved !== undefined) params.append('is_approved', filters.is_approved.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(`/api/warehouses/?${params.toString()}`);
    return response.data;
  },

  // Get warehouse details
  getWarehouse: async (warehouseId: number): Promise<Warehouse> => {
    const response = await apiClient.get(`/api/warehouses/${warehouseId}/`);
    return response.data;
  },

  // Create warehouse
  createWarehouse: async (warehouseData: Partial<Warehouse>): Promise<Warehouse> => {
    const response = await apiClient.post('/api/warehouses/', warehouseData);
    return response.data;
  },

  // Update warehouse
  updateWarehouse: async (warehouseId: number, warehouseData: Partial<Warehouse>): Promise<Warehouse> => {
    const response = await apiClient.patch(`/api/warehouses/${warehouseId}/`, warehouseData);
    return response.data;
  },

  // Get nearby warehouses (Shopkeeper)
  getNearbyWarehouses: async (location?: Location, radiusKm: number = 50): Promise<Warehouse[]> => {
    const params: any = {
      radius: radiusKm,
    };

    if (location) {
      params.lat = location.latitude;
      params.lng = location.longitude;
    }

    const response = await apiClient.get('/api/shopkeepers/warehouses/nearby/', {
      params,
    });
    return response.data;
  },

  // Get managed warehouses (Warehouse Admin)
  getManagedWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get('/api/warehouses/managed/');
    return response.data;
  },
};
