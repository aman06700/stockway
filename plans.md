## Apps & Responsibilities

1. **users**

    * Roles: `shopkeeper`, `warehouse_admin`, `rider`, `super_admin`
    * Authentication, profile, permissions

2. **warehouses**

    * Warehouse info, location, inventory overview
    * CRUD by warehouse admins or super_admin

3. **inventory**

    * Items, stock levels, restock logs
    * Connected to warehouses

4. **orders**

    * Shopkeeper order placement
    * Warehouse order acceptance/rejection
    * Order status updates

5. **delivery**

    * Rider assignment per warehouse
    * Rider location tracking (latitude/longitude)
    * Distance calculation and payment computation

6. **payments**

    * Rider payouts
    * Warehouse settlements
    * Logs and audit

7. **core** (optional)

    * Common utilities, permissions, logging, notifications

8. **analytics** (optional later)

    * Reports: most ordered items, rider performance, warehouse metrics

---

## MVP Roadmap – Rural Supply & Delivery System (API-only, DRF)

---

### **Phase 0 – Foundations**

1. Initialize Django project with DRF.
2. Configure **PostgreSQL** (with PostGIS if using geo queries).
3. Set up Redis for caching / OTP storage.
4. Implement base project structure (modular apps per domain).

---

### **Phase 1 – Users & Auth**

1. **User Roles:** `shopkeeper`, `warehouse_admin`, `rider`, `super_admin`.
2. Implement **OTP-based authentication**:

    * `/auth/request-otp/` → generate OTP, store in Redis, send via SMS provider (Fast2SMS/MSG91).
    * `/auth/verify-otp/` → verify OTP, issue DRF token/JWT.
3. API endpoints for basic profile management per role.

---

### **Phase 2 – Warehouse & Inventory**

1. **Warehouse Model**: name, location (latitude/longitude), admin user link.
2. **Item/Inventory Model**: stock, SKU, price, warehouse FK.
3. APIs for:

    * Warehouse CRUD (admin only)
    * Inventory CRUD / stock update
4. Optional: simple search for items per warehouse.

---

### **Phase 3 – Orders**

1. **Order Model**: shopkeeper → warehouse, items, quantity, status (`pending`, `accepted`, `assigned`, `delivered`).
2. API endpoints for:

    * Shopkeeper: create order, view status
    * Warehouse: accept/reject orders
3. Validation: check inventory before accepting orders.

---

### **Phase 4 – Rider Management & Delivery**

1. **Rider Model**: linked to warehouse, status (`available`, `busy`).
2. **Delivery Assignment**:

    * Assign nearest/available rider on order acceptance.
    * Store route/distance calculation (PostGIS or haversine).
3. **Rider Payment**: calculate based on distance × rate.
4. APIs for:

    * Rider: view assigned orders, update delivery status
    * Warehouse: track rider assignments

---

### **Phase 5 – Payments & Admin**

1. **Payment Model**: rider payout logs, warehouse settlements.
2. Admin APIs:

    * Manage users, warehouses, inventory, orders
    * View payouts
3. Django admin can handle super_admin panel for MVP.

---

### **Phase 6 – Enhancements**

1. Implement caching (Redis) for:

    * Nearby warehouse search
    * Frequently accessed inventory
2. Swagger / OpenAPI docs using `drf-spectacular`.
3. Add rate-limits on OTP endpoints to prevent abuse.
4. Logging, error handling, and notifications (optional for MVP).

---

### **Phase 7 – Deployment**

1. Dockerize project.
2. Deploy backend + Postgres + Redis.
3. Test mobile app integration with OTP, order flow, and delivery tracking.
