from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from accounts.models import User, ShopkeeperProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""

    # Use all_objects to see soft-deleted users in admin
    def get_queryset(self, request):
        return User.all_objects.all()

    list_display = [
        "phone_number",
        "full_name",
        "role",
        "is_active",
        "is_staff",
        "deletion_status",
        "date_joined",
    ]
    list_filter = ["is_active", "is_staff", "role", "deleted_at", "date_joined"]
    search_fields = ["phone_number", "full_name", "email"]
    ordering = ["-date_joined"]

    actions = ['soft_delete_users', 'restore_users']

    def deletion_status(self, obj):
        """Display deletion status with color coding"""
        if obj.deleted_at:
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                'red',
                'Deleted'
            )
        return format_html(
            '<span style="color: {};">{}</span>',
            'green',
            'Active'
        )
    deletion_status.short_description = "Status"

    fieldsets = (
        (None, {"fields": ("phone_number", "password")}),
        ("Personal Info", {"fields": ("full_name", "email", "supabase_uid")}),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
        ("Soft Delete", {"fields": ("deleted_at",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "phone_number",
                    "password1",
                    "password2",
                    "role",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    readonly_fields = ["date_joined", "last_login", "deleted_at"]

    @admin.action(description="Soft delete selected users")
    def soft_delete_users(self, request, queryset):
        """Soft delete selected users"""
        count = 0
        for user in queryset:
            if not user.is_deleted and user.id != request.user.id:
                user.soft_delete()
                count += 1
        self.message_user(request, f"{count} user(s) have been soft deleted.")

    @admin.action(description="Restore selected users")
    def restore_users(self, request, queryset):
        """Restore soft-deleted users"""
        count = 0
        for user in queryset:
            if user.is_deleted:
                user.restore()
                count += 1
        self.message_user(request, f"{count} user(s) have been restored.")


@admin.register(ShopkeeperProfile)
class ShopkeeperProfileAdmin(admin.ModelAdmin):
    """Admin interface for Shopkeeper Profile"""

    list_display = ["shop_name", "user", "is_verified", "created_at"]
    list_filter = ["is_verified", "created_at"]
    search_fields = ["shop_name", "user__phone_number", "gst_number"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("User", {"fields": ("user",)}),
        (
            "Shop Information",
            {"fields": ("shop_name", "shop_address", "location", "gst_number")},
        ),
        ("Verification", {"fields": ("is_verified",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
