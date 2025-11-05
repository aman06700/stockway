# Warehouses App API Documentation

## Purpose
Manages warehouse data, provides location-based services for finding nearby warehouses, and handles warehouse-specific order management.

## Base URL
`/api/warehouses/`

## Authentication
- Bearer Token required: `Authorization: Bearer <access_token>`
- Roles: 
  - `WAREHOUSE_ADMIN` - Can manage their own warehouse and orders
  - `SUPER_ADMIN` - Can manage all warehouses
  - `SHOPKEEPER` - Can view nearby warehouses

---

## Warehouse Management Endpoints

### 1. Warehouse Onboarding (Create Warehouse + Add Inventory)
**POST** `/api/warehouses/onboarding/`

Create a new warehouse and add initial inventory in a single request.

**Authentication:** Warehouse Admin

**Request Body:**
```json
{
  "warehouse": {
    "name": "Central Delhi Warehouse",
    "address": "123 Connaught Place, New Delhi, Delhi 110001",
    "latitude": 28.6129,
    "longitude": 77.2295
  },
  "items": [
    {
      "name": "Rice Bag 5kg",
      "description": "Premium Basmati Rice",
      "sku": "RICE-5KG-001",
      "price": 450.00,
      "quantity": 500
    },
    {
      "name": "Wheat Flour 10kg",
      "description": "Whole Wheat Flour",
      "sku": "WHEAT-10KG-001",
      "price": 350.00,
      "quantity": 300
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "warehouse": {
    "id": 1,
    "name": "Central Delhi Warehouse",
    "address": "123 Connaught Place, New Delhi, Delhi 110001",
    "latitude": 28.6129,
    "longitude": 77.2295,
    "admin": 2,
    "created_at": "2025-11-04T10:30:00Z",
    "updated_at": "2025-11-04T10:30:00Z"
  },
  "items": [
    {
      "id": 1,
      "warehouse": 1,
      "name": "Rice Bag 5kg",
      "description": "Premium Basmati Rice",
      "sku": "RICE-5KG-001",
      "price": "450.00",
      "quantity": 500,
      "available": true,
      "created_at": "2025-11-04T10:30:00Z",
      "updated_at": "2025-11-04T10:30:00Z"
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Warehouse and items data are required"
}
```

---

### 2. Create Warehouse (Without Inventory)
**POST** `/api/warehouses/create/`

Create a new warehouse without adding inventory.

**Authentication:** Warehouse Admin or Super Admin

**Request Body:**
```json
{
  "name": "South Delhi Warehouse",
  "address": "456 Saket, New Delhi, Delhi 110017",
  "latitude": 28.5245,
  "longitude": 77.2066
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "name": "South Delhi Warehouse",
  "address": "456 Saket, New Delhi, Delhi 110017",
  "latitude": 28.5245,
  "longitude": 77.2066,
  "admin": 2,
  "created_at": "2025-11-04T10:35:00Z",
  "updated_at": "2025-11-04T10:35:00Z"
}
```

---

### 3. Get Warehouse Details
**GET** `/api/warehouses/{id}/`

Retrieve details of a specific warehouse.

