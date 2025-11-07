# riders/views.py
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.db import transaction
from decimal import Decimal
import logging

from .models import Rider
from .serializers import (
    RiderSerializer,
    RiderRegistrationSerializer,
    RiderProfileSerializer,
    RiderLocationUpdateSerializer,
    RiderListSerializer,
)
from orders.models import Order
from orders.serializers import OrderListSerializer
from payments.models import Payment
from core.permissions import IsRider, IsWarehouseAdminOrSuperAdmin

logger = logging.getLogger(__name__)


class RiderRegistrationView(APIView):
    """
    POST /api/rider/register/
    Register a new rider (warehouse_admin or super_admin only)
    """

    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdminOrSuperAdmin]

    def post(self, request):
        serializer = RiderRegistrationSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            try:
                rider = serializer.save()
                response_serializer = RiderSerializer(rider)
                return Response(
                    response_serializer.data, status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Rider registration failed: {str(e)}", exc_info=True)
                return Response(
                    {"error": "Rider registration failed", "detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            {"error": "Validation failed", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class RiderProfileView(APIView):
    """
    GET /api/rider/profile/
    Get rider profile details

    PUT /api/rider/profile/
    Update rider profile (limited fields)
    """

    permission_classes = [permissions.IsAuthenticated, IsRider]

    def get(self, request):
        try:
            rider = Rider.objects.select_related("user", "warehouse").get(
                user=request.user
            )
            serializer = RiderProfileSerializer(rider)
            return Response(serializer.data)
        except Rider.DoesNotExist:
            return Response(
                {"error": "Rider profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def put(self, request):
        try:
            rider = Rider.objects.select_related("user", "warehouse").get(
                user=request.user
            )
        except Rider.DoesNotExist:
            return Response(
                {"error": "Rider profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only allow updating specific fields
        allowed_fields = ["status"]
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = RiderProfileSerializer(rider, data=update_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            {"error": "Validation failed", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class RiderOrdersView(ListAPIView):
    """
    GET /api/rider/orders/
    Get assigned orders (status != delivered)
    """

    permission_classes = [permissions.IsAuthenticated, IsRider]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        # Get orders assigned to this rider that are not delivered
        return (
            Order.objects.filter(
                delivery__rider=self.request.user,
            )
            .exclude(status="delivered")
            .select_related("shopkeeper", "warehouse", "delivery")
            .order_by("-created_at")
        )


class RiderOrderUpdateView(APIView):
    """
    PATCH /api/rider/orders/update/
    Update order status transitions (assigned → in_transit → delivered)
    """

    permission_classes = [permissions.IsAuthenticated, IsRider]

    def patch(self, request):
        order_id = request.data.get("order_id")
        new_status = request.data.get("status")

        if not order_id or not new_status:
            return Response(
                {"error": "order_id and status are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate status
        valid_statuses = ["assigned", "in_transit", "delivered"]
        if new_status not in valid_statuses:
            return Response(
                {
                    "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Get order assigned to this rider
            order = Order.objects.select_related(
                "delivery", "warehouse", "shopkeeper"
            ).get(id=order_id, delivery__rider=request.user)

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found or not assigned to you"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate state transitions
        current_status = order.status
        valid_transitions = {
            "assigned": ["in_transit"],
            "in_transit": ["delivered"],
            "delivered": [],
        }

        if new_status not in valid_transitions.get(current_status, []):
            return Response(
                {
                    "error": f"Invalid transition from {current_status} to {new_status}",
                    "detail": f"Valid transitions from {current_status}: {', '.join(valid_transitions.get(current_status, []))}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                # Update order status
                order.status = new_status
                order.save()

                # Update delivery status
                if order.delivery:
                    order.delivery.status = new_status
                    order.delivery.save()

                # Handle delivery completion
                if new_status == "delivered":
                    self._handle_delivery_completion(order)

                logger.info(
                    f"Order {order.id} status updated to {new_status} by rider {request.user.id}"
                )

                response_data = {
                    "order_id": order.id,
                    "status": order.status,
                    "message": f"Order status updated to {new_status}",
                }

                # Add payout info if delivered
                if new_status == "delivered":
                    rider = Rider.objects.get(user=request.user)
                    response_data["payout_summary"] = {
                        "rider_id": rider.id,
                        "total_earnings": str(rider.total_earnings),
                        "delivery_payout": str(order.delivery.delivery_fee),
                    }

                return Response(response_data)

        except Exception as e:
            logger.error(f"Order status update failed: {str(e)}", exc_info=True)
            return Response(
                {"error": "Order status update failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _handle_delivery_completion(self, order):
        """Handle delivery completion logic"""
        try:
            rider = Rider.objects.get(user=order.delivery.rider)

            # Calculate payout
            base_rate = Decimal("50.00")  # Base delivery fee
            rate_per_km = Decimal("10.00")  # Rate per km

            # Calculate distance if locations are available
            distance_km = Decimal("0.00")
            if rider.current_location and order.warehouse.location:
                from django.contrib.gis.db.models.functions import Distance

                # Calculate distance in meters and convert to km
                distance_meters = rider.current_location.distance(
                    order.warehouse.location
                )
                distance_km = Decimal(str(distance_meters / 1000)).quantize(
                    Decimal("0.01")
                )

            payout = base_rate + (distance_km * rate_per_km)

            # Update rider status and earnings
            rider.status = "available"
            rider.total_earnings += payout
            rider.save()

            # Update delivery fee
            order.delivery.delivery_fee = payout
            order.delivery.save()

            # Create payout record in Payments module
            Payment.objects.create(
                payment_type="warehouse_to_rider",
                status="pending",
                amount=payout,
                order=order,
                warehouse=order.warehouse,
                payer=order.warehouse.admin,
                payee=rider.user,
                rider=rider.user,
                distance_km=distance_km,
                payment_method="mock",
                notes=f"Delivery payout for Order #{order.id}",
            )

            logger.info(
                f"Delivery completed. Rider {rider.id} earned {payout} for order {order.id}"
            )

        except Rider.DoesNotExist:
            logger.error(f"Rider profile not found for user {order.delivery.rider.id}")
        except Exception as e:
            logger.error(f"Error handling delivery completion: {str(e)}", exc_info=True)
            raise


class RiderLocationUpdateView(APIView):
    """
    PATCH /api/rider/location/update/
    Update rider's current location
    """

    permission_classes = [permissions.IsAuthenticated, IsRider]

    def patch(self, request):
        serializer = RiderLocationUpdateSerializer(data=request.data)

        if serializer.is_valid():
            try:
                rider = Rider.objects.get(user=request.user)

                latitude = serializer.validated_data["latitude"]
                longitude = serializer.validated_data["longitude"]

                rider.set_coordinates(latitude, longitude)
                rider.save()

                return Response(
                    {
                        "message": "Location updated successfully",
                        "latitude": latitude,
                        "longitude": longitude,
                    }
                )

            except Rider.DoesNotExist:
                return Response(
                    {"error": "Rider profile not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            except Exception as e:
                logger.error(f"Location update failed: {str(e)}", exc_info=True)
                return Response(
                    {"error": "Location update failed", "detail": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(
            {"error": "Validation failed", "detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class WarehouseRidersListView(ListAPIView):
    """
    GET /api/warehouse/riders/
    List all riders for warehouse admin's warehouses
    """

    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdminOrSuperAdmin]
    serializer_class = RiderListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or user.role == "ADMIN":
            # Super admin can see all riders
            queryset = Rider.objects.all()
        else:
            # Warehouse admin sees only their warehouse riders
            warehouse_ids = user.warehouses.values_list("id", flat=True)
            queryset = Rider.objects.filter(warehouse_id__in=warehouse_ids)

        # Optional status filter
        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset.select_related("user", "warehouse").order_by("-created_at")


class RiderDetailView(APIView):
    """
    GET /api/warehouse/riders/{id}/
    Get detailed rider information (warehouse admin or super admin)
    """

    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdminOrSuperAdmin]

    def get(self, request, pk):
        try:
            rider = Rider.objects.select_related("user", "warehouse").get(id=pk)

            # Check permission for warehouse admin
            if (
                request.user.role == "WAREHOUSE_MANAGER"
                and rider.warehouse.admin != request.user
            ):
                return Response(
                    {"error": "You can only view riders in your warehouse"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = RiderSerializer(rider)
            return Response(serializer.data)

        except Rider.DoesNotExist:
            return Response(
                {"error": "Rider not found"}, status=status.HTTP_404_NOT_FOUND
            )
