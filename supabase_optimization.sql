-- ============================================================================
-- SUPABASE DATABASE OPTIMIZATION SCRIPT
-- Addresses: RLS, Duplicate Indexes, Performance, Schema Consistency
-- ============================================================================

-- ============================================================================
-- 1. ROW-LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable RLS on user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeeper_notifications ENABLE ROW LEVEL SECURITY;

-- Disable RLS on internal/computed tables
ALTER TABLE analytics_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to ensure clean slate)
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

DROP POLICY IF EXISTS "Shopkeeper read own orders" ON orders;
DROP POLICY IF EXISTS "Shopkeeper create orders" ON orders;
DROP POLICY IF EXISTS "Warehouse read assigned orders" ON orders;
DROP POLICY IF EXISTS "Warehouse update assigned orders" ON orders;
DROP POLICY IF EXISTS "Rider read assigned orders" ON orders;
DROP POLICY IF EXISTS "Admin full access orders" ON orders;

DROP POLICY IF EXISTS "Shopkeeper read own payments" ON payments;
DROP POLICY IF EXISTS "Warehouse read received payments" ON payments;
DROP POLICY IF EXISTS "Admin full access payments" ON payments;

DROP POLICY IF EXISTS "Warehouse admin read own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Warehouse admin update own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Admin full access warehouses" ON warehouses;

DROP POLICY IF EXISTS "Rider read own profile" ON riders;
DROP POLICY IF EXISTS "Rider update own profile" ON riders;
DROP POLICY IF EXISTS "Warehouse admin read assigned riders" ON riders;
DROP POLICY IF EXISTS "Admin full access riders" ON riders;

DROP POLICY IF EXISTS "Users read own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Warehouse read own notifications" ON warehouse_notifications;
DROP POLICY IF EXISTS "Shopkeeper read own notifications" ON shopkeeper_notifications;

-- ============================================================================
-- USER POLICIES
-- ============================================================================

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (id = auth.uid()::integer OR supabase_uid = auth.uid()::text);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid()::integer OR supabase_uid = auth.uid()::text);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
ON users FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE (id = auth.uid()::integer OR supabase_uid = auth.uid()::text)
        AND role = 'ADMIN'
    )
);

-- ============================================================================
-- ORDER POLICIES
-- ============================================================================

-- Shopkeepers can read their own orders
CREATE POLICY "Shopkeeper read own orders"
ON orders FOR SELECT
USING (
    shopkeeper_id = auth.uid()::integer
    OR shopkeeper_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Shopkeepers can create orders
CREATE POLICY "Shopkeeper create orders"
ON orders FOR INSERT
WITH CHECK (
    shopkeeper_id = auth.uid()::integer
    OR shopkeeper_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Warehouse admins can read orders assigned to their warehouses
CREATE POLICY "Warehouse read assigned orders"
ON orders FOR SELECT
USING (
    warehouse_id IN (
        SELECT id FROM warehouses
        WHERE admin_id = auth.uid()::integer
        OR admin_id IN (
            SELECT id FROM users WHERE supabase_uid = auth.uid()::text
        )
    )
);

-- Warehouse admins can update orders assigned to their warehouses
CREATE POLICY "Warehouse update assigned orders"
ON orders FOR UPDATE
USING (
    warehouse_id IN (
        SELECT id FROM warehouses
        WHERE admin_id = auth.uid()::integer
        OR admin_id IN (
            SELECT id FROM users WHERE supabase_uid = auth.uid()::text
        )
    )
);

-- Riders can read orders assigned to them
CREATE POLICY "Rider read assigned orders"
ON orders FOR SELECT
USING (
    id IN (
        SELECT order_id FROM delivery_delivery
        WHERE rider_id = auth.uid()::integer
        OR rider_id IN (
            SELECT id FROM users WHERE supabase_uid = auth.uid()::text
        )
    )
);

-- Admins have full access to orders
CREATE POLICY "Admin full access orders"
ON orders FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE (id = auth.uid()::integer OR supabase_uid = auth.uid()::text)
        AND role = 'ADMIN'
    )
);

-- ============================================================================
-- PAYMENT POLICIES
-- ============================================================================

