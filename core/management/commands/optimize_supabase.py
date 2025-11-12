"""
Django management command to apply Supabase database optimizations.
This command applies RLS policies, optimizes indexes, and ensures schema consistency.
"""
from django.core.management.base import BaseCommand
from django.db import connection
from pathlib import Path
import time


class Command(BaseCommand):
    help = 'Apply Supabase database optimizations (RLS, indexes, performance)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually doing it',
        )
        parser.add_argument(
            '--verify-only',
            action='store_true',
            help='Only verify current state without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        verify_only = options['verify_only']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))

        if verify_only:
            self.stdout.write(self.style.WARNING('VERIFY ONLY MODE - Checking current state'))
            self.verify_database_state()
            return

        self.stdout.write(self.style.SUCCESS('Starting Supabase database optimization...'))

        # Read the SQL file
        sql_file = Path(__file__).resolve().parent.parent.parent.parent / 'supabase_optimization.sql'

        if not sql_file.exists():
            self.stdout.write(self.style.ERROR(f'SQL file not found: {sql_file}'))
            return

        with open(sql_file, 'r') as f:
            sql_content = f.read()

        if dry_run:
            self.stdout.write(self.style.WARNING('Would execute the following SQL:'))
            self.stdout.write(sql_content[:500] + '...\n(truncated)')
            return

        # Execute the SQL
        try:
            with connection.cursor() as cursor:
                self.stdout.write('Executing optimization script...')
                start_time = time.time()

                cursor.execute(sql_content)

                elapsed = time.time() - start_time
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Optimization completed successfully in {elapsed:.2f} seconds'
                ))

            # Verify the changes
            self.stdout.write('\nVerifying changes...')
            self.verify_database_state()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error executing optimization: {str(e)}'))
            raise

    def verify_database_state(self):
        """Verify that optimizations were applied correctly."""
        with connection.cursor() as cursor:
            # Check RLS status
            self.stdout.write(self.style.HTTP_INFO('\n1. Row-Level Security Status:'))
            cursor.execute("""
                SELECT tablename, rowsecurity 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename IN (
                    'users', 'warehouses', 'riders', 'orders', 'payments',
                    'user_notifications', 'warehouse_notifications', 'shopkeeper_notifications',
                    'analytics_summary', 'order_items'
                )
                ORDER BY tablename;
            """)

            for table, rls_enabled in cursor.fetchall():
                status = '✓ ENABLED' if rls_enabled else '✗ DISABLED'
                color = self.style.SUCCESS if rls_enabled else self.style.WARNING

                # Analytics and order_items should NOT have RLS
                if table in ['analytics_summary', 'order_items']:
                    status = '✓ DISABLED' if not rls_enabled else '✗ ENABLED'
                    color = self.style.SUCCESS if not rls_enabled else self.style.WARNING

                self.stdout.write(f'  {table.ljust(30)} {color(status)}')

            # Check RLS policies count
            self.stdout.write(self.style.HTTP_INFO('\n2. RLS Policies Count:'))
            cursor.execute("""
                SELECT schemaname, tablename, COUNT(*) as policy_count
                FROM pg_policies
                WHERE schemaname = 'public'
                GROUP BY schemaname, tablename
                ORDER BY tablename;
            """)

            for schema, table, count in cursor.fetchall():
                self.stdout.write(f'  {table.ljust(30)} {count} policies')

            # Check for duplicate indexes
            self.stdout.write(self.style.HTTP_INFO('\n3. Checking for Duplicate Indexes:'))
            cursor.execute("""
                SELECT 
                    tablename,
                    COUNT(*) as index_count,
                    array_agg(indexname) as indexes
                FROM pg_indexes
                WHERE schemaname = 'public'
                GROUP BY tablename, indexdef
                HAVING COUNT(*) > 1;
            """)

            duplicates = cursor.fetchall()
            if duplicates:
                self.stdout.write(self.style.WARNING(f'  Found {len(duplicates)} duplicate index groups'))
                for table, count, indexes in duplicates[:5]:
                    self.stdout.write(f'    {table}: {indexes}')
            else:
                self.stdout.write(self.style.SUCCESS('  ✓ No duplicate indexes found'))

            # Check unused indexes
            self.stdout.write(self.style.HTTP_INFO('\n4. Unused Indexes (0 scans):'))
            cursor.execute("""
                SELECT 
                    schemaname, 
                    tablename, 
                    indexname, 
                    idx_scan
                FROM pg_stat_user_indexes
                WHERE schemaname = 'public' 
                AND idx_scan = 0
                AND indexname NOT LIKE '%_pkey'
                ORDER BY tablename, indexname
                LIMIT 10;
            """)

            unused = cursor.fetchall()
            if unused:
                self.stdout.write(self.style.WARNING(f'  Found {len(unused)} unused indexes'))
                for schema, table, index, scans in unused:
                    self.stdout.write(f'    {table}.{index}')
            else:
                self.stdout.write(self.style.SUCCESS('  ✓ All indexes are being used'))

            # Check spatial indexes
            self.stdout.write(self.style.HTTP_INFO('\n5. PostGIS Spatial Indexes:'))
            cursor.execute("""
                SELECT 
                    tablename, 
                    indexname
                FROM pg_indexes
                WHERE schemaname = 'public'
                AND indexdef LIKE '%USING gist%'
                ORDER BY tablename;
            """)

            spatial = cursor.fetchall()
            if spatial:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Found {len(spatial)} spatial indexes'))
                for table, index in spatial:
                    self.stdout.write(f'    {table}.{index}')
            else:
                self.stdout.write(self.style.WARNING('  ✗ No spatial indexes found'))

            # Check composite indexes
            self.stdout.write(self.style.HTTP_INFO('\n6. Essential Composite Indexes:'))
            cursor.execute("""
                SELECT 
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE schemaname = 'public'
                AND tablename IN ('orders', 'payments', 'user_notifications')
                AND indexname LIKE '%_idx'
                ORDER BY tablename, indexname;
            """)

            composite = cursor.fetchall()
            self.stdout.write(self.style.SUCCESS(f'  Found {len(composite)} indexes on critical tables'))

            # Check data type consistency
            self.stdout.write(self.style.HTTP_INFO('\n7. Decimal Field Data Types:'))
            cursor.execute("""
                SELECT 
                    table_name,
                    column_name,
                    data_type,
                    numeric_precision,
                    numeric_scale
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND column_name IN ('total_amount', 'amount', 'price', 'computed_amount', 'total_earnings', 'delivery_fee', 'rate_per_km')
                ORDER BY table_name, column_name;
            """)

            for table, column, dtype, precision, scale in cursor.fetchall():
                status = '✓' if dtype == 'numeric' and precision == 10 and scale == 2 else '✗'
                color = self.style.SUCCESS if status == '✓' else self.style.WARNING
                self.stdout.write(
                    f'  {color(status)} {table}.{column.ljust(20)} {dtype}({precision},{scale})'
                )

            # Check foreign key constraints
            self.stdout.write(self.style.HTTP_INFO('\n8. Foreign Key Constraints:'))
            cursor.execute("""
                SELECT 
                    tc.table_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    rc.delete_rule
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                  ON rc.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_schema = 'public'
                ORDER BY tc.table_name, kcu.column_name;
            """)

            fk_count = 0
            for table, column, ref_table, delete_rule in cursor.fetchall():
                fk_count += 1

            self.stdout.write(self.style.SUCCESS(f'  ✓ Found {fk_count} foreign key constraints'))

            # Database statistics
            self.stdout.write(self.style.HTTP_INFO('\n9. Database Statistics:'))
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes,
                    n_live_tup as live_rows,
                    n_dead_tup as dead_rows,
                    last_vacuum,
                    last_analyze
                FROM pg_stat_user_tables
                WHERE schemaname = 'public'
                ORDER BY n_live_tup DESC
                LIMIT 10;
            """)

            for row in cursor.fetchall():
                schema, table, ins, upd, del_, live, dead, vacuum, analyze = row
                self.stdout.write(
                    f'  {table.ljust(30)} Live: {live:>7,} Dead: {dead:>6,}'
                )

            self.stdout.write(self.style.SUCCESS('\n✓ Verification complete'))

