# Delivery App API Documentation

## Purpose
Handles delivery assignment and tracking for orders.

## Current Implementation
Currently, there are no dedicated delivery management endpoints in this module. Delivery tracking for shopkeepers is available through the Shopkeepers module, and delivery management for riders is available through the Riders module.

## Shopkeeper Delivery Tracking
For shopkeepers to track their order deliveries, see the Shopkeepers API documentation:

- **GET** `/api/shopkeepers/orders/{id}/tracking/` - Get real-time tracking information including delivery status and rider details

**Example Response:**
```json
{
  "order_id": 42,
  "order_status": "in_transit",
  "order_status_display": "In Transit",
  "total_amount": "1250.00",
  "warehouse": {
    "id": 1,
    "name": "Main Warehouse",
    "address": "123 Main St, City"
  },
  "delivery": {
    "status": "in_transit",
    "status_display": "In Transit",
    "delivery_fee": "50.00",
    "created_at": "2025-10-23T11:00:00Z",
    "updated_at": "2025-10-23T11:15:00Z"
  },
  "rider": {
    "id": 15,
    "phone_number": "+919876543210"
  }
}
```

## Rider Delivery Management
For riders to manage their deliveries, see the Riders API documentation:

- **GET** `/api/riders/orders/` - List orders assigned to the rider
- **POST** `/api/riders/orders/{order_id}/deliver/` - Mark order as delivered

## Delivery Statuses
- `pending` - Delivery assigned but not yet started
- `picked_up` - Rider has picked up the order from warehouse
- `in_transit` - Order is being delivered
- `delivered` - Order successfully delivered
- `failed` - Delivery failed

## Delivery Schema
- Fields: `id`, `order`, `rider`, `status`, `delivery_fee`, `pickup_time`, `delivery_time`, `created_at`, `updated_at`
- `order` is a OneToOne relationship to Order model
- `rider` is a ForeignKey to User model (with RIDER role)
- `delivery_fee` is the fee charged for delivery

## Future Delivery Management Endpoints (Planned)
The following endpoints may be implemented for warehouse administrators:

- **POST** `/api/deliveries/assign/` - Assign a rider to an order
- **PATCH** `/api/deliveries/{id}/status/` - Update delivery status
- **GET** `/api/deliveries/` - List all deliveries (admin only)
- **GET** `/api/deliveries/{id}/` - Get delivery details

## Permissions
- Shopkeepers can view delivery status for their own orders
- Riders can view and update deliveries assigned to them
- Warehouse admins can assign riders and view deliveries for their warehouse
- Super admins can view all deliveries

