-- ============================================================================
-- SUPABASE OPTIMIZATION ROLLBACK SCRIPT
-- Use this to revert changes if needed
-- ============================================================================

-- ============================================================================
-- 1. DISABLE ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE riders DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeeper_notifications DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP ALL RLS POLICIES
-- ============================================================================

-- User policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Order policies
DROP POLICY IF EXISTS "Shopkeeper read own orders" ON orders;
DROP POLICY IF EXISTS "Shopkeeper create orders" ON orders;
DROP POLICY IF EXISTS "Warehouse read assigned orders" ON orders;
DROP POLICY IF EXISTS "Warehouse update assigned orders" ON orders;
DROP POLICY IF EXISTS "Rider read assigned orders" ON orders;
DROP POLICY IF EXISTS "Admin full access orders" ON orders;

-- Payment policies
DROP POLICY IF EXISTS "Shopkeeper read own payments" ON payments;
DROP POLICY IF EXISTS "Warehouse read received payments" ON payments;
DROP POLICY IF EXISTS "Admin full access payments" ON payments;

-- Warehouse policies
DROP POLICY IF EXISTS "Warehouse admin read own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Warehouse admin update own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Admin full access warehouses" ON warehouses;

-- Rider policies
DROP POLICY IF EXISTS "Rider read own profile" ON riders;
DROP POLICY IF EXISTS "Rider update own profile" ON riders;
DROP POLICY IF EXISTS "Warehouse admin read assigned riders" ON riders;
DROP POLICY IF EXISTS "Admin full access riders" ON riders;

-- Notification policies
DROP POLICY IF EXISTS "Users read own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Warehouse read own notifications" ON warehouse_notifications;
DROP POLICY IF EXISTS "Shopkeeper read own notifications" ON shopkeeper_notifications;

-- ============================================================================
-- 3. DROP OPTIMIZED INDEXES (Keep original Django indexes)
-- ============================================================================

DROP INDEX CONCURRENTLY IF EXISTS users_role_active_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_warehouse_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_shopkeeper_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_status_created_idx;
DROP INDEX CONCURRENTLY IF EXISTS orders_warehouse_created_idx;
DROP INDEX CONCURRENTLY IF EXISTS payments_order_payer_idx;
DROP INDEX CONCURRENTLY IF EXISTS payments_payer_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS payments_payee_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS payments_created_idx;
DROP INDEX CONCURRENTLY IF EXISTS user_notifications_user_read_idx;
DROP INDEX CONCURRENTLY IF EXISTS user_notifications_user_created_idx;
DROP INDEX CONCURRENTLY IF EXISTS warehouse_notifications_warehouse_read_idx;
DROP INDEX CONCURRENTLY IF EXISTS riders_location_gist_idx;
DROP INDEX CONCURRENTLY IF EXISTS riders_warehouse_status_idx;
DROP INDEX CONCURRENTLY IF EXISTS riders_availability_idx;
DROP INDEX CONCURRENTLY IF EXISTS warehouses_location_gist_idx;
DROP INDEX CONCURRENTLY IF EXISTS warehouses_active_approved_idx;
DROP INDEX CONCURRENTLY IF EXISTS analytics_summary_type_date_idx;
DROP INDEX CONCURRENTLY IF EXISTS analytics_summary_type_id_date_idx;

-- ============================================================================
-- 4. DROP HELPER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS find_nearby_warehouses(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS find_nearby_riders(integer, double precision);

-- ============================================================================
-- 5. DROP OPTIMIZED TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_order_timestamp ON orders;
DROP TRIGGER IF EXISTS update_payment_timestamp ON payments;
DROP TRIGGER IF EXISTS update_warehouse_timestamp ON warehouses;
DROP TRIGGER IF EXISTS update_rider_timestamp ON riders;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Rollback complete - database restored to pre-optimization state';
END $$;

