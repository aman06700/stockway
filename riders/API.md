# Riders API Documentation

## Overview
The Riders module provides comprehensive rider management functionality integrated with warehouse and order workflows. It includes rider registration, profile management, order tracking, location updates, and automated payout calculations.

## Authentication
All endpoints require authentication via Supabase JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Rider Endpoints

### 1. Register Rider
**POST** `/api/rider/register/`

Register a new rider linked to a warehouse (warehouse_admin or super_admin only).

**Permission:** `IsAuthenticated`, `IsWarehouseAdminOrSuperAdmin`

**Request Body:**
```json
{
  "user_id": 123,
  "warehouse_id": 45,
  "status": "available"
}
```

**Response (201 Created):**
```json
{
  "id": 67,
  "user": 123,
  "warehouse": 45,
  "warehouse_id": 45,
  "warehouse_name": "Central Warehouse",
  "rider_name": "John Doe",
  "rider_email": "john@example.com",
  "status": "available",
  "current_location": null,
  "latitude": null,
  "longitude": null,
  "total_earnings": "0.00",
  "created_at": "2025-11-07T10:30:00Z",
  "updated_at": "2025-11-07T10:30:00Z"
}
```

**Validation:**
- User must exist and have RIDER role
- Warehouse must exist
- Warehouse_admin can only register riders to their own warehouse
- Super_admin can register riders to any warehouse

---

### 2. Get Rider Profile
**GET** `/api/rider/profile/`

Get the authenticated rider's profile details.

**Permission:** `IsAuthenticated`, `IsRider`

**Response (200 OK):**
```json
{
  "id": 67,
  "name": "John Doe",
  "email": "john@example.com",
  "warehouse_name": "Central Warehouse",
  "warehouse_address": "123 Main St, City",
  "status": "available",
  "current_location": "SRID=4326;POINT (77.5946 12.9716)",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "total_earnings": "1500.00",
  "created_at": "2025-11-07T10:30:00Z"
}
```

---

### 3. Update Rider Profile
**PUT** `/api/rider/profile/`

Update rider's own profile (limited fields).

**Permission:** `IsAuthenticated`, `IsRider`

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Allowed Fields:** `status` only

**Response (200 OK):**
```json
{
  "id": 67,
  "name": "John Doe",
  "email": "john@example.com",
  "warehouse_name": "Central Warehouse",
  "warehouse_address": "123 Main St, City",
  "status": "inactive",
  "current_location": "SRID=4326;POINT (77.5946 12.9716)",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "total_earnings": "1500.00",
  "created_at": "2025-11-07T10:30:00Z"
}
```

---

### 4. Get Assigned Orders
**GET** `/api/rider/orders/`

Get all orders assigned to the authenticated rider (excluding delivered orders).

**Permission:** `IsAuthenticated`, `IsRider`

**Response (200 OK):**
```json
[
  {
    "id": 101,
    "shopkeeper": 45,
    "warehouse": 12,
    "status": "in_transit",
    "total_amount": "250.00",
    "created_at": "2025-11-07T09:00:00Z",
    "updated_at": "2025-11-07T10:00:00Z"
  },
  {
    "id": 102,
    "shopkeeper": 48,
    "warehouse": 12,
    "status": "assigned",
    "total_amount": "180.00",
    "created_at": "2025-11-07T10:30:00Z",
    "updated_at": "2025-11-07T10:30:00Z"
  }
]
```

---

### 5. Update Order Status
**PATCH** `/api/rider/orders/update/`

Update order status transitions (assigned → in_transit → delivered).

**Permission:** `IsAuthenticated`, `IsRider`

**Request Body:**
```json
{
  "order_id": 101,
  "status": "in_transit"
}
```

**Valid Status Transitions:**
- `assigned` → `in_transit`
- `in_transit` → `delivered`

**Response (200 OK) - In Transit:**
```json
{
  "order_id": 101,
  "status": "in_transit",
  "message": "Order status updated to in_transit"
}
```

**Response (200 OK) - Delivered:**
```json
{
  "order_id": 101,
  "status": "delivered",
  "message": "Order status updated to delivered",
  "payout_summary": {
    "rider_id": 67,
    "total_earnings": "1550.00",
    "delivery_payout": "50.00"
  }
}
```

