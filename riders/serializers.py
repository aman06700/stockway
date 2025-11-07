# riders/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Rider
from warehouses.models import Warehouse

User = get_user_model()


class RiderSerializer(serializers.ModelSerializer):
    """
    Serializer for Rider model with detailed information.
    """

    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    warehouse_id = serializers.IntegerField(source="warehouse.id", read_only=True)
    rider_name = serializers.CharField(source="user.full_name", read_only=True)
    rider_email = serializers.CharField(source="user.email", read_only=True)
    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)

    class Meta:
        model = Rider
        fields = [
            "id",
            "user",
            "warehouse",
            "warehouse_id",
            "warehouse_name",
            "rider_name",
            "rider_email",
            "status",
            "current_location",
            "latitude",
            "longitude",
            "total_earnings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "total_earnings", "created_at", "updated_at"]


class RiderRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for rider registration (admin/super_admin only).
    """

    user_id = serializers.IntegerField(write_only=True)
    warehouse_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Rider
        fields = ["user_id", "warehouse_id", "status"]

    def validate_user_id(self, value):
        """Validate that the user exists and has RIDER role"""
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if user.role != "RIDER":
            raise serializers.ValidationError("User must have RIDER role")

        # Check if rider profile already exists
        if hasattr(user, "rider_profile"):
            raise serializers.ValidationError(
                "Rider profile already exists for this user"
            )

        return value

    def validate_warehouse_id(self, value):
        """Validate that the warehouse exists"""
        try:
            Warehouse.objects.get(id=value)
        except Warehouse.DoesNotExist:
            raise serializers.ValidationError("Warehouse not found")

        return value

    def validate(self, attrs):
        """Validate warehouse ownership for warehouse_admin"""
        request = self.context.get("request")
        warehouse_id = attrs.get("warehouse_id")

        if request and request.user.role == "WAREHOUSE_MANAGER":
            # Warehouse admin can only register riders to their own warehouse
            warehouse = Warehouse.objects.get(id=warehouse_id)
            if warehouse.admin != request.user:
                raise serializers.ValidationError(
                    "You can only register riders to your own warehouse"
                )

        return attrs

    def create(self, validated_data):
        """Create rider profile"""
        user = User.objects.get(id=validated_data.pop("user_id"))
        warehouse = Warehouse.objects.get(id=validated_data.pop("warehouse_id"))

        rider = Rider.objects.create(user=user, warehouse=warehouse, **validated_data)
        return rider


class RiderProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for rider's own profile view.
    """

    name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    warehouse_address = serializers.CharField(
        source="warehouse.address", read_only=True
    )
    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)

    class Meta:
        model = Rider
        fields = [
            "id",
            "name",
            "email",
            "warehouse_name",
            "warehouse_address",
            "status",
            "current_location",
            "latitude",
            "longitude",
            "total_earnings",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "name",
            "email",
            "warehouse_name",
            "warehouse_address",
            "total_earnings",
            "created_at",
        ]


class RiderLocationUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating rider location.
    """

    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)

    def validate(self, attrs):
        """Validate coordinates"""
        lat = attrs.get("latitude")
        lng = attrs.get("longitude")

        if lat is None or lng is None:
            raise serializers.ValidationError(
                "Both latitude and longitude are required"
            )

        return attrs


class RiderListSerializer(serializers.ModelSerializer):
    """
    Compact serializer for rider list view.
    """

    name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    active_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = Rider
        fields = [
            "id",
            "name",
            "email",
            "status",
            "active_orders_count",
            "total_earnings",
        ]

    def get_active_orders_count(self, obj):
        """Get count of active orders for this rider"""
        from orders.models import Order

        return Order.objects.filter(
            delivery__rider=obj.user,
            status__in=["assigned", "in_transit"],
        ).count()
