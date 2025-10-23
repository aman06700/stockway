from rest_framework import serializers
from .models import Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Warehouse model.
    Includes basic range validation for latitude and longitude.
    """

    class Meta:
        model = Warehouse
        fields = [
            "id",
            "name",
            "address",
            "latitude",
            "longitude",
            "admin",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_latitude(self, value):
        if value is None:
            return value
        if value < -90 or value > 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if value is None:
            return value
        if value < -180 or value > 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value


class NearbyWarehouseSerializer(serializers.ModelSerializer):
    """
    Serializer for warehouses with distance information.
    Used for geospatial proximity queries.
    """

    distance_km = serializers.SerializerMethodField()
    distance_m = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = [
            "id",
            "name",
            "address",
            "latitude",
            "longitude",
            "distance_km",
            "distance_m",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_distance_km(self, obj):
        """Return distance in kilometers (rounded to 2 decimal places)."""
        if hasattr(obj, "distance"):
            return round(obj.distance.km, 2)
        return None

    def get_distance_m(self, obj):
        """Return distance in meters (rounded to nearest meter)."""
        if hasattr(obj, "distance"):
            return round(obj.distance.m, 0)
        return None
