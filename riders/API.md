# Riders App API Documentation

## Purpose
Manages rider profiles and order delivery actions.

## Endpoints
- **GET /rider/profile/**: Retrieve rider profile.
- **POST /rider/profile/**: Create rider profile.
- **PUT /rider/profile/**: Update rider profile.
- **GET /rider/orders/**: List orders assigned to rider.
- **POST /rider/orders/{order_id}/deliver/**: Mark order as delivered.

## Permissions
- Authenticated, rider role

