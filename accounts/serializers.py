from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.models import ShopkeeperProfile

User = get_user_model()


class SignUpSerializer(serializers.Serializer):
    """Serializer for user sign up with email and password"""

    email = serializers.EmailField(
        required=True,
        help_text="Email address",
    )
    password = serializers.CharField(
        required=True,
        min_length=6,
        write_only=True,
        help_text="Password (minimum 6 characters)",
    )
    confirm_password = serializers.CharField(
        required=True,
        min_length=6,
        write_only=True,
        help_text="Confirm password",
    )

    def validate_email(self, value):
        """Validate email format"""
        return value.lower()

    def validate(self, data):
        """Validate passwords match"""
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match"}
            )
        return data


class SignInSerializer(serializers.Serializer):
    """Serializer for user sign in with email and password"""

    email = serializers.EmailField(
        required=True,
        help_text="Email address",
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        help_text="Password",
    )

    def validate_email(self, value):
        """Validate email format"""
        return value.lower()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = [
            "id",
            "phone_number",
            "email",
            "full_name",
            "role",
            "is_active",
            "date_joined",
            "last_login",
            "profile_image_url",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]


class UserAdminSerializer(serializers.ModelSerializer):
    """
    Serializer for admin user management.
    Includes soft delete status and all user details.
    """

    is_deleted = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "phone_number",
            "email",
            "full_name",
            "role",
            "is_active",
            "is_deleted",
            "deleted_at",
            "date_joined",
            "last_login",
            "profile_image_url",
        ]
        read_only_fields = [
            "id",
            "date_joined",
            "last_login",
            "deleted_at",
            "is_deleted",
        ]


class UserDeactivateSerializer(serializers.Serializer):
    """Serializer for user deactivation (soft delete)"""

    reason = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Optional reason for deactivation",
    )


class UserRestoreSerializer(serializers.Serializer):
    """Serializer for restoring a soft-deleted user"""

    pass


class UserHardDeleteSerializer(serializers.Serializer):
    """Serializer for hard delete confirmation"""

    confirm = serializers.BooleanField(
        required=True, help_text="Must be true to confirm permanent deletion"
    )

    def validate_confirm(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must confirm the deletion by setting 'confirm' to true"
            )
        return value


class ShopkeeperProfileSerializer(serializers.ModelSerializer):
    """Serializer for Shopkeeper Profile"""

    user = UserSerializer(read_only=True)
    latitude = serializers.FloatField(write_only=True, required=False, allow_null=True)
    longitude = serializers.FloatField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ShopkeeperProfile
        fields = [
            "id",
            "user",
            "shop_name",
            "shop_address",
            "location",
            "latitude",
            "longitude",
            "gst_number",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_verified", "location"]

    def create(self, validated_data):
        from django.contrib.gis.geos import Point

        latitude = validated_data.pop("latitude", None)
        longitude = validated_data.pop("longitude", None)

        if latitude is not None and longitude is not None:
            validated_data["location"] = Point(longitude, latitude, srid=4326)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.contrib.gis.geos import Point

        latitude = validated_data.pop("latitude", None)
        longitude = validated_data.pop("longitude", None)

        if latitude is not None and longitude is not None:
            validated_data["location"] = Point(longitude, latitude, srid=4326)

        return super().update(instance, validated_data)
