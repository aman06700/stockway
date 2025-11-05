# Warehouse API Documentation

## Overview

The Warehouse API provides comprehensive warehouse management features including inventory control, order management, rider assignment, notifications, and analytics.

## Base URL

```
http://localhost:8000/api/warehouses/
```

## Authentication

All endpoints require authentication. Include the authentication token in the request headers:

```
Authorization: Bearer <your-token>
```

## Endpoints

### 1. List Warehouses

```http
GET /api/warehouses/
```

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `is_approved` (boolean): Filter by approval status
- `search` (string): Search by name, address, or contact number
- `ordering` (string): Sort by field (e.g., `-created_at`, `name`)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Warehouse",
    "address": "123 Main St",
    "contact_number": "+1234567890",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "is_active": true,
    "is_approved": true,
    "admin_email": "admin@example.com",
    "admin_name": "John Doe",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### 2. Create Warehouse

```http
POST /api/warehouses/
```

**Request Body:**
```json
{
  "name": "New Warehouse",
  "address": "456 Side St",
  "contact_number": "+0987654321",
  "latitude": 40.7580,
  "longitude": -73.9855
}
```

### 3. Get Warehouse Details

```http
GET /api/warehouses/{id}/
```

### 4. Update Warehouse

```http
PUT /api/warehouses/{id}/
PATCH /api/warehouses/{id}/
```

### 5. Get Warehouse Inventory

```http
GET /api/warehouses/{id}/inventory/
```

**Query Parameters:**
- `search` (string): Search by item name or SKU

