"""
Test cases for shopkeepers models
"""
from django.test import TestCase
from shopkeepers.models import Notification, SupportTicket
from factories import (
    ShopkeeperNotificationFactory,
    SupportTicketFactory,
    ShopkeeperUserFactory
)


class TestShopkeeperNotificationModel(TestCase):
    """Test Shopkeeper Notification model"""

    def test_create_notification(self):
        """Test creating a shopkeeper notification"""
        user = ShopkeeperUserFactory()
        notification = ShopkeeperNotificationFactory(
            user=user,
            title='Test Notification',
            message='Test message',
            notification_type='INFO'
        )

        self.assertEqual(notification.user, user)
        self.assertEqual(notification.title, 'Test Notification')
        self.assertEqual(notification.notification_type, 'INFO')
        self.assertFalse(notification.is_read)

    def test_notification_types(self):
        """Test different notification types"""
        types = ['INFO', 'WARNING', 'ERROR', 'SUCCESS']

        for notif_type in types:
            notification = ShopkeeperNotificationFactory(notification_type=notif_type)
            self.assertEqual(notification.notification_type, notif_type)

    def test_notification_mark_as_read(self):
        """Test marking notification as read"""
        notification = ShopkeeperNotificationFactory(is_read=False)
        self.assertFalse(notification.is_read)

        notification.is_read = True
        notification.save()
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_notification_ordering(self):
        """Test notifications are ordered by created_at desc"""
        user = ShopkeeperUserFactory()
        notif1 = ShopkeeperNotificationFactory(user=user, title='First')
        notif2 = ShopkeeperNotificationFactory(user=user, title='Second')

        notifications = Notification.objects.filter(user=user)
        self.assertEqual(notifications.first().title, 'Second')


class TestSupportTicketModel(TestCase):
    """Test Support Ticket model"""

    def test_create_support_ticket(self):
        """Test creating a support ticket"""
        user = ShopkeeperUserFactory()
        ticket = SupportTicketFactory(
            user=user,
            subject='Need Help',
            description='I have an issue',
            status='OPEN',
            priority='HIGH'
        )

        self.assertEqual(ticket.user, user)
        self.assertEqual(ticket.subject, 'Need Help')
        self.assertEqual(ticket.status, 'OPEN')
        self.assertEqual(ticket.priority, 'HIGH')

    def test_ticket_status_choices(self):
        """Test support ticket status choices"""
        statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

        for status in statuses:
            ticket = SupportTicketFactory(status=status)
            self.assertEqual(ticket.status, status)

    def test_ticket_priority_choices(self):
        """Test support ticket priority choices"""
        priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

        for priority in priorities:
            ticket = SupportTicketFactory(priority=priority)
            self.assertEqual(ticket.priority, priority)

    def test_ticket_user_relationship(self):
        """Test ticket user foreign key"""
        user = ShopkeeperUserFactory()
        ticket = SupportTicketFactory(user=user)

        self.assertEqual(ticket.user, user)
        self.assertIn(ticket, user.support_tickets.all())

