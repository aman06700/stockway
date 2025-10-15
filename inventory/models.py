# inventory/models.py
from django.db import models
from warehouses.models import Warehouse


class Item(models.Model):
    """
    Model to store inventory items in a warehouse.
    """

    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sku = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"
