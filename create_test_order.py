#!/usr/bin/env python
"""Script to create test data and a dummy order via API"""
import os
import sys
import requests

# Setup Django
sys.path.insert(0, '/home/granth/PycharmProjects/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.db import connection
from django.contrib.gis.geos import Point
from accounts.models import User
from warehouses.models import Warehouse

BASE_URL = "http://localhost:8000"

def create_test_data():
    """Create warehouse and inventory items for testing"""
    print("=== Creating Test Data ===")

    # Get or create warehouse admin
    admin, created = User.objects.get_or_create(
        email="warehouse_admin@test.com",
        defaults={
            "is_active": True,
            "supabase_uid": "test-warehouse-admin-uid-001"
        }
    )
    print(f"Warehouse Admin: {admin.email} (ID: {admin.id}, created: {created})")

    # Get or create warehouse
    warehouse, created = Warehouse.objects.get_or_create(
        name="Test Warehouse Bangalore",
        defaults={
            "address": "123 MG Road, Bangalore, Karnataka 560001",
            "contact_number": "+919876543210",
            "location": Point(77.5946, 12.9716, srid=4326),
            "admin": admin,
            "is_active": True,
            "is_approved": True
        }
    )
    print(f"Warehouse: {warehouse.name} (ID: {warehouse.id}, created: {created})")

    # Create inventory items directly in database (bypassing model issues)
    with connection.cursor() as cursor:
        # Check existing items
        cursor.execute("SELECT COUNT(*) FROM inventory_item")
        count = cursor.fetchone()[0]
        print(f"Existing inventory items: {count}")

        if count == 0:
            # Get the column structure first
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'inventory_item'
            """)
            columns = [row[0] for row in cursor.fetchall()]
            print(f"Inventory columns: {columns}")

            # Insert items based on actual table structure
            items = [
                ("Rice 5kg", "RICE-5KG-001", "Premium Basmati Rice 5kg pack", "Groceries", 250.00, 100),
                ("Sugar 1kg", "SUGAR-1KG-001", "Refined Sugar 1kg pack", "Groceries", 45.00, 200),
                ("Cooking Oil 1L", "OIL-1L-001", "Sunflower Cooking Oil 1 Liter", "Groceries", 150.00, 50),
            ]

            for name, sku, desc, category, price, qty in items:
                try:
                    cursor.execute("""
                        INSERT INTO inventory_item (name, sku, description, category, price, "availableQuantity", created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (sku) DO NOTHING
                        RETURNING id
                    """, [name, sku, desc, category, price, qty])
                    result = cursor.fetchone()
                    if result:
                        print(f"  Created item: {name} (ID: {result[0]})")
                    else:
                        print(f"  Item already exists: {name}")
                except Exception as e:
                    print(f"  Error creating {name}: {e}")

    # Get item IDs
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, name, price FROM inventory_item LIMIT 5")
        items = cursor.fetchall()
        print(f"\nAvailable items for order:")
        for item in items:
            print(f"  ID: {item[0]}, Name: {item[1]}, Price: {item[2]}")

    return warehouse.id, items

def get_token():
    """Read saved token from file"""
    try:
        with open('/tmp/test_token.txt', 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        print("ERROR: No token found. Please authenticate first.")
        return None

def create_order(warehouse_id, items, token):
    """Create order via API"""
    print(f"\n=== Creating Order via API ===")

    if not items:
        print("ERROR: No items available to create order")
        return None

    # Prepare order payload
    order_items = [
        {"item_id": items[0][0], "quantity": 2},  # 2x first item
    ]
    if len(items) > 1:
        order_items.append({"item_id": items[1][0], "quantity": 3})  # 3x second item

    payload = {
        "warehouse": warehouse_id,
        "items": order_items
    }

    print(f"Order payload: {payload}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Try shopkeeper order create endpoint
    url = f"{BASE_URL}/api/shopkeepers/orders/create/"
    print(f"POST {url}")

    response = requests.post(url, json=payload, headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response: {response.text[:500] if response.text else 'Empty'}")

    if response.status_code == 201:
        order_data = response.json()
        print(f"\n✅ ORDER CREATED SUCCESSFULLY!")
        print(f"   Order ID: {order_data.get('id')}")
        print(f"   Status: {order_data.get('status')}")
        print(f"   Total: {order_data.get('total_amount')}")
        return order_data
    else:
        print(f"\n❌ Failed to create order")
        return None

def main():
    print("=" * 50)
    print("Creating Dummy Order Through API")
    print("=" * 50)

    # Step 1: Create test data
    warehouse_id, items = create_test_data()

    # Step 2: Get token
    token = get_token()
    if not token:
        print("\nTo authenticate, run:")
        print("  1. Send OTP: curl -X POST http://localhost:8000/api/accounts/send-otp/ -H 'Content-Type: application/json' -d '{\"email\":\"granthtests@gmail.com\"}'")
        print("  2. Verify OTP and save token")
        return

    print(f"\nUsing token: {token[:50]}...")

    # Step 3: Create order
    order = create_order(warehouse_id, items, token)

    if order:
        print("\n" + "=" * 50)
        print("SUCCESS! Dummy order created in database.")
        print("=" * 50)

if __name__ == "__main__":
    main()

