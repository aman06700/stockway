from django.urls import path
from . import views

urlpatterns = [
    # Warehouse Management
    path("onboarding/", views.WarehouseOnboardingView.as_view(), name="warehouse-onboarding"),
    path("create/", views.WarehouseCreateView.as_view(), name="warehouse-create"),
    path("<int:pk>/", views.WarehouseDetailView.as_view(), name="warehouse-detail"),

    # Warehouse Orders
    path("<int:warehouse_id>/orders/", views.WarehouseOrderListView.as_view(), name="warehouse-orders"),
    path("<int:warehouse_id>/orders/<int:order_id>/confirm/", views.WarehouseOrderConfirmView.as_view(), name="warehouse-order-confirm"),
    path("<int:warehouse_id>/orders/<int:order_id>/assign/", views.WarehouseOrderAssignView.as_view(), name="warehouse-order-assign"),

    # Nearby Warehouses (for customers/shopkeepers)
    path("nearby/", views.NearbyWarehousesView.as_view(), name="warehouses-nearby"),
    path("proximity/", views.WarehouseProximityView.as_view(), name="warehouses-proximity"),
]
