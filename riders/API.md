# Riders App API Documentation

## Purpose
- Manage rider profile and delivery actions for assigned orders.

## Base URL
- `/api/riders/`

## Authentication
- Bearer Token required: `Authorization: Bearer <access_token>`
- Role: `RIDER`

## Endpoints

### 1) Rider Profile
- **GET** `/api/riders/profile/`
  - Fetch current rider profile
  - **200 OK**: `{ "warehouse": <id|null>, "payment_info": "..." }`
  - **404**: `{ "error": "Profile not found" }`
- **POST** `/api/riders/profile/`
  - Create rider profile for current user
  - Body: `{ "warehouse": 1, "payment_info": "UPI xyz@bank" }`
  - **201 Created**: same as GET
- **PUT** `/api/riders/profile/`
  - Update full profile
  - Body: `{ "warehouse": 1, "payment_info": "UPI abc@bank" }`
  - **200 OK**: updated profile

### 2) Rider Orders
- **GET** `/api/riders/orders/`
  - List orders assigned to the rider (via delivery relation)
  - **200 OK**: `[ { order fields... } ]`

### 3) Mark Order Delivered
- **POST** `/api/riders/orders/{order_id}/deliver/`
  - Marks order and delivery as delivered (only if `order.status == "in_transit"`)
  - **200 OK**: Order payload
  - **400**: `{ "error": "Order cannot be delivered." }`
  - **404**: `{ "error": "Order not found." }`

## Technical Notes
- **User Model**: The custom User model uses Supabase authentication with email as the primary identifier
- **Rider Profile String Representation**: Displayed as "Rider profile for {user.email}"
- **Warehouse Relationship**: `warehouse` field is a ForeignKey to Warehouse model, can be null/blank

## Notes
- Orders payload adheres to `orders.OrderSerializer` in orders app.
- Warehouse admins assign riders via warehouse management endpoints (see Warehouses API).
