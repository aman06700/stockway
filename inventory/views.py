from typing import Any, Dict
from rest_framework.request import Request
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Item
from .serializers import (
    ItemSerializer,
    ItemImageUploadSerializer,
    ItemImageDeleteSerializer,
)
from warehouses.models import Warehouse
from core.permissions import IsWarehouseAdminOrSuperAdmin
from configs.supabase_storage import (
    upload_item_image,
    SupabaseStorage,
    delete_item_image,
)


class WarehouseScopedMixin:
    """
    Mixin to retrieve a warehouse from URL kwargs and enforce object-level permission:
    - Only the warehouse's admin can manage its items, unless the user is SUPER_ADMIN.
    """

    lookup_warehouse_url_kwarg = "warehouse_id"
    request: Request
    kwargs: Dict[str, Any]

    def get_warehouse(self) -> Warehouse:
        warehouse_id = self.kwargs.get(self.lookup_warehouse_url_kwarg)
        warehouse = get_object_or_404(Warehouse, pk=warehouse_id)
        request = self.request
        user = request.user
        if not IsWarehouseAdminOrSuperAdmin().has_permission(request, self):
            raise PermissionDenied()
        if not (user.is_superuser or getattr(user, "role", "") == "ADMIN"):
            if getattr(warehouse, "admin_id", None) != user.id:
                raise PermissionDenied()
        return warehouse


class ItemListCreateView(WarehouseScopedMixin, generics.ListCreateAPIView):
    """
    List and create inventory items for a given warehouse.
    URL must include warehouse_id.
    """

    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated, IsWarehouseAdminOrSuperAdmin]

    def get_queryset(self):
        warehouse = self.get_warehouse()
        return Item.objects.filter(warehouse=warehouse).order_by("-created_at")

    def perform_create(self, serializer):
        warehouse = self.get_warehouse()
        serializer.save(warehouse=warehouse)


class ItemDetailView(WarehouseScopedMixin, generics.RetrieveUpdateAPIView):
    """
    Retrieve and update a specific item within a warehouse.
    Ensures the item belongs to the warehouse in the URL and enforces ownership.
    """

    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated, IsWarehouseAdminOrSuperAdmin]
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        warehouse = self.get_warehouse()
        return Item.objects.filter(warehouse=warehouse)

    def update(self, request, *args, **kwargs):
        # Ensure non-negative quantity and ownership already handled by serializer and mixin
        return super().update(request, *args, **kwargs)


class ItemImageUploadView(WarehouseScopedMixin, generics.GenericAPIView):
    serializer_class = ItemImageUploadSerializer
    permission_classes = [IsAuthenticated, IsWarehouseAdminOrSuperAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, warehouse_id: int, item_id: int, *args, **kwargs):
        warehouse = self.get_warehouse()
        item = get_object_or_404(Item, pk=item_id, warehouse=warehouse)

        serializer = self.get_serializer(data={"images": request.FILES.getlist("images")})
        serializer.is_valid(raise_exception=True)

        # Ensure bucket exists (idempotent)
        SupabaseStorage.ensure_bucket("item-images", public=True)

        uploaded_urls = list(item.image_urls or [])
        for image in serializer.validated_data["images"]:
            upload_result = upload_item_image(warehouse.id, item.id, image)
            if not upload_result.get("success"):
                return Response(
                    {"error": upload_result.get("error", "Upload failed")},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            uploaded_urls.append(upload_result["url"])

        item.image_urls = uploaded_urls
        item.save(update_fields=["image_urls", "updated_at"])
        return Response({"image_urls": item.image_urls}, status=status.HTTP_200_OK)

    def delete(self, request, warehouse_id: int, item_id: int, *args, **kwargs):
        warehouse = self.get_warehouse()
        item = get_object_or_404(Item, pk=item_id, warehouse=warehouse)

        serializer = ItemImageDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        filenames = serializer.validated_data["filenames"]

        remaining_urls = []
        for url in item.image_urls or []:
            if not any(url.endswith(name) for name in filenames):
                remaining_urls.append(url)
                continue
            filename = url.split("/")[-1]
            delete_item_image(warehouse.id, item.id, filename)

        item.image_urls = remaining_urls
        item.save(update_fields=["image_urls", "updated_at"])
        return Response({"remaining_image_urls": item.image_urls}, status=status.HTTP_200_OK)
