# Inventory App API Documentation

## Purpose
Manages inventory items for warehouses. Only warehouse admins and super admins can create, update, or view items for their warehouses.

## Endpoints

### 1. List & Create Items
**URL:** `/inventory/warehouse/<warehouse_id>/items/`
- **GET**: List all items in the specified warehouse.
- **POST**: Create a new item in the specified warehouse.
- **Permissions**: Warehouse admin for the warehouse or super admin.
- **Request Body (POST)**:
  ```json
  {
    "name": "Item Name",
    "quantity": 100,
    "description": "Details about the item"
  }
  ```

### 2. Retrieve & Update Item
**URL:** `/inventory/warehouse/<warehouse_id>/items/<item_id>/`
- **GET**: Retrieve details of a specific item in the warehouse.
- **PATCH/PUT**: Update item details (e.g., quantity, description).
- **Permissions**: Warehouse admin for the warehouse or super admin.
- **Request Body (PATCH/PUT)**:
  ```json
  {
    "quantity": 120
  }
  ```

## Permissions
- Only warehouse admins and super admins can access these endpoints.
- Object-level permissions ensure users can only manage items in their own warehouses unless they are super admins.

## Notes
- All endpoints require authentication.
- Quantity updates are validated to prevent negative values.

