from rest_framework import serializers
from .models import Order, OrderItem


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model.
    """

    class Meta:
        model = Order
        fields = [
            "id",
            "shopkeeper",
            "warehouse",
            "status",
            "total_amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the OrderItem model.
    """

    class Meta:
        model = OrderItem
        fields = ["id", "order", "item", "quantity", "price"]
        read_only_fields = ["id"]