**Response:**
```json
[
  {
    "id": 1,
    "warehouse": 1,
    "warehouse_name": "Main Warehouse",
    "name": "Product A",
    "sku": "SKU001",
    "description": "Description",
    "price": "19.99",
    "quantity": 100,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### 6. Bulk Update Inventory

```http
POST /api/warehouses/{id}/inventory/bulk-update/
```

**Request Body:**
```json
{
  "updates": [
    {
      "item_id": 1,
      "quantity_change": 10
    },
    {
      "item_id": 2,
      "quantity_change": -5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bulk update completed",
  "results": [
    {
      "item_id": 1,
      "success": true,
      "new_quantity": 110
    },
    {
      "item_id": 2,
      "success": true,
      "new_quantity": 45
    }
  ]
}
```

### 7. List Warehouse Orders

```http
GET /api/warehouses/{id}/orders/
```

**Query Parameters:**
- `status` (string): Filter by order status
- `from_date` (date): Filter orders from date (YYYY-MM-DD)
- `to_date` (date): Filter orders to date (YYYY-MM-DD)

### 8. Get Order Details

```http
GET /api/warehouses/orders/{order_id}/
```

### 9. Accept/Reject Order

```http
POST /api/warehouses/orders/{order_id}/action/
```

**Request Body (Accept):**
```json
{
  "action": "accept"
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "rejection_reason": "Out of stock"
}
```

### 10. Assign Rider to Order (Manual)

```http
POST /api/warehouses/orders/{order_id}/assign-rider/
```

**Request Body:**
```json
{
  "rider_id": 5
}
```

### 11. Auto-Assign Nearest Rider

```http
POST /api/warehouses/orders/{order_id}/auto-assign-rider/
```

This endpoint automatically finds and assigns the nearest available rider using PostGIS geographic queries.

### 12. Track Deliveries

```http
GET /api/warehouses/{id}/deliveries/
```

**Query Parameters:**
- `status` (string): Filter by status (default: "active" - shows assigned, picked_up, in_transit)

### 13. Get Notifications

```http
GET /api/warehouses/{id}/notifications/
```

**Query Parameters:**
- `is_read` (boolean): Filter by read status
- `type` (string): Filter by notification type (order, stock, general, payment, rider)

**Response:**
```json
[
  {
    "id": 1,
    "warehouse": 1,
    "notification_type": "stock",
    "title": "Low Stock Alert",
    "message": "Product A is running low (Current: 5)",
    "is_read": false,
    "metadata": {
      "item_id": 1,
      "sku": "SKU001",
      "current_stock": 5,
      "threshold": 10
    },
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### 14. Mark Notifications as Read

```http
POST /api/warehouses/{id}/notifications/mark-read/
```

**Request Body:**
```json
{
  "notification_ids": [1, 2, 3]
}
```

### 15. List Rider Payouts

```http
GET /api/warehouses/{id}/rider-payouts/
```

**Query Parameters:**
- `status` (string): Filter by payout status (pending, processing, completed, failed)

### 16. Analytics Summary

```http
GET /api/warehouses/{id}/analytics/summary/
```

**Query Parameters:**
- `from_date` (date): Start date for analytics (YYYY-MM-DD)
- `to_date` (date): End date for analytics (YYYY-MM-DD)

**Response:**
```json
{
  "total_orders": 150,
  "completed_orders": 120,
  "pending_orders": 10,
  "total_revenue": "15000.00",
  "top_items": [
    {
      "name": "Product A",
      "sku": "SKU001",
      "quantity": 500
    }
  ],
  "low_stock_items": [
    {
      "name": "Product B",
      "sku": "SKU002",
      "quantity": 5
    }
  ]
}
```

### 17. Export Analytics

```http
GET /api/warehouses/{id}/analytics/export/
```

**Query Parameters:**
- `format` (string): Export format - `json` or `csv` (default: json)
- `from_date` (date): Start date (YYYY-MM-DD)
- `to_date` (date): End date (YYYY-MM-DD)

**CSV Response:**
Downloads a CSV file with order data.

**JSON Response:**
```json
{
  "warehouse_id": 1,
  "warehouse_name": "Main Warehouse",
  "orders": [
    {
      "id": 1,
      "status": "delivered",
      "total_amount": "100.00",
      "created_at": "2025-01-01T00:00:00Z",
      "shopkeeper_email": "shop@example.com",
      "rider_email": "rider@example.com"
    }
  ]
}
```

## Error Responses

All endpoints return standard HTTP status codes and JSON error messages:

```json
{
  "error": "Error description"
}
```

**Common Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Geographic Features

The warehouse system uses PostGIS for geographic calculations:

- **Auto-Rider Assignment**: Finds the nearest available rider within 50km
- **Distance Calculation**: Accurate distance-based payout calculations
- **Location-Based Queries**: Filter and sort by geographic proximity

## Permissions

- **Admin**: Full access to all warehouses
- **Warehouse Manager**: Access only to own warehouses
- **Shopkeeper**: View active/approved warehouses, place orders
- **Rider**: View assigned deliveries

## Examples

### Using cURL

```bash
# List warehouses
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/warehouses/

# Create warehouse
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Warehouse","address":"123 St","contact_number":"+123","latitude":40.7,"longitude":-74}' \
  http://localhost:8000/api/warehouses/

# Auto-assign rider
curl -X POST \
  -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/warehouses/orders/5/auto-assign-rider/
```

### Using Python requests

```python
import requests

headers = {"Authorization": "Bearer <your-token>"}
base_url = "http://localhost:8000/api/warehouses/"

# Get warehouses
response = requests.get(base_url, headers=headers)
warehouses = response.json()

# Bulk update inventory
data = {
    "updates": [
        {"item_id": 1, "quantity_change": 10},
        {"item_id": 2, "quantity_change": -5}
    ]
}
response = requests.post(
    f"{base_url}1/inventory/bulk-update/",
    headers=headers,
    json=data
)
```

## Testing

Run the test script to verify endpoints:

```bash
python test_warehouse_api.py
```

## Notes

- All datetime fields are in ISO 8601 format with UTC timezone
- Pagination is available on list endpoints (use `?page=2`)
- All decimal fields (prices, amounts) are returned as strings to preserve precision
- Geographic coordinates use WGS84 (SRID 4326)