-- Shopkeepers can read their own payments
CREATE POLICY "Shopkeeper read own payments"
ON payments FOR SELECT
USING (
    payer_id = auth.uid()::integer
    OR payer_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Warehouse admins can read payments for their warehouses
CREATE POLICY "Warehouse read received payments"
ON payments FOR SELECT
USING (
    payee_id = auth.uid()::integer
    OR payee_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
    OR order_id IN (
        SELECT id FROM orders
        WHERE warehouse_id IN (
            SELECT id FROM warehouses
            WHERE admin_id = auth.uid()::integer
            OR admin_id IN (
                SELECT id FROM users WHERE supabase_uid = auth.uid()::text
            )
        )
    )
);

-- Admins have full access to payments
CREATE POLICY "Admin full access payments"
ON payments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE (id = auth.uid()::integer OR supabase_uid = auth.uid()::text)
        AND role = 'ADMIN'
    )
);

-- ============================================================================
-- WAREHOUSE POLICIES
-- ============================================================================

-- Warehouse admins can read their own warehouses
CREATE POLICY "Warehouse admin read own warehouses"
ON warehouses FOR SELECT
USING (
    admin_id = auth.uid()::integer
    OR admin_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Warehouse admins can update their own warehouses
CREATE POLICY "Warehouse admin update own warehouses"
ON warehouses FOR UPDATE
USING (
    admin_id = auth.uid()::integer
    OR admin_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Admins have full access to warehouses
CREATE POLICY "Admin full access warehouses"
ON warehouses FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE (id = auth.uid()::integer OR supabase_uid = auth.uid()::text)
        AND role = 'ADMIN'
    )
);

-- ============================================================================
-- RIDER POLICIES
-- ============================================================================

-- Riders can read their own profile
CREATE POLICY "Rider read own profile"
ON riders FOR SELECT
USING (
    user_id = auth.uid()::integer
    OR user_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Riders can update their own profile
CREATE POLICY "Rider update own profile"
ON riders FOR UPDATE
USING (
    user_id = auth.uid()::integer
    OR user_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Warehouse admins can read riders assigned to their warehouses
CREATE POLICY "Warehouse admin read assigned riders"
ON riders FOR SELECT
USING (
    warehouse_id IN (
        SELECT id FROM warehouses
        WHERE admin_id = auth.uid()::integer
        OR admin_id IN (
            SELECT id FROM users WHERE supabase_uid = auth.uid()::text
        )
    )
);

-- Admins have full access to riders
CREATE POLICY "Admin full access riders"
ON riders FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE (id = auth.uid()::integer OR supabase_uid = auth.uid()::text)
        AND role = 'ADMIN'
    )
);

