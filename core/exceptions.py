"""
Custom exceptions for the application.
Provides structured error handling across all domain apps.
"""

from rest_framework.exceptions import APIException
from rest_framework import status


class BusinessLogicError(APIException):
    """Base exception for business logic errors."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A business logic error occurred."
    default_code = "business_logic_error"


class InsufficientStockError(BusinessLogicError):
    """Raised when inventory stock is insufficient for an order."""

    default_detail = "Insufficient stock available."
    default_code = "insufficient_stock"


class InvalidOrderStateError(BusinessLogicError):
    """Raised when attempting invalid state transitions on orders."""

    default_detail = "Invalid order state transition."
    default_code = "invalid_order_state"


class PaymentError(BusinessLogicError):
    """Raised when payment processing fails."""

    default_detail = "Payment processing failed."
    default_code = "payment_error"


class UnauthorizedActionError(APIException):
    """Raised when user attempts unauthorized action."""

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You are not authorized to perform this action."
    default_code = "unauthorized_action"


class ResourceNotFoundError(APIException):
    """Raised when a requested resource is not found."""

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "The requested resource was not found."
    default_code = "resource_not_found"


class ProfileNotCompleteError(BusinessLogicError):
    """Raised when user profile is incomplete for an operation."""

    default_detail = "Please complete your profile before proceeding."
    default_code = "profile_incomplete"
