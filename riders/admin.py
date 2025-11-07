# riders/admin.py
from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Rider


@admin.register(Rider)
class RiderAdmin(GISModelAdmin):
    """
    Admin interface for Rider model with PostGIS support.
    """

    list_display = [
        "id",
        "user",
        "warehouse",
        "status",
        "total_earnings",
        "created_at",
    ]
    list_filter = ["status", "warehouse", "created_at"]
    search_fields = [
        "user__email",
        "user__full_name",
        "user__phone_number",
        "warehouse__name",
    ]
    readonly_fields = ["created_at", "updated_at", "total_earnings"]
    ordering = ["-created_at"]

    fieldsets = (
        (
            "Rider Information",
            {
                "fields": (
                    "user",
                    "warehouse",
                    "status",
                )
            },
        ),
        (
            "Location",
            {
                "fields": ("current_location",),
                "description": "GPS location tracking for the rider",
            },
        ),
        (
            "Earnings",
            {
                "fields": ("total_earnings",),
                "description": "Total earnings accumulated",
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related("user", "warehouse")