-- ============================================================================
-- NOTIFICATION POLICIES
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY "Users read own notifications"
ON user_notifications FOR SELECT
USING (
    user_id = auth.uid()::integer
    OR user_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
ON user_notifications FOR UPDATE
USING (
    user_id = auth.uid()::integer
    OR user_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- Warehouse admins can read their warehouse notifications
CREATE POLICY "Warehouse read own notifications"
ON warehouse_notifications FOR SELECT
USING (
    warehouse_id IN (
        SELECT id FROM warehouses
        WHERE admin_id = auth.uid()::integer
        OR admin_id IN (
            SELECT id FROM users WHERE supabase_uid = auth.uid()::text
        )
    )
);

-- Shopkeepers can read their own notifications
CREATE POLICY "Shopkeeper read own notifications"
ON shopkeeper_notifications FOR SELECT
USING (
    user_id = auth.uid()::integer
    OR user_id IN (
        SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
);

-- ============================================================================
-- 2. IDENTIFY AND DROP REDUNDANT INDEXES
-- ============================================================================

-- Drop unused indexes (0 scans)
-- Note: Run this query first to identify unused indexes:
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0 AND schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Drop redundant single-column indexes where composite indexes exist
DROP INDEX CONCURRENTLY IF EXISTS users_phone_number_idx;
DROP INDEX CONCURRENTLY IF EXISTS users_supabase_uid_idx;
DROP INDEX CONCURRENTLY IF EXISTS users_email_idx;

-- Keep composite indexes, drop overlapping single ones
DROP INDEX CONCURRENTLY IF EXISTS orders_shopkeeper_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_warehouse_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_created_at_idx;

-- Drop redundant payment indexes
DROP INDEX CONCURRENTLY IF EXISTS payments_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS payments_payer_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS payments_payee_id_idx;

-- Drop redundant notification indexes
DROP INDEX CONCURRENTLY IF EXISTS user_notifications_user_id_idx;
DROP INDEX CONCURRENTLY IF EXISTS user_notifications_type_idx;
DROP INDEX CONCURRENTLY IF EXISTS user_notifications_is_read_idx;
DROP INDEX CONCURRENTLY IF EXISTS user_notifications_created_at_idx;

-- ============================================================================
-- 3. CREATE ESSENTIAL COMPOSITE INDEXES
-- ============================================================================

-- Users table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_email_unique ON users(email);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_phone_number_unique ON users(phone_number) WHERE phone_number IS NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_supabase_uid_unique ON users(supabase_uid) WHERE supabase_uid IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS users_role_active_idx ON users(role, is_active);

-- Orders table - optimized composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_warehouse_status_idx ON orders(warehouse_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_shopkeeper_status_idx ON orders(shopkeeper_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_status_created_idx ON orders(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_warehouse_created_idx ON orders(warehouse_id, created_at DESC);

-- Payments table - optimized composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS payments_order_payer_idx ON payments(order_id, payer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS payments_payer_status_idx ON payments(payer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS payments_payee_status_idx ON payments(payee_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS payments_created_idx ON payments(created_at DESC);

-- Notifications table - optimized composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_notifications_user_read_idx ON user_notifications(user_id, is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS user_notifications_user_created_idx ON user_notifications(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS warehouse_notifications_warehouse_read_idx ON warehouse_notifications(warehouse_id, is_read);

-- Riders table - PostGIS spatial index
CREATE INDEX CONCURRENTLY IF NOT EXISTS riders_location_gist_idx ON riders USING GIST(current_location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS riders_warehouse_status_idx ON riders(warehouse_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS riders_availability_idx ON riders(availability, is_suspended);

-- Warehouses table - PostGIS spatial index
CREATE INDEX CONCURRENTLY IF NOT EXISTS warehouses_location_gist_idx ON warehouses USING GIST(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS warehouses_active_approved_idx ON warehouses(is_active, is_approved);

-- Analytics table
CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_summary_type_date_idx ON analytics_summary(ref_type, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_summary_type_id_date_idx ON analytics_summary(ref_type, ref_id, date DESC);

-- ============================================================================
-- 4. SCHEMA CONSISTENCY - DATA TYPE ALIGNMENT
-- ============================================================================

-- Ensure all monetary fields use numeric(10,2)
ALTER TABLE orders ALTER COLUMN total_amount TYPE numeric(10,2);
ALTER TABLE payments ALTER COLUMN amount TYPE numeric(10,2);
ALTER TABLE payments_payout ALTER COLUMN rate_per_km TYPE numeric(6,2);
ALTER TABLE payments_payout ALTER COLUMN computed_amount TYPE numeric(10,2);
ALTER TABLE riders ALTER COLUMN total_earnings TYPE numeric(10,2);
ALTER TABLE delivery_delivery ALTER COLUMN delivery_fee TYPE numeric(10,2);
ALTER TABLE inventory_item ALTER COLUMN price TYPE numeric(10,2);
ALTER TABLE order_items ALTER COLUMN price TYPE numeric(10,2);

-- Ensure foreign key constraints have proper ON DELETE behavior
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shopkeeper_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_shopkeeper_id_fkey
    FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_warehouse_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_warehouse_id_fkey
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payer_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_payer_id_fkey
    FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payee_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_payee_id_fkey
    FOREIGN KEY (payee_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE riders DROP CONSTRAINT IF EXISTS riders_user_id_fkey;
ALTER TABLE riders ADD CONSTRAINT riders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE riders DROP CONSTRAINT IF EXISTS riders_warehouse_id_fkey;
ALTER TABLE riders ADD CONSTRAINT riders_warehouse_id_fkey
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;

ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_admin_id_fkey;
ALTER TABLE warehouses ADD CONSTRAINT warehouses_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_notifications DROP CONSTRAINT IF EXISTS user_notifications_user_id_fkey;
ALTER TABLE user_notifications ADD CONSTRAINT user_notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- 5. PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Create helper function for distance-based queries
CREATE OR REPLACE FUNCTION find_nearby_warehouses(lat double precision, lng double precision, radius_km double precision)
RETURNS TABLE(id integer, name varchar, distance_km double precision) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.name,
        ST_Distance(w.location::geography, ST_MakePoint(lng, lat)::geography) / 1000 AS distance_km
    FROM warehouses w
    WHERE w.is_active = true
      AND w.is_approved = true
      AND ST_DWithin(w.location::geography, ST_MakePoint(lng, lat)::geography, radius_km * 1000)
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create helper function for finding nearby riders
CREATE OR REPLACE FUNCTION find_nearby_riders(warehouse_id integer, radius_km double precision)
RETURNS TABLE(id integer, user_id integer, distance_km double precision) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.user_id,
        ST_Distance(r.current_location::geography, w.location::geography) / 1000 AS distance_km
    FROM riders r
    JOIN warehouses w ON w.id = warehouse_id
    WHERE r.warehouse_id = warehouse_id
      AND r.status = 'available'
      AND r.is_suspended = false
      AND r.current_location IS NOT NULL
      AND ST_DWithin(r.current_location::geography, w.location::geography, radius_km * 1000)
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- Run maintenance on critical tables
VACUUM ANALYZE users;
VACUUM ANALYZE orders;
VACUUM ANALYZE payments;
VACUUM ANALYZE warehouses;
VACUUM ANALYZE riders;
VACUUM ANALYZE user_notifications;

-- ============================================================================
-- 6. TABLE PARTITIONING FOR LARGE TABLES
-- ============================================================================

-- Partition notifications by month (declarative partitioning)
-- Note: This requires recreating the table, so backup data first

-- Create partitioned notifications table
DO $$
BEGIN
    -- Only partition if table is large enough
    IF (SELECT COUNT(*) FROM user_notifications) > 100000 THEN
        -- Rename existing table
        ALTER TABLE IF EXISTS user_notifications RENAME TO user_notifications_old;

        -- Create new partitioned table
        CREATE TABLE user_notifications (
            id SERIAL,
            user_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(20) NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id, created_at)
        ) PARTITION BY RANGE (created_at);

        -- Create partitions for recent months
        CREATE TABLE user_notifications_2025_11 PARTITION OF user_notifications
            FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
        CREATE TABLE user_notifications_2025_12 PARTITION OF user_notifications
            FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
        CREATE TABLE user_notifications_2026_01 PARTITION OF user_notifications
            FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

        -- Copy data from old table
        INSERT INTO user_notifications SELECT * FROM user_notifications_old;

        -- Recreate indexes
        CREATE INDEX user_notifications_user_read_idx ON user_notifications(user_id, is_read);
        CREATE INDEX user_notifications_user_created_idx ON user_notifications(user_id, created_at DESC);

        -- Drop old table
        DROP TABLE user_notifications_old;
    END IF;
END $$;

-- ============================================================================
-- 7. TRIGGER OPTIMIZATION
-- ============================================================================

-- Remove duplicate triggers if they exist
DROP TRIGGER IF EXISTS update_order_timestamp ON orders;
DROP TRIGGER IF EXISTS update_payment_timestamp ON payments;
DROP TRIGGER IF EXISTS update_warehouse_timestamp ON warehouses;
DROP TRIGGER IF EXISTS update_rider_timestamp ON riders;

-- Create efficient update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger only to necessary tables
CREATE TRIGGER update_order_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_timestamp
    BEFORE UPDATE ON payments
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_timestamp
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rider_timestamp
    BEFORE UPDATE ON riders
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SECURITY AND ACCESS ROLES
-- ============================================================================

-- Create database roles (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END $$;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON users, warehouses, inventory_item TO anon;

-- ============================================================================
-- 9. ADDITIONAL CONSTRAINTS
-- ============================================================================

-- Add missing check constraints
ALTER TABLE orders ADD CONSTRAINT orders_total_amount_check
    CHECK (total_amount >= 0);

ALTER TABLE payments ADD CONSTRAINT payments_amount_check
    CHECK (amount >= 0);

ALTER TABLE riders ADD CONSTRAINT riders_total_earnings_check
    CHECK (total_earnings >= 0);

ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check
    CHECK (quantity >= 1);

ALTER TABLE order_items ADD CONSTRAINT order_items_price_check
    CHECK (price >= 0);

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Refresh statistics after all changes
ANALYZE;

-- Output completion message
DO $$
BEGIN
    RAISE NOTICE 'Supabase optimization complete!';
    RAISE NOTICE '- RLS enabled on user-facing tables';
    RAISE NOTICE '- Redundant indexes removed';
    RAISE NOTICE '- Essential composite indexes created';
    RAISE NOTICE '- Schema consistency enforced';
    RAISE NOTICE '- Performance optimizations applied';
    RAISE NOTICE '- Security roles configured';
END $$;

