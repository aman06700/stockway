# Orders API Documentation

## Overview
This API handles order creation and management between Shopkeepers and Warehouses.

---

## Shopkeeper Endpoints

### 1. Create Order
**Endpoint:** `POST /api/orders/shopkeeper/orders/create/`

**Authentication:** Required (Shopkeeper role only)

**Description:** Create a new order from a warehouse with specified items.

**Request Body:**
```json
{
  "warehouse_id": 1,
  "items": [
    {
      "item_id": 10,
      "quantity": 5
    },
    {
      "item_id": 15,
      "quantity": 3
    }
  ],
  "notes": "Optional notes about the order"
}
```

**Validation Rules:**
- Warehouse must exist, be active, and approved
- All items must belong to the specified warehouse
- Sufficient stock must be available for each item
- No duplicate items in the same order
- Shopkeeper cannot have another pending/accepted order with the same warehouse

**Success Response (201 Created):**
```json
{
  "id": 42,
  "shopkeeper": 5,
  "shopkeeper_email": "shopkeeper@example.com",
  "shopkeeper_phone": "+1234567890",
  "warehouse": 1,
  "warehouse_name": "Downtown Warehouse",
  "warehouse_address": "123 Main St, City",
  "status": "pending",
  "total_amount": "1300.00",
  "rejection_reason": null,
  "created_at": "2025-11-07T10:30:00Z",
  "updated_at": "2025-11-07T10:30:00Z",
  "order_items": [
    {
      "id": 101,
      "item": 10,
      "item_name": "Product A",
      "item_sku": "SKU-001",
      "quantity": 5,
      "price": "100.00"
    },
    {
      "id": 102,
      "item": 15,
      "item_name": "Product B",
      "item_sku": "SKU-002",
      "quantity": 3,
      "price": "200.00"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request** - Invalid data
```json
{
  "warehouse_id": ["Warehouse is not active"],
  "items": ["Insufficient stock for item 'Product A'. Available: 3, Requested: 5"]
}
```

- **403 Forbidden** - Not a shopkeeper
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### 2. List Shopkeeper Orders
**Endpoint:** `GET /api/orders/shopkeeper/orders/`

**Authentication:** Required (Shopkeeper role only)

**Description:** Get all orders for the authenticated shopkeeper.

**Success Response (200 OK):**
```json
[
  {
    "id": 42,
    "shopkeeper_email": "shopkeeper@example.com",
    "warehouse_name": "Downtown Warehouse",
    "status": "pending",
    "total_amount": "1300.00",
    "items_count": 2,
    "created_at": "2025-11-07T10:30:00Z"
  },
  {
    "id": 41,
    "shopkeeper_email": "shopkeeper@example.com",
    "warehouse_name": "Uptown Warehouse",
    "status": "delivered",
    "total_amount": "850.00",
    "items_count": 3,
    "created_at": "2025-11-05T14:20:00Z"
  }
]
```

---

### 3. Get Order Detail
**Endpoint:** `GET /api/orders/shopkeeper/orders/{id}/`

**Authentication:** Required (Shopkeeper role only)

**Description:** Get detailed information about a specific order.

**Success Response (200 OK):**
```json
{
  "id": 42,
  "shopkeeper": 5,
  "shopkeeper_email": "shopkeeper@example.com",
  "shopkeeper_phone": "+1234567890",
  "warehouse": 1,
  "warehouse_name": "Downtown Warehouse",
  "warehouse_address": "123 Main St, City",
  "status": "accepted",
  "total_amount": "1300.00",
  "rejection_reason": null,
  "created_at": "2025-11-07T10:30:00Z",
  "updated_at": "2025-11-07T11:00:00Z",
  "order_items": [
    {
      "id": 101,
      "item": 10,
      "item_name": "Product A",
      "item_sku": "SKU-001",
      "quantity": 5,
      "price": "100.00"
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Not found."
}
```

---

## Warehouse Endpoints

### 4. List Warehouse Orders
**Endpoint:** `GET /api/orders/warehouse/orders/`

**Authentication:** Required (Warehouse Manager role only)

**Description:** Get all orders for warehouses managed by the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by order status (pending, accepted, rejected, in_transit, delivered, cancelled)

**Example:** `GET /api/orders/warehouse/orders/?status=pending`

**Success Response (200 OK):**
```json
[
  {
    "id": 42,
    "shopkeeper_email": "shopkeeper@example.com",
    "warehouse_name": "Downtown Warehouse",
    "status": "pending",
    "total_amount": "1300.00",
    "items_count": 2,
    "created_at": "2025-11-07T10:30:00Z"
  }
]
```

---

### 5. Get Pending Orders
**Endpoint:** `GET /api/orders/warehouse/orders/pending/`

**Authentication:** Required (Warehouse Manager role only)

**Description:** Get all pending orders for warehouses (convenience endpoint).

**Success Response (200 OK):**
```json
[
  {
    "id": 42,
    "shopkeeper_email": "shopkeeper@example.com",
    "warehouse_name": "Downtown Warehouse",
    "status": "pending",
    "total_amount": "1300.00",
    "items_count": 2,
    "created_at": "2025-11-07T10:30:00Z"
  }
]
```

---

### 6. Get Warehouse Order Detail
**Endpoint:** `GET /api/orders/warehouse/orders/{id}/`

**Authentication:** Required (Warehouse Manager role only)

**Description:** Get detailed information about a specific order for warehouse admin.

**Success Response (200 OK):**
```json
{
  "id": 42,
  "shopkeeper": 5,
  "shopkeeper_email": "shopkeeper@example.com",
  "shopkeeper_phone": "+1234567890",
  "warehouse": 1,
  "warehouse_name": "Downtown Warehouse",
  "warehouse_address": "123 Main St, City",
  "status": "pending",
  "total_amount": "1300.00",
  "rejection_reason": null,
  "created_at": "2025-11-07T10:30:00Z",
  "updated_at": "2025-11-07T10:30:00Z",
  "order_items": [
    {
      "id": 101,
      "item": 10,
      "item_name": "Product A",
      "item_sku": "SKU-001",
      "quantity": 5,
      "price": "100.00"
    }
  ]
}
```

---

### 7. Accept Order
**Endpoint:** `POST /api/orders/warehouse/orders/{id}/accept/`

**Authentication:** Required (Warehouse Manager role only)

**Description:** Accept a pending order.

**Request Body:** Empty

**Success Response (200 OK):**
```json
{
  "id": 42,
  "status": "accepted",
  "total_amount": "1300.00",
  "updated_at": "2025-11-07T11:00:00Z",
  ...
}
```

**Error Responses:**

- **400 Bad Request** - Order not in pending status
```json
{
  "error": "Order is already accepted"
}
```

- **404 Not Found** - Order not found
```json
{
  "error": "Order not found"
}
```

---

### 8. Reject Order
**Endpoint:** `POST /api/orders/warehouse/orders/{id}/reject/`

**Authentication:** Required (Warehouse Manager role only)

**Description:** Reject a pending order with a reason.

**Request Body:**
```json
{
  "rejection_reason": "Out of stock for some items"
}
```

**Success Response (200 OK):**
```json
{
  "id": 42,
  "status": "rejected",
  "rejection_reason": "Out of stock for some items",
  "total_amount": "1300.00",
  "updated_at": "2025-11-07T11:05:00Z",
  ...
}
```

**Error Responses:**

- **400 Bad Request** - Missing rejection reason or invalid status
```json
{
  "error": "Rejection reason is required"
}
```

---

## Order Status Flow

```
pending → accepted → in_transit → delivered
   ↓
rejected
   ↓
cancelled (at any stage)
```

**Status Definitions:**
- `pending`: Order created, waiting for warehouse approval
- `accepted`: Warehouse accepted the order
- `rejected`: Warehouse rejected the order
- `in_transit`: Order is being delivered
- `delivered`: Order successfully delivered
- `cancelled`: Order cancelled by shopkeeper or system

---

## Business Rules

1. **Stock Management:**
   - Stock is reserved (deducted) immediately when order is created
   - If order is rejected, stock should be manually replenished (future enhancement)

2. **Duplicate Orders:**
   - A shopkeeper cannot create multiple pending/accepted orders with the same warehouse
   - Once an order is rejected/delivered/cancelled, new orders can be created

3. **Authorization:**
   - Shopkeepers can only see their own orders
   - Warehouse managers can only see orders for their warehouses

4. **Price Locking:**
   - Item prices are captured at order creation time
   - Price changes in inventory don't affect existing orders

---

## Database Optimizations

All list and detail endpoints use:
- `select_related()` for foreign key relationships (warehouse, shopkeeper)
- `prefetch_related()` for reverse relationships (order_items)
- Indexed fields for filtering (status, created_at)

---

## Example Workflows

### Complete Order Creation Flow:

1. **Shopkeeper** creates order:
   ```
   POST /api/orders/shopkeeper/orders/create/
   ```

2. **Warehouse Manager** views pending orders:
   ```
   GET /api/orders/warehouse/orders/pending/
   ```

3. **Warehouse Manager** accepts order:
   ```
   POST /api/orders/warehouse/orders/{id}/accept/
   ```

4. **Shopkeeper** checks order status:
   ```
   GET /api/orders/shopkeeper/orders/{id}/
   ```

### Order Rejection Flow:

1. **Warehouse Manager** rejects order:
   ```
   POST /api/orders/warehouse/orders/{id}/reject/
   {
     "rejection_reason": "Insufficient stock"
   }
   ```

2. **Shopkeeper** sees rejection:
   ```
   GET /api/orders/shopkeeper/orders/{id}/
   ```
   Response includes `rejection_reason` field.

