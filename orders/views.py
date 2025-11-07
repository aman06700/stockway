# orders/views.py
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Prefetch
from .models import Order, OrderItem
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderListSerializer
)


class IsShopkeeper(permissions.BasePermission):
    """Permission class to check if user is a shopkeeper"""

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'SHOPKEEPER'
        )


class IsWarehouseAdmin(permissions.BasePermission):
    """Permission class to check if user is a warehouse admin"""

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'WAREHOUSE_MANAGER'
        )


class OrderCreateView(APIView):
    """
    POST /api/shopkeeper/orders/create/
    Create a new order (shopkeeper only)
    """
    permission_classes = [permissions.IsAuthenticated, IsShopkeeper]

    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            try:
                order = serializer.save()

                # Fetch the created order with related data
                order = Order.objects.select_related(
                    'shopkeeper',
                    'warehouse'
                ).prefetch_related(
                    Prefetch(
                        'order_items',
                        queryset=OrderItem.objects.select_related('item')
                    )
                ).get(id=order.id)

                response_serializer = OrderSerializer(order)
                return Response(
                    response_serializer.data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ShopkeeperOrderListView(generics.ListAPIView):
    """
    GET /api/shopkeeper/orders/
    List all orders for the authenticated shopkeeper
    """
    permission_classes = [permissions.IsAuthenticated, IsShopkeeper]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(
            shopkeeper=self.request.user
        ).select_related(
            'warehouse',
            'shopkeeper'
        ).order_by('-created_at')


class ShopkeeperOrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/shopkeeper/orders/{id}/
    Get details of a specific order
    """
    permission_classes = [permissions.IsAuthenticated, IsShopkeeper]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(
            shopkeeper=self.request.user
        ).select_related(
            'shopkeeper',
            'warehouse'
        ).prefetch_related(
            Prefetch(
                'order_items',
                queryset=OrderItem.objects.select_related('item')
            )
        )


class WarehouseOrderListView(generics.ListAPIView):
    """
    GET /api/warehouse/orders/
    List all orders for the warehouse admin's warehouses
    """
    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdmin]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        # Get all warehouses managed by this admin
        warehouse_ids = self.request.user.warehouses.values_list('id', flat=True)

        # Filter by status if provided
        queryset = Order.objects.filter(
            warehouse_id__in=warehouse_ids
        ).select_related(
            'warehouse',
            'shopkeeper'
        ).order_by('-created_at')

        # Optional status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset


class WarehouseOrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/warehouse/orders/{id}/
    Get details of a specific order for warehouse admin
    """
    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdmin]
    serializer_class = OrderSerializer

    def get_queryset(self):
        warehouse_ids = self.request.user.warehouses.values_list('id', flat=True)

        return Order.objects.filter(
            warehouse_id__in=warehouse_ids
        ).select_related(
            'shopkeeper',
            'warehouse'
        ).prefetch_related(
            Prefetch(
                'order_items',
                queryset=OrderItem.objects.select_related('item')
            )
        )


class WarehousePendingOrdersView(generics.ListAPIView):
    """
    GET /api/warehouse/orders/pending/
    List all pending orders for warehouse admin's warehouses
    """
    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdmin]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        warehouse_ids = self.request.user.warehouses.values_list('id', flat=True)

        return Order.objects.filter(
            warehouse_id__in=warehouse_ids,
            status='pending'
        ).select_related(
            'warehouse',
            'shopkeeper'
        ).order_by('created_at')  # Oldest first for pending


class OrderAcceptView(APIView):
    """
    POST /api/warehouse/orders/{id}/accept/
    Accept a pending order
    """
    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdmin]

    def post(self, request, pk):
        try:
            warehouse_ids = request.user.warehouses.values_list('id', flat=True)

            order = Order.objects.select_related('warehouse').get(
                id=pk,
                warehouse_id__in=warehouse_ids
            )

            if order.status != 'pending':
                return Response(
                    {'error': f'Order is already {order.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = 'accepted'
            order.save(update_fields=['status', 'updated_at'])

            # Fetch updated order with full details
            order = Order.objects.select_related(
                'shopkeeper',
                'warehouse'
            ).prefetch_related(
                Prefetch(
                    'order_items',
                    queryset=OrderItem.objects.select_related('item')
                )
            ).get(id=order.id)

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class OrderRejectView(APIView):
    """
    POST /api/warehouse/orders/{id}/reject/
    Reject a pending order with a reason
    """
    permission_classes = [permissions.IsAuthenticated, IsWarehouseAdmin]

    def post(self, request, pk):
        try:
            warehouse_ids = request.user.warehouses.values_list('id', flat=True)

            order = Order.objects.select_related('warehouse').get(
                id=pk,
                warehouse_id__in=warehouse_ids
            )

            if order.status != 'pending':
                return Response(
                    {'error': f'Order is already {order.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            rejection_reason = request.data.get('rejection_reason')
            if not rejection_reason:
                return Response(
                    {'error': 'Rejection reason is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = 'rejected'
            order.rejection_reason = rejection_reason
            order.save(update_fields=['status', 'rejection_reason', 'updated_at'])

            # Fetch updated order with full details
            order = Order.objects.select_related(
                'shopkeeper',
                'warehouse'
            ).prefetch_related(
                Prefetch(
                    'order_items',
                    queryset=OrderItem.objects.select_related('item')
                )
            ).get(id=order.id)

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

