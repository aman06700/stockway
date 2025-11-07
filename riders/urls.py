# riders/urls.py
from django.urls import path
from .views import (
    RiderRegistrationView,
    RiderProfileView,
    RiderOrdersView,
    RiderOrderUpdateView,
    RiderLocationUpdateView,
    WarehouseRidersListView,
    RiderDetailView,
)

app_name = "riders"

urlpatterns = [
    # Rider endpoints
    path("rider/register/", RiderRegistrationView.as_view(), name="rider-register"),
    path("rider/profile/", RiderProfileView.as_view(), name="rider-profile"),
    path("rider/orders/", RiderOrdersView.as_view(), name="rider-orders"),
    path(
        "rider/orders/update/",
        RiderOrderUpdateView.as_view(),
        name="rider-order-update",
    ),
    path(
        "rider/location/update/",
        RiderLocationUpdateView.as_view(),
        name="rider-location-update",
    ),
    # Warehouse admin endpoints
    path(
        "warehouse/riders/",
        WarehouseRidersListView.as_view(),
        name="warehouse-riders-list",
    ),
    path("warehouse/riders/<int:pk>/", RiderDetailView.as_view(), name="rider-detail"),
]
