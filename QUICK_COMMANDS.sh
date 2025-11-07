#!/bin/bash
# Quick Commands for System Verification and Deployment

echo "🚀 Backend System - Quick Commands"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. System Check
echo -e "${YELLOW}1. SYSTEM CHECK${NC}"
echo "python manage.py check"
echo ""

# 2. Run Verification Tests
echo -e "${YELLOW}2. RUN VERIFICATION TESTS${NC}"
echo "python run_verification.py"
echo ""

# 3. View Migrations Status
echo -e "${YELLOW}3. CHECK MIGRATIONS${NC}"
echo "python manage.py showmigrations"
echo ""

# 4. Create Migrations (if needed)
echo -e "${YELLOW}4. CREATE NEW MIGRATIONS${NC}"
echo "python manage.py makemigrations"
echo ""

# 5. Apply Migrations
echo -e "${YELLOW}5. APPLY MIGRATIONS${NC}"
echo "python manage.py migrate"
echo ""

# 6. Create Superuser
echo -e "${YELLOW}6. CREATE SUPERUSER${NC}"
echo "python manage.py createsuperuser"
echo ""

# 7. Run Development Server
echo -e "${YELLOW}7. START DEV SERVER${NC}"
echo "python manage.py runserver"
echo ""

# 8. Django Shell
echo -e "${YELLOW}8. DJANGO SHELL${NC}"
echo "python manage.py shell"
echo ""

# 9. Test Specific Module
echo -e "${YELLOW}9. TEST SPECIFIC APP${NC}"
echo "python manage.py test <app_name>"
echo "Examples:"
echo "  python manage.py test orders"
echo "  python manage.py test warehouses"
echo "  python manage.py test shopkeepers"
echo ""

# 10. Database Operations
echo -e "${YELLOW}10. DATABASE OPERATIONS${NC}"
echo "# Flush database (CAREFUL!)"
echo "python manage.py flush"
echo ""
echo "# SQL for migration"
echo "python manage.py sqlmigrate <app> <migration_number>"
echo "Example: python manage.py sqlmigrate orders 0003"
echo ""

# 11. Static Files
echo -e "${YELLOW}11. STATIC FILES${NC}"
echo "python manage.py collectstatic"
echo ""

# 12. Custom Management Commands
echo -e "${YELLOW}12. CUSTOM COMMANDS${NC}"
echo "# Test Supabase connection"
echo "python manage.py test_supabase"
echo ""
echo "# Test nearby warehouses"
echo "python manage.py test_nearby_warehouses"
echo ""

# Quick Test Endpoints
echo -e "${YELLOW}13. QUICK API TESTS${NC}"
echo ""
echo "# Test warehouse nearby endpoint (requires auth token)"
echo "curl -X GET 'http://localhost:8000/api/shopkeepers/warehouses/nearby/?latitude=40.7128&longitude=-74.0060&radius=10' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "# Test pending orders (warehouse admin)"
echo "curl -X GET 'http://localhost:8000/api/orders/warehouse/pending/' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "# Accept an order"
echo "curl -X POST 'http://localhost:8000/api/orders/warehouse/1/accept/' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo ""

# Environment Setup
echo -e "${YELLOW}14. ENVIRONMENT SETUP${NC}"
echo "# Install dependencies"
echo "pip install -r requirements.txt"
echo ""
echo "# Activate virtual environment"
echo "source .venv/bin/activate  # Linux/Mac"
echo ".venv\\Scripts\\activate   # Windows"
echo ""

# Verification
echo -e "${YELLOW}15. RUN FULL VERIFICATION${NC}"
echo "./run_verification.py"
echo ""

echo "===================================="
echo -e "${GREEN}✅ Command Reference Complete${NC}"
echo ""
echo "For detailed documentation, see:"
echo "  - COMPREHENSIVE_VERIFICATION_REPORT.md"
echo "  - VERIFICATION_CHECKLIST.md"
echo "  - orders/WAREHOUSE_WORKFLOW_API.md"
echo ""

