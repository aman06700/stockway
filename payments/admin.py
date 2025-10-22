from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin interface for Payment model with comprehensive filtering and display options.
    """

    list_display = [
        "id",
        "transaction_id",
        "payment_type",
        "status",
        "amount",
        "payer",
        "payee",
        "rider",
        "warehouse",
        "order",
        "created_at",
        "completed_at",
    ]

    list_filter = [
        "status",
        "payment_type",
        "payment_method",
        "created_at",
        "completed_at",
        "warehouse",
    ]

    search_fields = [
        "transaction_id",
        "payer__phone_number",
        "payee__phone_number",
        "rider__phone_number",
        "notes",
    ]

    readonly_fields = ["transaction_id", "created_at", "updated_at", "completed_at"]

    fieldsets = (
        (
            "Transaction Information",
            {
                "fields": (
                    "transaction_id",
                    "payment_type",
                    "status",
                    "amount",
                    "payment_method",
                )
            },
        ),
        (
            "Related Entities",
            {"fields": ("order", "warehouse", "payer", "payee", "rider")},
        ),
        ("Additional Details", {"fields": ("distance_km", "notes")}),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at", "completed_at"),
                "classes": ("collapse",),
            },
        ),
    )

    list_per_page = 50
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related("order", "warehouse", "payer", "payee", "rider")

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of completed payments."""
        if obj and obj.status == "completed":
            return False
        return super().has_delete_permission(request, obj)
