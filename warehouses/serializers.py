from rest_framework import serializers
from .models import Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Warehouse model.
    """

    class Meta:
        model = Warehouse
        fields = ["id", "name", "address", "admin", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
