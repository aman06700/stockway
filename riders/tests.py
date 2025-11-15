# riders/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal

from .models import Rider
from warehouses.models import Warehouse
from orders.models import Order
from delivery.models import Delivery

User = get_user_model()


class RiderModelTest(TestCase):
    """Test cases for Rider model"""

    def setUp(self):
        # Create warehouse admin
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="WAREHOUSE_MANAGER",
        )

        # Create warehouse
        self.warehouse = Warehouse.objects.create(
            admin=self.admin_user,
            name="Test Warehouse",
            address="123 Test St",
            contact_number="1234567890",
        )
        self.warehouse.set_coordinates(12.9716, 77.5946)
        self.warehouse.save()

        # Create rider user
        self.rider_user = User.objects.create_user(
            email="rider@test.com",
            password="testpass123",
            role="RIDER",
        )

    def test_rider_creation(self):
        """Test creating a rider"""
        rider = Rider.objects.create(
            user=self.rider_user,
            warehouse=self.warehouse,
            status="available",
        )

        self.assertEqual(rider.user, self.rider_user)
        self.assertEqual(rider.warehouse, self.warehouse)
        self.assertEqual(rider.status, "available")
        self.assertEqual(rider.total_earnings, Decimal("0.00"))
        self.assertIsNone(rider.current_location)

    def test_rider_location_coordinates(self):
        """Test setting and getting rider location coordinates"""
        rider = Rider.objects.create(
            user=self.rider_user,
            warehouse=self.warehouse,
        )

        # Set coordinates
        rider.set_coordinates(12.9716, 77.5946)
        rider.save()

        # Verify coordinates
        self.assertAlmostEqual(rider.latitude, 12.9716, places=4)
        self.assertAlmostEqual(rider.longitude, 77.5946, places=4)
        self.assertIsNotNone(rider.current_location)

    def test_rider_invalid_coordinates(self):
        """Test that invalid coordinates raise ValueError"""
        rider = Rider.objects.create(
            user=self.rider_user,
            warehouse=self.warehouse,
        )

        # Invalid latitude
        with self.assertRaises(ValueError):
            rider.set_coordinates(91.0, 77.5946)
            rider.save()

        # Invalid longitude
        with self.assertRaises(ValueError):
            rider.set_coordinates(12.9716, 181.0)
            rider.save()

    def test_rider_str_representation(self):
        """Test string representation of rider"""
        rider = Rider.objects.create(
            user=self.rider_user,
            warehouse=self.warehouse,
        )

        expected = f"Rider: {self.rider_user.email} - {self.warehouse.name}"
        self.assertEqual(str(rider), expected)


