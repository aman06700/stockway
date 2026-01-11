from django.urls import path
from .views import (
    ItemListCreateView,
    ItemDetailView,
    ItemImageUploadView,
)

# Placeholder for inventory URLs
# Add your inventory-specific endpoints here

urlpatterns = [
    path(
        "warehouses/<int:warehouse_id>/items/",
        ItemListCreateView.as_view(),
        name="item-list-create",
    ),
    path(
        "warehouses/<int:warehouse_id>/items/<int:pk>/",
        ItemDetailView.as_view(),
        name="item-detail",
    ),
    path(
        "warehouses/<int:warehouse_id>/items/<int:item_id>/images/",
        ItemImageUploadView.as_view(),
        name="item-image-images",
    ),
]
