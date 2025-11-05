# Payments App API Documentation

## Purpose
Tracks payments and payouts between shopkeepers, warehouses, and riders.

## Current Implementation
Currently, there are no dedicated payment management endpoints in this module. Payment viewing for shopkeepers is available through the Shopkeepers module.

## Shopkeeper Payment Endpoints
For shopkeepers to view their payment history and summary, see the Shopkeepers API documentation:

- **GET** `/api/shopkeepers/payments/` - List payment transaction history
- **GET** `/api/shopkeepers/payments/summary/` - Get payment summary with pending dues

### Payment List Query Parameters
- `status` (optional): Filter by status (pending, completed, failed)
- `start_date` (optional): Filter from this date (YYYY-MM-DD)
- `end_date` (optional): Filter until this date (YYYY-MM-DD)
- `ordering` (optional): Sort by field (e.g., `-created_at`, `amount`)
- `page`, `page_size`: Pagination parameters

### Payment Summary Response
```json
{
  "total_paid": "15000.00",
  "total_pending": "2500.00",
  "total_failed": "0.00",
  "pending_orders_count": 3,
  "completed_payments_count": 25
}
```

## Future Payment Management Endpoints (Planned)
The following endpoints may be implemented for payment processing:

- **POST** `/api/payments/create/` - Create a payment for an order
- **POST** `/api/payments/{id}/complete/` - Mark payment as completed
- **POST** `/api/payments/{id}/fail/` - Mark payment as failed
- **GET** `/api/payments/statistics/` - Payment analytics (admin only)

## Payment Types
- `shopkeeper_to_warehouse` - Payment from shopkeeper to warehouse for order
- `warehouse_to_rider` - Payout from warehouse to rider for delivery

## Payment Statuses
- `pending` - Payment initiated but not completed
- `completed` - Payment successfully completed
- `failed` - Payment failed

## Payment Schema
- Fields: `id`, `payer`, `payee`, `order`, `warehouse`, `payment_type`, `status`, `amount`, `payment_method`, `transaction_id`, `notes`, `created_at`, `completed_at`
- `payer` and `payee` are ForeignKeys to User model
- `order` is optional ForeignKey to Order model
- `warehouse` is optional ForeignKey to Warehouse model

## Permissions
- Shopkeepers can view their own payments
- Warehouse admins can view payments related to their warehouse
- Super admins can view all payments
- Role-based access control for payment creation and updates


