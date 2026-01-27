from django.urls import path
from accounts.views import (
    SignUpView,
    SignInView,
    LogoutView,
    CurrentUserView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserDeactivateView,
    AdminUserRestoreView,
    AdminUserHardDeleteView,
    AdminUserDependenciesView,
    ProfilePictureUploadView,
)


urlpatterns = [
    # Email/Password Authentication endpoints
    path("signup/", SignUpView.as_view(), name="signup"),
    path("signin/", SignInView.as_view(), name="signin"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path(
        "profile-picture/",
        ProfilePictureUploadView.as_view(),
        name="profile-picture-upload",
    ),
    # Admin User Management endpoints
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path(
        "admin/users/<int:user_id>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),
    path(
        "admin/users/<int:user_id>/deactivate/",
        AdminUserDeactivateView.as_view(),
        name="admin-user-deactivate",
    ),
    path(
        "admin/users/<int:user_id>/restore/",
        AdminUserRestoreView.as_view(),
        name="admin-user-restore",
    ),
    path(
        "admin/users/<int:user_id>/delete/",
        AdminUserHardDeleteView.as_view(),
        name="admin-user-hard-delete",
    ),
    path(
        "admin/users/<int:user_id>/dependencies/",
        AdminUserDependenciesView.as_view(),
        name="admin-user-dependencies",
    ),
]
