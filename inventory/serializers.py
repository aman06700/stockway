from rest_framework import serializers
from .models import Item
from core.permissions import IsSuperAdmin


class ItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the Item model.
    - Ensures non-negative quantity
    - Provides helper to check availability for a requested quantity
    """

    available = serializers.SerializerMethodField(read_only=True)

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
            "image_url",
            "image_urls",
            "available",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "available", "image_urls"]
        extra_kwargs = {"warehouse": {"required": False}}

    def validate_quantity(self, value):
        if value is None:
            return value
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        # Enforce that non-super-admins can only create/update items for their own warehouse
        warehouse = attrs.get("warehouse") or getattr(self.instance, "warehouse", None)
        if request and request.user and warehouse:
            if not IsSuperAdmin().has_permission(request, self):
                # request.user must own the warehouse
                if getattr(warehouse, "admin_id", None) != request.user.id:
                    raise serializers.ValidationError(
                        {
                            "warehouse": "You do not have permission to manage items for this warehouse."
                        }
                    )
        return attrs

    def get_available(self, obj: Item):
        # For now, availability equals current quantity
        return obj.quantity

    def check_requested_availability(self, requested_qty: int) -> bool:
        """Convenience helper to check if requested quantity is available."""
        qty = getattr(self.instance, "quantity", 0)
        return requested_qty <= qty


class ItemImageUploadSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.ImageField(), allow_empty=False, max_length=10
    )

    def validate_images(self, images):
        max_size = 2 * 1024 * 1024  # 2MB per file
        allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
        for img in images:
            if img.size > max_size:
                raise serializers.ValidationError("Each image must be <= 2MB")
            if img.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Unsupported image type. Allowed: jpg, jpeg, png, webp"
                )
        return images


class ItemImageDeleteSerializer(serializers.Serializer):
    filenames = serializers.ListField(
        child=serializers.CharField(), allow_empty=False, max_length=20
    )

    def validate_filenames(self, filenames):
        # basic path traversal guard
        for name in filenames:
            if ".." in name or "/" in name or "\\" in name:
                raise serializers.ValidationError("Invalid filename")
        return filenames

