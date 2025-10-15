# warehouses/models.py
from django.db import models
from django.conf import settings


class Warehouse(models.Model):
    """
    Model to store warehouse information.
    """

    name = models.CharField(max_length=255)
    address = models.TextField()
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="warehouses"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