**Payout Calculation:**
- Base rate: ₹50.00
- Distance rate: ₹10.00 per km
- Total payout = base_rate + (distance_km × rate_per_km)
- On delivery completion:
  - Rider status set to "available"
  - Rider total_earnings updated
  - Payment record created in Payments module

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid transition from assigned to delivered",
  "detail": "Valid transitions from assigned: in_transit"
}
```

---

### 6. Update Rider Location
**PATCH** `/api/rider/location/update/`

Update rider's current GPS location.

**Permission:** `IsAuthenticated`, `IsRider`

**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Validation:**
- Latitude: -90 to 90
- Longitude: -180 to 180

**Response (200 OK):**
```json
{
  "message": "Location updated successfully",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

---

## Warehouse Admin Endpoints

### 7. List Warehouse Riders
**GET** `/api/warehouse/riders/`

List all riders for the warehouse admin's warehouses.

**Permission:** `IsAuthenticated`, `IsWarehouseAdminOrSuperAdmin`

**Query Parameters:**
- `status` (optional): Filter by rider status (available, busy, inactive)

**Response (200 OK):**
```json
[
  {
    "id": 67,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "available",
    "active_orders_count": 0,
    "total_earnings": "1550.00"
  },
  {
    "id": 68,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "status": "busy",
    "active_orders_count": 2,
    "total_earnings": "2300.00"
  }
]
```

**Notes:**
- Warehouse_admin sees only riders from their warehouses
- Super_admin sees all riders

---

### 8. Get Rider Details
**GET** `/api/warehouse/riders/{id}/`

Get detailed information about a specific rider.

**Permission:** `IsAuthenticated`, `IsWarehouseAdminOrSuperAdmin`

**Response (200 OK):**
```json
{
  "id": 67,
  "user": 123,
  "warehouse": 45,
  "warehouse_id": 45,
  "warehouse_name": "Central Warehouse",
  "rider_name": "John Doe",
  "rider_email": "john@example.com",
  "status": "available",
  "current_location": "SRID=4326;POINT (77.5946 12.9716)",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "total_earnings": "1550.00",
  "created_at": "2025-11-07T10:30:00Z",
  "updated_at": "2025-11-07T12:45:00Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "You can only view riders in your warehouse"
}
```

---

## Models

### Rider Model
```python
{
  "id": Integer,
  "user": ForeignKey(User),
  "warehouse": ForeignKey(Warehouse),
  "status": Choice["available", "busy", "inactive"],
  "current_location": PointField (PostGIS),
  "total_earnings": Decimal(10, 2),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Indexes:**
- `warehouse` + `status`
- `status`
- `user`
- `current_location` (spatial index via PostGIS)

**Constraints:**
- `total_earnings >= 0`

---

## Integration with Other Modules

### Orders Module
- Orders are assigned to riders through the Delivery model
- Riders can only view and update their assigned orders
- Order status transitions: assigned → in_transit → delivered

### Payments Module
- On delivery completion, a payment record is created:
  - `payment_type`: "warehouse_to_rider"
  - `status`: "pending"
  - `amount`: calculated payout
  - `distance_km`: distance traveled
  - Links to: order, warehouse, payer (warehouse admin), payee (rider)

### Warehouses Module
- Each rider is linked to a warehouse
- Warehouse admins can only manage riders in their warehouses
- PostGIS spatial queries for rider-warehouse distance calculations

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "detail": {
    "field_name": ["Error message"]
  }
}
```

### 403 Forbidden
```json
{
  "error": "Permission denied message"
}
```

### 404 Not Found
```json
{
  "error": "Rider profile not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Operation failed",
  "detail": "Error description"
}
```

---

## PostGIS Features

### Location Tracking
- Riders' locations stored as PostGIS PointField (SRID 4326)
- Enables spatial queries for distance calculations
- Coordinates validated: latitude (-90 to 90), longitude (-180 to 180)

### Distance Calculation
- Distance between rider and warehouse calculated using PostGIS
- Used for payout calculation
- Distance in meters converted to kilometers

---

## Security

### Authentication
- All endpoints require Supabase JWT authentication
- Role-based access control via custom permission classes

### Permissions
- **Riders:** Can only access their own profile and assigned orders
- **Warehouse Admins:** Can register and view riders within their warehouse
- **Super Admins:** Full access to all riders

### Data Validation
- User must have RIDER role for registration
- Warehouse ownership validated for warehouse admins
- Order ownership validated for status updates
- GPS coordinates validated for valid ranges

---

## Usage Examples

### Register a Rider (Warehouse Admin)
```bash
curl -X POST https://api.example.com/api/rider/register/ \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "warehouse_id": 45,
    "status": "available"
  }'
```

### Update Order Status to Delivered
```bash
curl -X PATCH https://api.example.com/api/rider/orders/update/ \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 101,
    "status": "delivered"
  }'
```

### Update Location
```bash
curl -X PATCH https://api.example.com/api/rider/location/update/ \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

---

## Notes

- Rider status automatically updated:
  - "busy" when order assigned (handled by warehouse admin)
  - "available" when order delivered
- Earnings automatically accumulated on delivery completion
- Payment records created automatically for warehouse admin to process
- Location updates are optional but recommended for accurate distance calculation
- All monetary values in INR (₹)

