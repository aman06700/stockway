// User roles
export type UserRole = 'PENDING' | 'SHOPKEEPER' | 'WAREHOUSE_MANAGER' | 'RIDER' | 'SUPER_ADMIN';

// User types
export interface User {
  id: number;
  phone_number: string | null;
  email: string | null;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  profile_picture?: string;
}

// Auth types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  otp: string;
}

// Order types
export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  item: number;
  item_name: string;
  item_sku: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  shopkeeper: number;
  shopkeeper_email?: string;
  shopkeeper_phone?: string;
  warehouse: number;
  warehouse_name: string;
  warehouse_address: string;
  status: OrderStatus;
  total_amount: string;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  delivery_status?: string | null;
  rider_info?: {
    rider_id: number;
    rider_phone: string;
    delivery_fee: string;
  } | null;
}

export interface CreateOrderRequest {
  warehouse_id: number;
  items: {
    item_id: number;
    quantity: number;
  }[];
  notes?: string;
}

// Inventory types
export interface InventoryItem {
  id: number;
  warehouse: number;
  warehouse_name: string;
  name: string;
  sku: string;
  description: string;
  price: string;
  quantity: number;
  available: boolean;
  image?: string;
  created_at: string;
  updated_at: string;
}

// Warehouse types
export interface Warehouse {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  is_approved: boolean;
  admin_email?: string;
  admin_name?: string;
  created_at: string;
  distance_km?: number;
}

// Rider types
export type RiderStatus = 'available' | 'busy' | 'inactive';

export interface Rider {
  id: number;
  user: number;
  warehouse: number;
  warehouse_id?: number;
  warehouse_name: string;
  warehouse_address?: string;
  rider_name: string;
  rider_email: string;
  status: RiderStatus;
  current_location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_earnings: string;
  created_at: string;
  updated_at: string;
}

export interface RiderProfile {
  id: number;
  name: string;
  email: string;
  warehouse_name: string;
  warehouse_address: string;
  status: RiderStatus;
  current_location: string | null;
  latitude: number | null;
  longitude: number | null;
  total_earnings: string;
  created_at: string;
}

// Delivery types
export type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';

export interface Delivery {
  id: number;
  order: number;
  rider: number;
  status: DeliveryStatus;
  delivery_fee: string;
  pickup_time?: string | null;
  delivery_time?: string | null;
  created_at: string;
  updated_at: string;
}

// Tracking types
export interface OrderTracking {
  order_id: number;
  order_status: OrderStatus;
  order_status_display: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  warehouse: {
    id: number;
    name: string;
    address: string;
  };
  delivery?: {
    status: DeliveryStatus;
    status_display: string;
    delivery_fee: string;
    created_at: string;
    updated_at: string;
  } | null;
  rider?: {
    id: number;
    phone_number: string;
  } | null;
}

// Shopkeeper Profile
export interface ShopkeeperProfile {
  id: number;
  user: number;
  shop_name: string;
  shop_address: string;
  latitude: number | null;
  longitude: number | null;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error
export interface ApiError {
  detail?: string;
  error?: string | Record<string, string[]>;
  [key: string]: any;
}

// Analytics
export interface Analytics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: string;
  active_users: number;
  [key: string]: any;
}

// Location
export interface Location {
  latitude: number;
  longitude: number;
}

// Filter and query params
export interface OrderFilters {
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface InventoryFilters {
  warehouse?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  ordering?: string;
}
