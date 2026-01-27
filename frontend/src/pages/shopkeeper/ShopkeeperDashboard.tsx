import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { shopkeeperService } from '@/services/shopkeeperService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Order } from '@/types';

export default function ShopkeeperDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const orders = await shopkeeperService.getOrders();
      setRecentOrders(orders.slice(0, 5));

      // Calculate stats
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: Order) => o.status === 'pending').length,
        inTransitOrders: orders.filter((o: Order) => o.status === 'in_transit').length,
        deliveredOrders: orders.filter((o: Order) => o.status === 'delivered').length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCartIcon />, color: 'primary' },
    { label: 'Pending', value: stats.pendingOrders, icon: <InventoryIcon />, color: 'warning' },
    { label: 'In Transit', value: stats.inTransitOrders, icon: <LocalShippingIcon />, color: 'info' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: <CheckCircleIcon />, color: 'success' },
  ];

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of your orders.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Orders
          </Typography>
          {recentOrders.length === 0 ? (
            <EmptyState
              message="You haven't placed any orders yet"
              action={
                <Button
                  variant="contained"
                  onClick={() => navigate('/shopkeeper/inventory')}
                >
                  Browse Inventory
                </Button>
              }
            />
          ) : (
            <Box>
              {recentOrders.map((order) => (
                <Box
                  key={order.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600">
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.warehouse_name} • ₹{order.total_amount}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={order.status}
                      size="small"
                      color={
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'in_transit'
                          ? 'primary'
                          : 'warning'
                      }
                    />
                    <Button
                      size="small"
                      onClick={() => navigate(`/shopkeeper/orders/${order.id}`)}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
        {recentOrders.length > 0 && (
          <CardActions>
            <Button onClick={() => navigate('/shopkeeper/orders')}>
              View All Orders
            </Button>
          </CardActions>
        )}
      </Card>
    </Container>
  );
}
