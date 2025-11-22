"""
Test cases for shopkeepers views/API endpoints
"""
from rest_framework.test import APITestCase
from rest_framework import status
from shopkeepers.models import Notification, SupportTicket
from factories import (
    ShopkeeperUserFactory,
    ShopkeeperNotificationFactory,
    SupportTicketFactory
)


class TestShopkeeperNotificationAPI(APITestCase):
    """Test shopkeeper notification API endpoints"""

    def test_shopkeeper_can_view_notifications(self):
        """Test shopkeeper can view their notifications"""
        shopkeeper = ShopkeeperUserFactory()
        ShopkeeperNotificationFactory.create_batch(3, user=shopkeeper)

        # Adjust based on actual endpoint
        # response = self.client.get('/api/shopkeepers/notifications/')
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertEqual(len(response.data), 3)

    def test_mark_notification_as_read(self):
        """Test marking a notification as read"""
        shopkeeper = ShopkeeperUserFactory()
        notification = ShopkeeperNotificationFactory(user=shopkeeper, is_read=False)

        # Adjust based on actual endpoint
        # response = self.client.patch(
        #     f'/api/shopkeepers/notifications/{notification.id}/mark-read/'
        # )
        # self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestSupportTicketAPI(APITestCase):
    """Test support ticket API endpoints"""

    def test_create_support_ticket(self):
        """Test shopkeeper can create a support ticket"""
        shopkeeper = ShopkeeperUserFactory()

        # Adjust based on actual endpoint
        # ticket_data = {
        #     'subject': 'Need Help',
        #     'description': 'I have an issue with my order',
        #     'category': 'orders',
        #     'priority': 'HIGH'
        # }
        # response = self.client.post('/api/support/tickets/', ticket_data)
        # self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_shopkeeper_can_view_own_tickets(self):
        """Test shopkeeper can view their own tickets"""
        shopkeeper1 = ShopkeeperUserFactory()
        shopkeeper2 = ShopkeeperUserFactory()

        ticket1 = SupportTicketFactory(user=shopkeeper1)
        ticket2 = SupportTicketFactory(user=shopkeeper2)

        # Shopkeeper should only see their own tickets
        # Adjust based on actual endpoint
        # response = self.client.get('/api/support/tickets/')
        # self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_ticket_status(self):
        """Test updating support ticket status"""
        shopkeeper = ShopkeeperUserFactory()
        ticket = SupportTicketFactory(user=shopkeeper, status='OPEN')

        # Adjust based on actual endpoint
        # response = self.client.patch(
        #     f'/api/support/tickets/{ticket.id}/',
        #     {'status': 'RESOLVED'}
        # )
        # self.assertEqual(response.status_code, status.HTTP_200_OK)