**Authentication:** Warehouse Admin (own warehouse), Super Admin (any warehouse)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Central Delhi Warehouse",
  "address": "123 Connaught Place, New Delhi, Delhi 110001",
  "latitude": 28.6129,
  "longitude": 77.2295,
  "admin": 2,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T10:30:00Z"
}
```

---

### 4. Update Warehouse (Partial)
**PATCH** `/api/warehouses/{id}/`

Update warehouse information (partial update).

**Authentication:** Warehouse Admin (own warehouse), Super Admin (any warehouse)

**Request Body:**
```json
{
  "name": "Central Delhi Main Warehouse",
  "address": "123 Connaught Place (Updated), New Delhi, Delhi 110001"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Central Delhi Main Warehouse",
  "address": "123 Connaught Place (Updated), New Delhi, Delhi 110001",
  "latitude": 28.6129,
  "longitude": 77.2295,
  "admin": 2,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T10:40:00Z"
}
```

---

### 5. Update Warehouse (Full)
**PUT** `/api/warehouses/{id}/`

Update warehouse information (full update - all fields required).

**Authentication:** Warehouse Admin (own warehouse), Super Admin (any warehouse)

**Request Body:**
```json
{
  "name": "Central Delhi Main Warehouse",
  "address": "123 Connaught Place, New Delhi, Delhi 110001",
  "latitude": 28.6129,
  "longitude": 77.2295
}
```

---

## Warehouse Order Management Endpoints

### 6. List Warehouse Orders
**GET** `/api/warehouses/{warehouse_id}/orders/`

Get all orders for a specific warehouse.

**Authentication:** Warehouse Admin

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "shopkeeper": 3,
    "warehouse": 1,
    "status": "pending",
    "total_amount": "1250.00",
    "order_items": [
      {
        "id": 1,
        "item": 5,
        "item_name": "Rice Bag 5kg",
        "quantity": 10,
        "price": "100.00"
      }
    ],
    "created_at": "2025-11-04T09:00:00Z",
    "updated_at": "2025-11-04T09:00:00Z"
  }
]
```

---

### 7. Confirm Order
**POST** `/api/warehouses/{warehouse_id}/orders/{order_id}/confirm/`

Confirm/accept a pending order.

**Authentication:** Warehouse Admin

**Response (200 OK):**
```json
{
  "id": 1,
  "shopkeeper": 3,
  "warehouse": 1,
  "status": "accepted",
  "total_amount": "1250.00",
  "order_items": [...],
  "created_at": "2025-11-04T09:00:00Z",
  "updated_at": "2025-11-04T10:15:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Order cannot be confirmed."
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Order not found."
}
```

---

### 8. Assign Rider to Order
**POST** `/api/warehouses/{warehouse_id}/orders/{order_id}/assign/`

Assign a rider to an accepted order for delivery.

**Authentication:** Warehouse Admin

**Request Body:**
```json
{
  "rider_id": 5
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "shopkeeper": 3,
  "warehouse": 1,
  "status": "in_transit",
  "total_amount": "1250.00",
  "order_items": [...],
  "created_at": "2025-11-04T09:00:00Z",
  "updated_at": "2025-11-04T10:20:00Z"
}
```

**Error Response (400 Bad Request - Order Not Accepted):**
```json
{
  "error": "Order cannot be assigned."
}
```

**Error Response (404 Not Found - Rider Not Found):**
```json
{
  "error": "Rider not found."
}
```

**Note:** The delivery fee is automatically calculated based on the distance between the shopkeeper's location and the warehouse using the Haversine formula (10 rupees per km).

---

## Nearby Warehouse Discovery Endpoints

### 9. Find Nearby Warehouses
**GET** `/api/warehouses/nearby/`

Find warehouses near a specified GPS location.

**Authentication:** Shopkeeper

**Query Parameters:**
- `lat` (required): Latitude of customer location (-90 to 90)
- `lon` (required): Longitude of customer location (-180 to 180)
- `radius` (optional): Search radius in kilometers (default: 10, max: 1000)
- `limit` (optional): Maximum number of results (max: 100)

**Example:**
```
/api/warehouses/nearby/?lat=28.6129&lon=77.2295&radius=15&limit=5
```

**Response (200 OK):**
```json
{
  "count": 3,
  "search_location": {
    "latitude": 28.6129,
    "longitude": 77.2295
  },
  "search_radius_km": 15.0,
  "warehouses": [
    {
      "id": 1,
      "name": "Central Delhi Warehouse",
      "address": "123 Connaught Place, New Delhi, Delhi 110001",
      "latitude": 28.6129,
      "longitude": 77.2295,
      "distance_km": 0.0,
      "distance_m": 0.0,
      "created_at": "2025-11-04T10:30:00Z"
    },
    {
      "id": 3,
      "name": "East Delhi Warehouse",
      "address": "789 Laxmi Nagar, New Delhi, Delhi 110092",
      "latitude": 28.6328,
      "longitude": 77.2770,
      "distance_km": 4.82,
      "distance_m": 4820.0,
      "created_at": "2025-11-04T11:00:00Z"
    }
  ]
}
```

