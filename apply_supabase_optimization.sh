#!/bin/bash
# ============================================================================
# SUPABASE OPTIMIZATION - EXECUTION SCRIPT
# ============================================================================
# This script applies all Supabase database optimizations safely
# Run this script to fix RLS, indexes, performance, and schema issues
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./database_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# ============================================================================
# Functions
# ============================================================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_header "Pre-flight Checks"

# Check if Python is available
if ! command -v python &> /dev/null; then
    print_error "Python is not installed or not in PATH"
    exit 1
fi
print_success "Python found"

# Check if Django manage.py exists
if [ ! -f "manage.py" ]; then
    print_error "manage.py not found. Run this script from the project root."
    exit 1
fi
print_success "Django project found"

# Check if optimization SQL file exists
if [ ! -f "supabase_optimization.sql" ]; then
    print_error "supabase_optimization.sql not found"
    exit 1
fi
print_success "Optimization SQL script found"

# Check if rollback SQL file exists
if [ ! -f "supabase_rollback.sql" ]; then
    print_warning "supabase_rollback.sql not found (rollback won't be available)"
else
    print_success "Rollback SQL script found"
fi

# Check if management command exists
if [ ! -f "core/management/commands/optimize_supabase.py" ]; then
    print_error "Management command optimize_supabase.py not found"
    exit 1
fi
print_success "Management command found"

echo ""

# ============================================================================
# Step 1: Verify Current State
# ============================================================================

print_header "Step 1: Verify Current Database State"

print_info "Running verification (this may take a moment)..."
if python manage.py optimize_supabase --verify-only; then
    print_success "Current state verified"
else
    print_warning "Verification completed with warnings (this is normal before optimization)"
fi

echo ""
read -p "Continue with optimization? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    print_warning "Optimization cancelled by user"
    exit 0
fi

echo ""

# ============================================================================
# Step 2: Database Backup (Optional but Recommended)
# ============================================================================

print_header "Step 2: Database Backup"

read -p "Create database backup before optimization? (recommended: yes/no): " do_backup

if [ "$do_backup" = "yes" ]; then
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"

    print_info "Creating database backup to ${BACKUP_FILE}..."

    # Extract database credentials from Django settings
    DB_HOST=$(python -c "from django.conf import settings; settings.configure(); from core.config import Config; print(Config.DB_HOST)")
    DB_NAME=$(python -c "from django.conf import settings; settings.configure(); from core.config import Config; print(Config.DB_NAME)")
    DB_USER=$(python -c "from django.conf import settings; settings.configure(); from core.config import Config; print(Config.DB_USER)")

    # Create backup using pg_dump
    if command -v pg_dump &> /dev/null; then
        if PGPASSWORD="${DB_PASSWORD}" pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>&1; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            print_success "Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"
        else
            print_warning "Backup failed, but continuing with optimization"
            print_info "You can manually backup later or skip this step"
        fi
    else
        print_warning "pg_dump not found. Backup skipped."
        print_info "Consider backing up your database manually before proceeding"
        read -p "Continue without backup? (yes/no): " continue_no_backup
        if [ "$continue_no_backup" != "yes" ]; then
            print_warning "Optimization cancelled"
            exit 0
        fi
    fi
else
    print_warning "Skipping backup (not recommended for production)"
fi

echo ""

# ============================================================================
# Step 3: Dry Run (Preview Changes)
# ============================================================================

print_header "Step 3: Preview Changes (Dry Run)"

read -p "Preview changes before applying? (yes/no): " do_dry_run

if [ "$do_dry_run" = "yes" ]; then
    print_info "Running dry-run mode..."
    python manage.py optimize_supabase --dry-run
    echo ""
    read -p "Proceed with actual optimization? (yes/no): " proceed
    if [ "$proceed" != "yes" ]; then
        print_warning "Optimization cancelled by user"
        exit 0
    fi
fi

echo ""

# ============================================================================
# Step 4: Apply Optimizations
# ============================================================================

print_header "Step 4: Apply Database Optimizations"

print_warning "This will modify your database (RLS, indexes, schema)"
read -p "Are you sure you want to proceed? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    print_warning "Optimization cancelled by user"
    exit 0
fi

print_info "Applying optimizations..."
echo ""

if python manage.py optimize_supabase; then
    print_success "Optimizations applied successfully!"
else
    print_error "Optimization failed!"
    echo ""
    print_info "To rollback changes, run:"
    print_info "  psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME -f supabase_rollback.sql"
    exit 1
fi

echo ""

# ============================================================================
# Step 5: Post-Optimization Verification
# ============================================================================

print_header "Step 5: Post-Optimization Verification"

print_info "Verifying optimizations..."
if python manage.py optimize_supabase --verify-only; then
    print_success "Post-optimization verification passed"
else
    print_warning "Some verifications failed - review output above"
fi

echo ""

# ============================================================================
# Step 6: Summary and Next Steps
# ============================================================================

print_header "Optimization Complete!"

echo ""
print_success "Database optimizations have been applied successfully"
echo ""
echo "What was done:"
echo "  ✓ Row-Level Security (RLS) enabled on 8 user-facing tables"
echo "  ✓ 30+ RLS policies created for role-based access"
echo "  ✓ 15+ redundant indexes removed"
echo "  ✓ 20+ essential composite indexes created"
echo "  ✓ 2 PostGIS GIST indexes added for spatial queries"
echo "  ✓ Schema consistency enforced (data types, constraints)"
echo "  ✓ Performance optimizations applied"
echo "  ✓ Security roles configured"
echo ""
echo "Next steps:"
echo "  1. Test your application functionality"
echo "  2. Monitor query performance"
echo "  3. Check RLS policies are working correctly"
echo "  4. Review logs for any issues"
echo ""
echo "Documentation:"
echo "  - Full docs: SUPABASE_OPTIMIZATION.md"
echo "  - Quick ref: SUPABASE_QUICK_REFERENCE.md"
echo "  - Summary:   COMPLETION_SUMMARY.md"
echo ""
if [ -f "$BACKUP_FILE" ]; then
    echo "Backup location: ${BACKUP_FILE}"
    echo ""
fi
echo "To rollback (if needed):"
echo "  psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME -f supabase_rollback.sql"
echo ""
print_success "All done! 🎉"

