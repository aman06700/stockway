#!/bin/bash
# Quick test script for Order API endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Order API Quick Test Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Base URL
BASE_URL="http://localhost:8000/api/orders"

echo -e "\n${GREEN}Available Endpoints:${NC}"
echo ""
echo "SHOPKEEPER ENDPOINTS:"
echo "  POST   $BASE_URL/shopkeeper/orders/create/"
echo "  GET    $BASE_URL/shopkeeper/orders/"
echo "  GET    $BASE_URL/shopkeeper/orders/{id}/"
echo ""
echo "WAREHOUSE ENDPOINTS:"
echo "  GET    $BASE_URL/warehouse/orders/"
echo "  GET    $BASE_URL/warehouse/orders/pending/"
echo "  GET    $BASE_URL/warehouse/orders/{id}/"
echo "  POST   $BASE_URL/warehouse/orders/{id}/accept/"
echo "  POST   $BASE_URL/warehouse/orders/{id}/reject/"
echo ""
echo -e "${GREEN}Example Usage:${NC}"
echo ""
echo "# Create an order (shopkeeper)"
echo 'curl -X POST $BASE_URL/shopkeeper/orders/create/ \'
echo '  -H "Authorization: Bearer YOUR_TOKEN" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{
    "warehouse_id": 1,
    "items": [
      {"item_id": 10, "quantity": 5},
      {"item_id": 15, "quantity": 3}
    ],
    "notes": "Urgent delivery needed"
  }'"'"
echo ""
echo "# List pending orders (warehouse)"
echo 'curl -X GET $BASE_URL/warehouse/orders/pending/ \'
echo '  -H "Authorization: Bearer YOUR_TOKEN"'
echo ""
echo "# Accept an order (warehouse)"
echo 'curl -X POST $BASE_URL/warehouse/orders/42/accept/ \'
echo '  -H "Authorization: Bearer YOUR_TOKEN"'
echo ""
echo "# Reject an order (warehouse)"
echo 'curl -X POST $BASE_URL/warehouse/orders/42/reject/ \'
echo '  -H "Authorization: Bearer YOUR_TOKEN" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"rejection_reason": "Out of stock"}'"'"
echo ""