**Error Response (400 Bad Request - Missing Parameters):**
```json
{
  "error": "Missing required parameters",
  "detail": "Both lat and lon query parameters are required",
  "example": "/api/customers/warehouses/nearby/?lat=28.7041&lon=77.1025"
}
```

**Error Response (400 Bad Request - Invalid Coordinates):**
```json
{
  "error": "Invalid coordinates",
  "detail": "Latitude must be a valid number between -90 and 90"
}
```

**Error Response (400 Bad Request - Invalid Radius):**
```json
{
  "error": "Invalid radius",
  "detail": "Radius must be between 0 and 1000 km"
}
```

---

### 10. Get Warehouses Based on Profile Location
**GET** `/api/warehouses/proximity/`

Get the 5 nearest warehouses based on the authenticated shopkeeper's profile location.

**Authentication:** Shopkeeper (must have ShopkeeperProfile with location set)

**Response (200 OK):**
```json
{
  "warehouses": [
    {
      "id": 1,
      "name": "Central Delhi Warehouse",
      "address": "123 Connaught Place, New Delhi, Delhi 110001",
      "latitude": 28.6129,
      "longitude": 77.2295,
      "distance_km": 2.45,
      "distance_m": 2450.0,
      "created_at": "2025-11-04T10:30:00Z"
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Customer location not set or invalid"
}
```

---

## Warehouse Schema

### Warehouse Fields
- `id` (integer, read-only): Unique identifier
- `name` (string, required): Warehouse name
- `address` (string, required): Full address
- `latitude` (float, optional): GPS latitude (-90 to 90)
- `longitude` (float, optional): GPS longitude (-180 to 180)
- `admin` (integer, FK to User): Warehouse administrator
- `created_at` (datetime, read-only): Creation timestamp
- `updated_at` (datetime, read-only): Last update timestamp

### Nearby Warehouse Response Fields
- All warehouse fields above, plus:
- `distance_km` (float): Distance in kilometers (rounded to 2 decimals)
- `distance_m` (float): Distance in meters (rounded to nearest meter)

---

## Order Statuses
- `pending` - Order created, awaiting warehouse acceptance
- `accepted` - Warehouse accepted the order
- `rejected` - Warehouse rejected the order
- `in_transit` - Order assigned to rider and being delivered
- `delivered` - Order successfully delivered
- `cancelled` - Order cancelled

---

## Technical Notes

### Geographic Features
- Uses PostGIS for geographic data storage and queries
- Distance calculations use `ST_DistanceSphere` for accurate results
- Location stored as Point with SRID 4326 (WGS 84 coordinate system)
- Coordinates stored as (longitude, latitude) per PostGIS convention

### Delivery Fee Calculation
- Calculated using Haversine formula
- Distance measured between shopkeeper location and warehouse location
- Rate: ₹10 per kilometer
- Automatically created when rider is assigned to order

---

## Permissions

### Warehouse Management
- **Create Warehouse:** WAREHOUSE_ADMIN or SUPER_ADMIN
- **View Warehouse:** Warehouse owner (WAREHOUSE_ADMIN) or SUPER_ADMIN
- **Update Warehouse:** Warehouse owner (WAREHOUSE_ADMIN) or SUPER_ADMIN
- **Super Admin Note:** Can manage any warehouse and specify admin user

### Order Management
- **List Orders:** WAREHOUSE_ADMIN (own warehouse only)
- **Confirm Orders:** WAREHOUSE_ADMIN (own warehouse only)
- **Assign Riders:** WAREHOUSE_ADMIN (own warehouse only)

### Warehouse Discovery
- **Find Nearby:** SHOPKEEPER role
- **Profile-based Search:** SHOPKEEPER role with location set

---

## Error Responses

### 400 Bad Request
```json
{
  "latitude": ["Latitude must be between -90 and 90."],
  "longitude": ["Longitude must be between -180 and 180."]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## See Also
- `WAREHOUSE_POSTMAN_GUIDE.md` - Complete Postman testing guide with examples
- `shopkeepers/API.md` - Shopkeeper endpoints documentation
- `inventory/API.md` - Inventory management documentation



