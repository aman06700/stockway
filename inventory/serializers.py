from rest_framework import serializers
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the Item model.
    """

    class Meta:
        model = Item
        fields = [
            "id",
            "warehouse",
            "name",
            "description",
            "sku",
            "price",
            "quantity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
