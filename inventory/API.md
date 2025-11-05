# Inventory App API Documentation

## Purpose
This app contains the core Item (inventory) models and business logic.

## Current Implementation
Currently, there are no dedicated inventory management endpoints in this module. Inventory browsing for shopkeepers is available through the Shopkeepers module.

## Shopkeeper Inventory Endpoints
For shopkeepers to browse inventory, see the Shopkeepers API documentation:

- **GET** `/api/shopkeepers/inventory/browse/` - Browse items from warehouses with filters and search

**Query Parameters:**
- `warehouse` (optional): Filter by warehouse ID
- `search` (optional): Search in name, description, or SKU
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `in_stock` (optional): Filter only in-stock items (true/false)
- `ordering` (optional): Sort by field (e.g., `name`, `price`, `-created_at`)

## Future Warehouse Admin Endpoints (Planned)
The following endpoints may be implemented for warehouse administrators:

- **GET** `/api/warehouses/{warehouse_id}/items/` - List items for the warehouse
- **POST** `/api/warehouses/{warehouse_id}/items/` - Create a new item
- **GET** `/api/warehouses/{warehouse_id}/items/{item_id}/` - Retrieve item details
- **PATCH** `/api/warehouses/{warehouse_id}/items/{item_id}/` - Update item (quantity, price, etc.)
- **DELETE** `/api/warehouses/{warehouse_id}/items/{item_id}/` - Delete item

## Item Schema
- Fields: `id`, `warehouse`, `name`, `description`, `sku`, `price`, `quantity`, `available`, `created_at`, `updated_at`
- Notes: 
  - `quantity` must be non-negative
  - `available` is a boolean indicating if item is available for purchase
  - `sku` should be unique per warehouse

## Permissions
- Object-level checks ensure only the owning warehouse admin (or super admin) can manage items
- Super admins may act on any warehouse
- Shopkeepers can browse items but cannot modify them

