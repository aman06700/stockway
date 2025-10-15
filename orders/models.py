# orders/models.py
from django.db import models
from django.conf import settings
from warehouses.models import Warehouse
from inventory.models import Item


class Order(models.Model):
    """
    Model to store customer orders.
    """

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("in_transit", "In Transit"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )

    shopkeeper = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name="orders"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.shopkeeper.username}"


class OrderItem(models.Model):
    """
    Model for items within an order.
    """

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="order_items"
    )
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # Price at the time of order

    def __str__(self):
        return f"{self.quantity} of {self.item.name} in Order #{self.order.id}"