class RiderAPITest(APITestCase):
    """Test cases for Rider API endpoints"""

    def setUp(self):
        self.client = APIClient()

        # Create users
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="WAREHOUSE_MANAGER",
        )

        self.rider_user = User.objects.create_user(
            email="rider@test.com",
            password="testpass123",
            role="RIDER",
        )

        self.shopkeeper_user = User.objects.create_user(
            email="shopkeeper@test.com",
            password="testpass123",
            role="SHOPKEEPER",
        )

        # Create warehouse
        self.warehouse = Warehouse.objects.create(
            admin=self.admin_user,
            name="Test Warehouse",
            address="123 Test St",
            contact_number="1234567890",
        )
        self.warehouse.set_coordinates(12.9716, 77.5946)
        self.warehouse.save()

        # Create rider
        self.rider = Rider.objects.create(
            user=self.rider_user,
            warehouse=self.warehouse,
            status="available",
        )

    def test_rider_registration_by_admin(self):
        """Test rider registration by warehouse admin"""
        self.client.force_authenticate(user=self.admin_user)

        # Create new rider user
        new_rider_user = User.objects.create_user(
            email="newrider@test.com",
            password="testpass123",
            role="RIDER",
        )

        data = {
            "user_id": new_rider_user.id,
            "warehouse_id": self.warehouse.id,
            "status": "available",
        }

        response = self.client.post("/api/rider/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["rider_email"], "newrider@test.com")
        self.assertEqual(response.data["warehouse_name"], "Test Warehouse")

    def test_rider_registration_wrong_role(self):
        """Test that non-rider users cannot be registered as riders"""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            "user_id": self.shopkeeper_user.id,
            "warehouse_id": self.warehouse.id,
            "status": "available",
        }

        response = self.client.post("/api/rider/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rider_profile_get(self):
        """Test getting rider profile"""
        self.client.force_authenticate(user=self.rider_user)

        response = self.client.get("/api/rider/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "rider@test.com")
        self.assertEqual(response.data["warehouse_name"], "Test Warehouse")

    def test_rider_profile_update(self):
        """Test updating rider profile"""
        self.client.force_authenticate(user=self.rider_user)

        data = {"status": "inactive"}
        response = self.client.put("/api/rider/profile/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "inactive")

    def test_rider_location_update(self):
        """Test updating rider location"""
        self.client.force_authenticate(user=self.rider_user)

        data = {"latitude": 12.9716, "longitude": 77.5946}
        response = self.client.patch("/api/rider/location/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Location updated successfully")

        # Verify location was updated
        self.rider.refresh_from_db()
        self.assertIsNotNone(self.rider.current_location)

    def test_rider_location_invalid_coordinates(self):
        """Test that invalid coordinates are rejected"""
        self.client.force_authenticate(user=self.rider_user)

        data = {"latitude": 91.0, "longitude": 77.5946}
        response = self.client.patch("/api/rider/location/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_warehouse_riders_list(self):
        """Test listing riders for warehouse admin"""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get("/api/warehouse/riders/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], "rider@test.com")

    def test_warehouse_riders_filter_by_status(self):
        """Test filtering riders by status"""
        self.client.force_authenticate(user=self.admin_user)

        # Create another rider with different status
        another_rider_user = User.objects.create_user(
            email="rider2@test.com",
            password="testpass123",
            role="RIDER",
        )
        Rider.objects.create(
            user=another_rider_user,
            warehouse=self.warehouse,
            status="busy",
        )

        # Filter by available
        response = self.client.get("/api/warehouse/riders/?status=available")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["status"], "available")

        # Filter by busy
        response = self.client.get("/api/warehouse/riders/?status=busy")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["status"], "busy")

    def test_rider_detail_view(self):
        """Test getting rider detail"""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(f"/api/warehouse/riders/{self.rider.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.rider.id)
        self.assertEqual(response.data["rider_email"], "rider@test.com")

    def test_unauthorized_access(self):
        """Test that unauthorized users cannot access endpoints"""
        # Not authenticated
        response = self.client.get("/api/rider/profile/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Wrong role (shopkeeper trying to access rider endpoint)
        self.client.force_authenticate(user=self.shopkeeper_user)
        response = self.client.get("/api/rider/profile/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RiderOrderIntegrationTest(APITestCase):
    """Test cases for rider-order integration"""

    def setUp(self):
        self.client = APIClient()

        # Create users
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="WAREHOUSE_MANAGER",
        )

        self.rider_user = User.objects.create_user(
            email="rider@test.com",
            password="testpass123",
            role="RIDER",
        )

        self.shopkeeper_user = User.objects.create_user(
            email="shopkeeper@test.com",
            password="testpass123",
            role="SHOPKEEPER",
        )

        # Create warehouse
        self.warehouse = Warehouse.objects.create(
            admin=self.admin_user,
            name="Test Warehouse",
            address="123 Test St",
            contact_number="1234567890",
        )

        # Create rider
        self.rider = Rider.objects.create(
            user=self.rider_user,
            warehouse=self.warehouse,
            status="available",
        )

        # Create order
        self.order = Order.objects.create(
            shopkeeper=self.shopkeeper_user,
            warehouse=self.warehouse,
            status="assigned",
            total_amount=Decimal("250.00"),
        )

        # Create delivery
        self.delivery = Delivery.objects.create(
            order=self.order,
            rider=self.rider_user,
            status="assigned",
        )

    def test_rider_view_assigned_orders(self):
        """Test that rider can view their assigned orders"""
        self.client.force_authenticate(user=self.rider_user)

        response = self.client.get("/api/rider/orders/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.order.id)

    def test_rider_update_order_to_in_transit(self):
        """Test rider updating order status to in_transit"""
        self.client.force_authenticate(user=self.rider_user)

        data = {"order_id": self.order.id, "status": "in_transit"}
        response = self.client.patch("/api/rider/orders/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "in_transit")

        # Verify order status updated
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "in_transit")

    def test_rider_update_order_to_delivered(self):
        """Test rider marking order as delivered"""
        # First transition to in_transit
        self.order.status = "in_transit"
        self.order.save()
        self.delivery.status = "in_transit"
        self.delivery.save()

        self.client.force_authenticate(user=self.rider_user)

        data = {"order_id": self.order.id, "status": "delivered"}
        response = self.client.patch("/api/rider/orders/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "delivered")

        # Verify rider status changed to available
        self.rider.refresh_from_db()
        self.assertEqual(self.rider.status, "available")

        # Verify earnings were updated
        self.assertGreater(self.rider.total_earnings, Decimal("0.00"))

    def test_rider_invalid_status_transition(self):
        """Test that invalid status transitions are rejected"""
        self.client.force_authenticate(user=self.rider_user)

        # Try to go directly from assigned to delivered
        data = {"order_id": self.order.id, "status": "delivered"}
        response = self.client.patch("/api/rider/orders/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid transition", response.data["error"])

    def test_rider_cannot_update_others_orders(self):
        """Test that rider cannot update orders not assigned to them"""
        # Create another rider
        another_rider_user = User.objects.create_user(
            email="rider2@test.com",
            password="testpass123",
            role="RIDER",
        )

        self.client.force_authenticate(user=another_rider_user)

        data = {"order_id": self.order.id, "status": "in_transit"}
        response = self.client.patch("/api/rider/orders/update/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
