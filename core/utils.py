"""
Utility functions shared across the application.
Provides common helpers for validation, formatting, and data manipulation.
"""

from typing import Optional, Tuple
from decimal import Decimal
from math import radians, sin, cos, sqrt, atan2


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two GPS coordinates using Haversine formula.

    Args:
        lat1: Latitude of first point
        lon1: Longitude of first point
        lat2: Latitude of second point
        lon2: Longitude of second point

    Returns:
        Distance in kilometers
    """
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Earth radius in kilometers
    return 6371 * c


def validate_coordinates(lat: str, lon: str) -> Tuple[bool, Optional[str]]:
    """
    Validate GPS coordinates.

    Args:
        lat: Latitude string
        lon: Longitude string

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        latitude = float(lat)
        longitude = float(lon)

        if not (-90 <= latitude <= 90):
            return False, "Latitude must be between -90 and 90"

        if not (-180 <= longitude <= 180):
            return False, "Longitude must be between -180 and 180"

        return True, None
    except (ValueError, TypeError):
        return False, "Invalid coordinate format. Must be numeric."


def format_phone_number(phone: str) -> str:
    """
    Format phone number to consistent format.

    Args:
        phone: Phone number string

    Returns:
        Formatted phone number
    """
    # Remove all non-numeric characters
    cleaned = "".join(filter(str.isdigit, phone))

    # Add country code if not present
    if not cleaned.startswith("91") and len(cleaned) == 10:
        cleaned = "91" + cleaned

    return "+" + cleaned


def calculate_delivery_fee(
    distance_km: float, base_fee: Decimal = Decimal("10.00")
) -> Decimal:
    """
    Calculate delivery fee based on distance.

    Args:
        distance_km: Distance in kilometers
        base_fee: Base fee per kilometer

    Returns:
        Total delivery fee
    """
    return Decimal(str(distance_km)) * base_fee


def generate_transaction_id(prefix: str = "TXN") -> str:
    """
    Generate unique transaction ID.

    Args:
        prefix: Prefix for transaction ID

    Returns:
        Unique transaction ID
    """
    import uuid

    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
