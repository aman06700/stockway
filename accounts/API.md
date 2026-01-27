# Accounts API Documentation

## Authentication Endpoints

All authentication is handled through Supabase using email and password.

### Base URL
```
/api/auth/
```

### Notes
- Authentication uses Supabase email/password sign-up and sign-in
- JWT tokens are managed by Supabase
- Token refresh is handled automatically by the Supabase client on the frontend
- Backend validates Supabase JWTs for all authenticated requests

---

## 1. Sign Up

Create a new user account with email and password.

**Endpoint:** `POST /api/auth/signup/`

**Authentication:** None required

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "confirm_password": "secure_password"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 36000,
  "expires_at": 1698432000,
  "token_type": "bearer",
  "user": {
    "id": 1,
    "phone_number": null,
    "email": "user@example.com",
    "full_name": "",
    "role": "PENDING",
    "is_active": true,
    "date_joined": "2025-10-30T10:30:00Z",
    "last_login": null
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": {
    "password": ["Password must be at least 6 characters"],
    "confirm_password": ["Passwords do not match"]
  }
}
```

---

## 2. Sign In

Authenticate with email and password.

**Endpoint:** `POST /api/auth/signin/`

**Authentication:** None required

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 36000,
  "expires_at": 1698432000,
  "token_type": "bearer",
  "user": {
    "id": 1,
    "phone_number": null,
    "email": "user@example.com",
    "full_name": "",
    "role": "SHOPKEEPER",
    "is_active": true,
    "date_joined": "2025-10-27T10:30:00Z",
    "last_login": "2025-10-27T11:00:00Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Error Response (403 Forbidden - Inactive/Deleted User):**
```json
{
  "error": "Account is deactivated"
}
```

---
## 3. Logout

Invalidate the current session.

**Endpoint:** `POST /api/auth/logout/`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 4. Get Current User

Get the currently authenticated user's details.

**Endpoint:** `GET /api/auth/me/`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "phone_number": "+1234567890",
  "email": null,
  "full_name": "",
  "role": "SHOPKEEPER",
  "is_active": true,
  "date_joined": "2025-10-27T10:30:00Z",
  "last_login": "2025-10-27T11:00:00Z"
}
```

---

## Authentication Flow

### Sign Up
1. User provides email, password, and confirmation
2. Call `POST /api/auth/signup/` with credentials
3. Account is created with PENDING role
4. Store `access_token` and `refresh_token` on client
5. Admin must assign proper role before user can access features

### Sign In
1. User provides email and password
2. Call `POST /api/auth/signin/` with credentials
3. Store `access_token` and `refresh_token` on client
4. User is authenticated and can access features based on role

### Authenticated Requests
Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Refresh
- Token refresh is handled automatically by the Supabase client SDK
- The SDK will automatically refresh expired tokens before making requests
- No manual token refresh endpoint is needed on the backend

### Logout
Call `POST /api/auth/logout/` with the access token in the Authorization header

---

## Email Format

All emails must be valid email addresses in standard format.

Examples:
- `user@example.com`
- `john.doe@company.co.uk`
- `contact+test@domain.org`

---

## User Roles

- `PENDING` - New user awaiting role assignment (default)
- `SHOPKEEPER` - Shop owner
- `RIDER` - Delivery rider
- `WAREHOUSE_MANAGER` - Warehouse manager
- `ADMIN` - System administrator

**Note:** New users are assigned PENDING role by default. An administrator must assign the appropriate role before the user can access role-specific features.

---

## Technical Implementation

### User Model Structure
- **USERNAME_FIELD**: `email`
- **Primary Identifier**: Email address
- **Authentication Method**: Email/password via Supabase
- **User String Representation**: Returns `email` or `phone_number` or `id`
- **Available Methods**:
  - `get_full_name()` - Returns `full_name` or `email`
  - `get_short_name()` - Returns `email`

### ShopkeeperProfile Model
- **Relationship**: OneToOne with User model
- **Location Field**: PostGIS PointField for geographic coordinates
- **Key Fields**: `shop_name`, `shop_address`, `location`, `gst_number`, `is_verified`
- **Table Name**: `shopkeeper_profiles`

### Database Schema
- **Users Table**: `users` (custom table name, not `auth_user`)
- **Location Fields**: Use PostGIS geography type (SRID 4326)
- **Indexes**: Created on `email`, `phone_number` and `supabase_uid` for performance


