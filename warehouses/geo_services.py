from django.contrib.gis.db.models.functions import Distance
from riders.models import RiderProfile


def find_nearest_available_rider(warehouse, max_distance_km=50):
    """
    Find the nearest available rider to a warehouse using PostGIS.

    Args:
        warehouse: Warehouse instance
        max_distance_km: Maximum distance in kilometers to search for riders

    Returns:
        RiderProfile instance or None
    """
    if not warehouse.location:
        return None

    # Convert km to meters for PostGIS distance calculation
    max_distance_m = max_distance_km * 1000

    # Check if RiderProfile has location field
    # If not, return None as we can't calculate distance
    if not hasattr(RiderProfile, "location") and not hasattr(
        RiderProfile, "current_location"
    ):
        return None

    location_field = (
        "current_location" if hasattr(RiderProfile, "current_location") else "location"
    )

    # Find available riders within max distance, ordered by distance
    try:
        nearest_rider = (
            RiderProfile.objects.filter(**{f"{location_field}__isnull": False})
            .annotate(distance=Distance(location_field, warehouse.location))
            .filter(distance__lte=max_distance_m)
            .order_by("distance")
            .first()
        )

        return nearest_rider
    except Exception:
        # If there's an error (e.g., location field doesn't exist), return None
        return None


def calculate_distance_km(point1, point2):
    """
    Calculate distance between two points in kilometers.

    Args:
        point1: Point object (e.g., warehouse.location)
        point2: Point object (e.g., rider.current_location)

    Returns:
        Distance in kilometers as float
    """
    if not point1 or not point2:
        return None

    # PostGIS distance is in meters for geography type
    distance_m = point1.distance(point2)
    return distance_m / 1000.0


def get_riders_within_radius(warehouse, radius_km=10):
    """
    Get all available riders within a specific radius of the warehouse.

    Args:
        warehouse: Warehouse instance
        radius_km: Radius in kilometers

    Returns:
        QuerySet of RiderProfile instances with distance annotation
    """
    if not warehouse.location:
        return RiderProfile.objects.none()

    # Check if RiderProfile has location field
    if not hasattr(RiderProfile, "location") and not hasattr(
        RiderProfile, "current_location"
    ):
        return RiderProfile.objects.none()

    location_field = (
        "current_location" if hasattr(RiderProfile, "current_location") else "location"
    )
    radius_m = radius_km * 1000

    try:
        riders = (
            RiderProfile.objects.filter(**{f"{location_field}__isnull": False})
            .annotate(distance=Distance(location_field, warehouse.location))
            .filter(distance__lte=radius_m)
            .order_by("distance")
        )

        return riders
    except Exception:
        return RiderProfile.objects.none()
