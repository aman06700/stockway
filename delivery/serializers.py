from rest_framework import serializers
from .models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    """
    Serializer for the Delivery model.
    """

    class Meta:
        model = Delivery
        fields = [
            "id",
            "order",
            "rider",
            "status",
            "delivery_fee",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
