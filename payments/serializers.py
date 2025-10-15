from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model.
    """

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "user",
            "payment_type",
            "status",
            "amount",
            "transaction_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
