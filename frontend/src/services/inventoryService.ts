import apiClient from './api';
import { InventoryItem, InventoryFilters } from '@/types';

export const inventoryService = {
  // Browse inventory (Shopkeeper)
  browseInventory: async (filters?: InventoryFilters): Promise<InventoryItem[]> => {
    const params = new URLSearchParams();
    if (filters?.warehouse) params.append('warehouse', filters.warehouse.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.min_price) params.append('min_price', filters.min_price.toString());
    if (filters?.max_price) params.append('max_price', filters.max_price.toString());
    if (filters?.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString());
    if (filters?.ordering) params.append('ordering', filters.ordering);

    const response = await apiClient.get(`/api/shopkeepers/inventory/browse/?${params.toString()}`);
    return response.data;
  },

  // Get warehouse inventory (Warehouse Admin)
  getWarehouseInventory: async (warehouseId: number, search?: string): Promise<InventoryItem[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiClient.get(`/api/warehouses/${warehouseId}/inventory/${params}`);
    return response.data;
  },

  // Create inventory item (Warehouse Admin)
  createInventoryItem: async (warehouseId: number, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await apiClient.post(`/api/warehouses/${warehouseId}/inventory/`, itemData);
    return response.data;
  },

  // Update inventory item (Warehouse Admin)
  updateInventoryItem: async (
    warehouseId: number,
    itemId: number,
    itemData: Partial<InventoryItem>
  ): Promise<InventoryItem> => {
    const response = await apiClient.patch(`/api/warehouses/${warehouseId}/inventory/${itemId}/`, itemData);
    return response.data;
  },

  // Delete inventory item (Warehouse Admin)
  deleteInventoryItem: async (warehouseId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/api/warehouses/${warehouseId}/inventory/${itemId}/`);
  },

  // Bulk update inventory
  bulkUpdateInventory: async (
    warehouseId: number,
    updates: { item_id: number; quantity_change: number }[]
  ): Promise<any> => {
    const response = await apiClient.post(`/api/warehouses/${warehouseId}/inventory/bulk-update/`, {
      updates,
    });
    return response.data;
  },
};
