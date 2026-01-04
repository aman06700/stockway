from django.urls import path
from accounts.views import (
    SendOTPView,
    VerifyOTPView,
    LogoutView,
    CurrentUserView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserDeactivateView,
    AdminUserRestoreView,
    AdminUserHardDeleteView,
    AdminUserDependenciesView,
)


urlpatterns = [
    # OTP Authentication endpoints
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", CurrentUserView.as_view(), name="current-user"),

    # Admin User Management endpoints
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("admin/users/<int:user_id>/deactivate/", AdminUserDeactivateView.as_view(), name="admin-user-deactivate"),
    path("admin/users/<int:user_id>/restore/", AdminUserRestoreView.as_view(), name="admin-user-restore"),
    path("admin/users/<int:user_id>/delete/", AdminUserHardDeleteView.as_view(), name="admin-user-hard-delete"),
    path("admin/users/<int:user_id>/dependencies/", AdminUserDependenciesView.as_view(), name="admin-user-dependencies"),
]
