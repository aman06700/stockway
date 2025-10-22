"""
URL configuration for Supabase integration endpoints.
"""

from django.urls import path
from .supabase_views import (
    supabase_health_check,
    verify_token,
    upload_file,
    upload_product_image_view,
    upload_rider_document_view,
)

urlpatterns = [
    path("health/", supabase_health_check, name="supabase-health"),
    path("verify-token/", verify_token, name="supabase-verify-token"),
    path("upload/", upload_file, name="supabase-upload"),
    path(
        "upload-product-image/",
        upload_product_image_view,
        name="supabase-upload-product",
    ),
    path(
        "upload-rider-document/",
        upload_rider_document_view,
        name="supabase-upload-rider-doc",
    ),
]
