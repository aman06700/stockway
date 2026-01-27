import apiClient from './api';
import {
  Order,
  CreateOrderRequest,
  OrderFilters,
  OrderTracking
} from '@/types';

export const orderService = {
  // Shopkeeper - Create order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post('/api/orders/shopkeeper/orders/create/', orderData);
    return response.data;
  },

  // Shopkeeper - List orders
  listShopkeeperOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.ordering) params.append('ordering', filters.ordering);

    const response = await apiClient.get(`/api/orders/shopkeeper/orders/?${params.toString()}`);
    return response.data;
  },

  // Shopkeeper - Get order detail
  getShopkeeperOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/api/orders/shopkeeper/orders/${orderId}/`);
    return response.data;
  },

  // Shopkeeper - Track order
  trackOrder: async (orderId: number): Promise<OrderTracking> => {
    const response = await apiClient.get(`/api/shopkeepers/orders/${orderId}/tracking/`);
    return response.data;
  },

  // Warehouse - List orders
  listWarehouseOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`/api/orders/warehouse/orders/?${params.toString()}`);
    return response.data;
  },

  // Warehouse - Get order detail
  getWarehouseOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/api/orders/warehouse/orders/${orderId}/`);
    return response.data;
  },

  // Warehouse - Accept order
  acceptOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.post(`/api/orders/warehouse/orders/${orderId}/accept/`);
    return response.data;
  },

  // Warehouse - Reject order
  rejectOrder: async (orderId: number, rejectionReason: string): Promise<Order> => {
    const response = await apiClient.post(`/api/orders/warehouse/orders/${orderId}/reject/`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  // Warehouse - Assign rider
  assignRider: async (orderId: number, riderId: number): Promise<Order> => {
    const response = await apiClient.post(`/api/orders/warehouse/orders/${orderId}/assign-rider/`, {
      rider_id: riderId,
    });
    return response.data;
  },

  // Rider - List assigned orders
  listRiderOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/api/riders/orders/');
    return response.data;
  },

  // Rider - Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<any> => {
    const response = await apiClient.patch('/api/riders/orders/update/', {
      order_id: orderId,
      status,
    });
    return response.data;
  },
};
