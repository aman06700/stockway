# Payments App API Documentation

## Purpose
Tracks payments and payouts between shopkeepers, warehouses, and riders.

## Endpoints
- **GET /payments/**: List payments (role-based filtering).
- **POST /payments/shopkeeper-payment/**: Shopkeeper pays warehouse for an order.
- **POST /payments/rider-payout/**: Warehouse admin creates payout for rider.
- **PATCH /payments/{id}/complete/**: Mark payment as completed (mock).
- **PATCH /payments/{id}/fail/**: Mark payment as failed.
- **GET /payments/statistics/**: Payment analytics.

## Permissions
- Authenticated, role-based access

