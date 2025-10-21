
# orders/urls.py
from django.urls import path
from .views import (
    ShopkeeperOrderCreateAPIView,
    ShopkeeperOrderListAPIView,
)

urlpatterns = [
    path("create/", ShopkeeperOrderCreateAPIView.as_view(), name="order-create"),
    path("", ShopkeeperOrderListAPIView.as_view(), name="order-list"),
]
