from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Warehouse, WarehouseNotification, RiderPayout


@admin.register(Warehouse)
class WarehouseAdmin(GISModelAdmin):
    """Admin interface for Warehouse model"""

    list_display = [
        "name",
        "admin",
        "contact_number",
        "is_active",
        "is_approved",
        "created_at",
    ]
    list_filter = ["is_active", "is_approved", "created_at"]
    search_fields = ["name", "address", "admin__email", "contact_number"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (
            "Basic Information",
            {"fields": ("admin", "name", "address", "contact_number")},
        ),
        ("Location", {"fields": ("location",)}),
        ("Status", {"fields": ("is_active", "is_approved")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    # Enable map widget for location field
    gis_widget_kwargs = {
        "attrs": {
            "default_zoom": 12,
        }
    }


@admin.register(WarehouseNotification)
class WarehouseNotificationAdmin(admin.ModelAdmin):
    """Admin interface for WarehouseNotification model"""

    list_display = ["warehouse", "notification_type", "title", "is_read", "created_at"]
    list_filter = ["notification_type", "is_read", "created_at"]
    search_fields = ["warehouse__name", "title", "message"]
    readonly_fields = ["created_at"]
    fieldsets = (
        (
            "Notification Details",
            {
                "fields": (
                    "warehouse",
                    "notification_type",
                    "title",
                    "message",
                    "metadata",
                )
            },
        ),
        ("Status", {"fields": ("is_read",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


@admin.register(RiderPayout)
class RiderPayoutAdmin(admin.ModelAdmin):
    """Admin interface for RiderPayout model"""

    list_display = [
        "warehouse",
        "rider",
        "order",
        "total_amount",
        "status",
        "created_at",
    ]
    list_filter = ["status", "created_at", "paid_at"]
    search_fields = [
        "warehouse__name",
        "rider__user__email",
        "order__id",
        "payment_reference",
    ]
    readonly_fields = ["total_amount", "created_at"]
    fieldsets = (
        ("Payout Information", {"fields": ("warehouse", "rider", "order")}),
        (
            "Payment Details",
            {"fields": ("base_rate", "distance_km", "distance_rate", "total_amount")},
        ),
        ("Status", {"fields": ("status", "payment_reference", "paid_at")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )
