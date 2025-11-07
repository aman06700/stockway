# orders/serializers.py
from rest_framework import serializers
from decimal import Decimal
from django.db import transaction
from .models import Order, OrderItem
from inventory.models import Item
from warehouses.models import Warehouse


class OrderItemInputSerializer(serializers.Serializer):
    """Serializer for order item input during order creation"""
    item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items in responses"""
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_name', 'item_sku', 'quantity', 'price']
        read_only_fields = ['id', 'price']


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders"""
    warehouse_id = serializers.IntegerField()
    items = OrderItemInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate_warehouse_id(self, value):
        """Validate that warehouse exists and is active"""
        try:
            warehouse = Warehouse.objects.get(id=value)
            if not warehouse.is_active:
                raise serializers.ValidationError("Warehouse is not active")
            if not warehouse.is_approved:
                raise serializers.ValidationError("Warehouse is not approved")
            return value
        except Warehouse.DoesNotExist:
            raise serializers.ValidationError("Warehouse not found")

    def validate_items(self, value):
        """Validate that items list is not empty"""
        if not value:
            raise serializers.ValidationError("At least one item is required")
        return value

    def validate(self, data):
        """Cross-field validation for warehouse and items"""
        warehouse_id = data['warehouse_id']
        items_data = data['items']

        # Get all item IDs
        item_ids = [item['item_id'] for item in items_data]

        # Check for duplicate items
        if len(item_ids) != len(set(item_ids)):
            raise serializers.ValidationError({"items": "Duplicate items are not allowed"})

        # Fetch all items in one query
        items = Item.objects.filter(id__in=item_ids).select_related('warehouse')

        if len(items) != len(item_ids):
            raise serializers.ValidationError({"items": "One or more items not found"})

        # Validate that all items belong to the specified warehouse
        for item in items:
            if item.warehouse_id != warehouse_id:
                raise serializers.ValidationError({
                    "items": f"Item '{item.name}' does not belong to the specified warehouse"
                })

        # Validate stock availability
        items_dict = {item.id: item for item in items}
        for item_data in items_data:
            item = items_dict[item_data['item_id']]
            if item.quantity < item_data['quantity']:
                raise serializers.ValidationError({
                    "items": f"Insufficient stock for item '{item.name}'. Available: {item.quantity}, Requested: {item_data['quantity']}"
                })

        # Store items for later use in create method
        data['_items_objects'] = items_dict

        return data

    def create(self, validated_data):
        """Create order with items and update inventory"""
        warehouse_id = validated_data['warehouse_id']
        items_data = validated_data['items']
        items_objects = validated_data['_items_objects']
        user = self.context['request'].user

        with transaction.atomic():
            # Check for duplicate pending/accepted orders
            existing_order = Order.objects.filter(
                shopkeeper=user,
                warehouse_id=warehouse_id,
                status__in=['pending', 'accepted']
            ).exists()

            if existing_order:
                raise serializers.ValidationError({
                    "warehouse_id": "You already have a pending or accepted order with this warehouse"
                })

            # Calculate total amount
            total_amount = Decimal('0.00')
            order_items_to_create = []

            for item_data in items_data:
                item = items_objects[item_data['item_id']]
                quantity = item_data['quantity']
                price = item.price

                # Check stock again (race condition protection)
                if item.quantity < quantity:
                    raise serializers.ValidationError({
                        "items": f"Insufficient stock for item '{item.name}'"
                    })

                # Deduct stock
                item.quantity -= quantity
                item.save(update_fields=['quantity'])

                # Calculate subtotal
                subtotal = price * Decimal(str(quantity))
                total_amount += subtotal

                # Prepare order item
                order_items_to_create.append({
                    'item': item,
                    'quantity': quantity,
                    'price': price
                })

            # Create order
            order = Order.objects.create(
                shopkeeper=user,
                warehouse_id=warehouse_id,
                status='pending',
                total_amount=total_amount
            )

            # Create order items
            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    item=oi['item'],
                    quantity=oi['quantity'],
                    price=oi['price']
                )
                for oi in order_items_to_create
            ])

            return order


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for order responses"""
    order_items = OrderItemSerializer(many=True, read_only=True)
    shopkeeper_email = serializers.CharField(source='shopkeeper.email', read_only=True)
    shopkeeper_phone = serializers.CharField(source='shopkeeper.phone_number', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_address = serializers.CharField(source='warehouse.address', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'shopkeeper', 'shopkeeper_email', 'shopkeeper_phone',
            'warehouse', 'warehouse_name', 'warehouse_address',
            'status', 'total_amount', 'rejection_reason',
            'created_at', 'updated_at', 'order_items'
        ]
        read_only_fields = [
            'id', 'shopkeeper', 'warehouse', 'status', 'total_amount',
            'created_at', 'updated_at'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order lists"""
    shopkeeper_email = serializers.CharField(source='shopkeeper.email', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'shopkeeper_email', 'warehouse_name',
            'status', 'total_amount', 'items_count', 'created_at'
        ]

    def get_items_count(self, obj):
        return obj.order_items.count()

