# Warehouses App API Documentation

## Purpose
Manages warehouse creation, onboarding, and inventory management.

## Endpoints
- **POST /warehouse/onboarding/**: Create warehouse and add inventory (warehouse admin).
- **POST /warehouse/create/**: Create warehouse (warehouse admin or super admin).
- **Other endpoints**: Warehouse retrieval, update, and inventory management (see serializers).

## Permissions
- Authenticated, warehouse admin or super admin
# Accounts App API Documentation

## Purpose
Handles user authentication, OTP verification, and profile management.

## Endpoints
- **POST /auth/request-otp/**: Request OTP for phone number verification.
- **POST /auth/verify-otp/**: Verify OTP and authenticate user.
- **Other endpoints**: User profile management, shopkeeper profile creation (see serializers).

## Permissions
- OTP endpoints: Public
- Profile actions: Authenticated

