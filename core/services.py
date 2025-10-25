"""
Service layer for cross-cutting concerns and business logic.
Provides service classes for operations that span multiple apps.
"""

from typing import Dict, Any, List, Optional, Tuple
from decimal import Decimal
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from django.db import transaction
from django.utils import timezone

from .exceptions import (
    InsufficientStockError,
    InvalidOrderStateError,
    ResourceNotFoundError,
)
from .utils import calculate_distance_km, calculate_delivery_fee


class NotificationService:
    """Service for creating and managing notifications."""

    @staticmethod
    def create_order_notification(
        user, order, notification_type: str, title: str, message: str
    ):
        """
        Create an order-related notification.

        Args:
            user: User to notify
            order: Related order
            notification_type: Type of notification
            title: Notification title
            message: Notification message

        Returns:
            Created notification instance
        """
        from shopkeepers.models import Notification

        return Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            order=order,
        )

    @staticmethod
    def notify_order_created(user, order):
        """Send notification when order is created."""
        return NotificationService.create_order_notification(
            user=user,
            order=order,
            notification_type="general",
            title="Order Created",
            message=f"Your order #{order.id} has been created successfully.",
        )

    @staticmethod
    def notify_order_cancelled(user, order):
        """Send notification when order is cancelled."""
        return NotificationService.create_order_notification(
            user=user,
            order=order,
            notification_type="order_cancelled",
            title="Order Cancelled",
            message=f"Your order #{order.id} has been cancelled.",
        )

    @staticmethod
    def notify_order_accepted(user, order):
        """Send notification when order is accepted."""
        return NotificationService.create_order_notification(
            user=user,
            order=order,
            notification_type="order_accepted",
            title="Order Accepted",
            message=f"Your order #{order.id} has been accepted by the warehouse.",
        )


class InventoryService:
    """Service for inventory management operations."""

    @staticmethod
    def check_availability(
        warehouse, items_data: List[Dict[str, Any]]
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if items are available in warehouse.

        Args:
            warehouse: Warehouse instance
            items_data: List of dicts with item_id and quantity

        Returns:
            Tuple of (is_available, error_message)
        """
        from inventory.models import Item

        for item_data in items_data:
            item_id = item_data.get("item_id")
            quantity = item_data.get("quantity")

            try:
                inventory_item = Item.objects.get(id=item_id, warehouse=warehouse)
                if inventory_item.quantity < quantity:
                    return False, (
                        f"Not enough stock for {inventory_item.name}. "
                        f"Available: {inventory_item.quantity}, Requested: {quantity}"
                    )
            except Item.DoesNotExist:
                return False, f"Item with ID {item_id} not found in this warehouse."

        return True, None

    @staticmethod
    @transaction.atomic
    def reserve_items(warehouse, items_data: List[Dict[str, Any]]):
        """
        Reserve (decrement) inventory for order items.

        Args:
            warehouse: Warehouse instance
            items_data: List of dicts with item_id and quantity

        Raises:
            InsufficientStockError: If stock is insufficient
        """
        from inventory.models import Item

        for item_data in items_data:
            item = Item.objects.select_for_update().get(
                id=item_data["item_id"], warehouse=warehouse
            )

            if item.quantity < item_data["quantity"]:
                raise InsufficientStockError(f"Insufficient stock for {item.name}")

            item.quantity -= item_data["quantity"]
            item.save()


class GeoService:
    """Service for geospatial operations."""

    @staticmethod
    def get_nearby_warehouses(
        latitude: float, longitude: float, radius_km: float = 10, limit: int = None
    ):
        """
        Find warehouses near a location.

        Args:
            latitude: Latitude of location
            longitude: Longitude of location
            radius_km: Search radius in kilometers
            limit: Maximum number of results

        Returns:
            QuerySet of nearby warehouses
        """
        from warehouses.models import Warehouse

        point = Point(longitude, latitude, srid=4326)
        queryset = (
            Warehouse.objects.filter(
                location__distance_lte=(point, Distance(km=radius_km))
            )
            .annotate(distance=Distance("location", point))
            .order_by("distance")
        )

        if limit:
            queryset = queryset[:limit]

        return queryset

    @staticmethod
    def calculate_delivery_distance(shopkeeper_profile, warehouse) -> float:
        """
        Calculate delivery distance between shopkeeper and warehouse.

        Args:
            shopkeeper_profile: ShopkeeperProfile instance
            warehouse: Warehouse instance

        Returns:
            Distance in kilometers
        """
        if not shopkeeper_profile.location or not warehouse.location:
            raise ValueError("Both locations must be set")

        return calculate_distance_km(
            shopkeeper_profile.latitude,
            shopkeeper_profile.longitude,
            warehouse.latitude,
            warehouse.longitude,
        )


class PaymentService:
    """Service for payment operations."""

    @staticmethod
    def create_shopkeeper_payment(
        order, amount: Decimal, payment_method: str, notes: str = ""
    ):
        """
        Create payment from shopkeeper to warehouse.

        Args:
            order: Order instance
            amount: Payment amount
            payment_method: Payment method
            notes: Additional notes

        Returns:
            Created Payment instance
        """
        from payments.models import Payment

        return Payment.objects.create(
            payment_type="shopkeeper_to_warehouse",
            warehouse=order.warehouse,
            payer=order.shopkeeper,
            payee=order.warehouse.admin,
            order=order,
            amount=amount,
            payment_method=payment_method,
            notes=notes,
            status="pending",
        )

    @staticmethod
    def create_rider_payout(
        order,
        rider,
        amount: Decimal,
        distance_km: float,
        payment_method: str,
        notes: str = "",
    ):
        """
        Create payout from warehouse to rider.

        Args:
            order: Order instance
            rider: Rider user instance
            amount: Payout amount
            distance_km: Delivery distance
            payment_method: Payment method
            notes: Additional notes

        Returns:
            Created Payment instance
        """
        from payments.models import Payment

        return Payment.objects.create(
            payment_type="warehouse_to_rider",
            warehouse=order.warehouse,
            payer=order.warehouse.admin,
            payee=rider,
            rider=rider,
            order=order,
            amount=amount,
            distance_km=Decimal(str(distance_km)),
            payment_method=payment_method,
            notes=notes,
            status="pending",
        )


"""
Core module for shared utilities, permissions, and services.
Centralizes reusable code to avoid duplication across domain apps.
"""
