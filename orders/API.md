# Orders App API Documentation

## Purpose
This app contains the core Order models and business logic. All customer-facing order endpoints are now available through the Shopkeepers module.

## Customer Order Endpoints
For shopkeeper/customer order management, see the Shopkeepers API documentation at `/api/shopkeepers/`:

- **POST** `/api/shopkeepers/orders/create/` - Create a new order
- **GET** `/api/shopkeepers/orders/` - List all orders for the shopkeeper
- **GET** `/api/shopkeepers/orders/{id}/` - Get order details
- **PATCH** `/api/shopkeepers/orders/{id}/update/` - Update/cancel order
- **GET** `/api/shopkeepers/orders/{id}/tracking/` - Track order status

## Technical Notes
- **Warehouse Field**: The `warehouse` field in Order model is a ForeignKey to `Warehouse` (not User), providing access to warehouse.name, warehouse.address, and warehouse.location
- **User Model**: Uses custom User model with Supabase authentication
- **Order String Representation**: Orders are displayed as "Order #{id} by {shopkeeper.email}"

## Order Statuses
- `pending` - Order created, awaiting warehouse acceptance
- `accepted` - Warehouse accepted the order
- `rejected` - Warehouse rejected the order
- `in_transit` - Order is being delivered
- `delivered` - Order successfully delivered
- `cancelled` - Order cancelled by shopkeeper

## Schemas
- **OrderSerializer** fields: `id`, `shopkeeper`, `warehouse`, `status`, `total_amount`, `order_items[]`, `created_at`, `updated_at`
- **OrderItem** fields: `id`, `order`, `item`, `item_name`, `quantity`, `price`

