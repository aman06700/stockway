"""
Custom permission classes for role-based access control.
"""

from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class to allow access only to super admins.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role == "ADMIN")
        )


class IsShopkeeper(permissions.BasePermission):
    """
    Permission class to allow access only to shopkeepers.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "SHOPKEEPER"
        )


class IsWarehouseAdmin(permissions.BasePermission):
    """
    Permission class to allow access only to warehouse managers/admins.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "WAREHOUSE_MANAGER"
        )


class IsWarehouseAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission class to allow access to warehouse admins or super admins.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role == "ADMIN"
                or request.user.role == "WAREHOUSE_MANAGER"
            )
        )


class IsRider(permissions.BasePermission):
    """
    Permission class to allow access only to riders.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "RIDER"
        )
