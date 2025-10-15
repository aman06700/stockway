# payments/models.py
from django.db import models
from django.conf import settings
from orders.models import Order


class Payment(models.Model):
    """
    Model to handle payments for orders and payouts.
    """

    PAYMENT_TYPE_CHOICES = (
        ("order", "Order Payment"),
        ("rider_payout", "Rider Payout"),
        ("warehouse_settlement", "Warehouse Settlement"),
    )
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="payments", null=True, blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments"
    )
    payment_type = models.CharField(max_length=30, choices=PAYMENT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(
        max_length=255, blank=True
    )  # For external payment gateway reference
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_payment_type_display()} of {self.amount} for {self.user.username}"
