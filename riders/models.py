# riders/models.py
from decimal import Decimal
from django.contrib.gis.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from warehouses.models import Warehouse


class Rider(models.Model):
    """
    Rider model with PostGIS location tracking for delivery management.
    """

    STATUS_CHOICES = [
        ("available", "Available"),
        ("busy", "Busy"),
        ("inactive", "Inactive"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rider_profile",
        help_text="User account for the rider",
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="riders",
        help_text="Warehouse where rider is assigned",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="available",
        db_index=True,
        help_text="Current availability status of the rider",
    )
    current_location = models.PointField(
        geography=True,
        srid=4326,
        null=True,
        blank=True,
        help_text="Current GPS location of the rider",
    )
    total_earnings = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Total earnings accumulated by the rider",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "riders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["warehouse", "status"]),
            models.Index(fields=["status"]),
            models.Index(fields=["user"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(total_earnings__gte=0),
                name="rider_total_earnings_non_negative",
            ),
        ]

    def __str__(self):
        return (
            f"Rider: {self.user.full_name or self.user.email} - {self.warehouse.name}"
        )

    @property
    def latitude(self):
        """Get latitude from current location"""
        return self.current_location.y if self.current_location else None

    @property
    def longitude(self):
        """Get longitude from current location"""
        return self.current_location.x if self.current_location else None

    def set_coordinates(self, latitude, longitude):
        """Set location from lat/lng coordinates"""
        from django.contrib.gis.geos import Point

        self.current_location = Point(longitude, latitude, srid=4326)

    def save(self, *args, **kwargs):
        # Validate coordinates if location is set
        if self.current_location:
            lat, lng = self.current_location.y, self.current_location.x
            if not (-90 <= lat <= 90):
                raise ValueError("Latitude must be between -90 and 90")
            if not (-180 <= lng <= 180):
                raise ValueError("Longitude must be between -180 and 180")
        super().save(*args, **kwargs)
