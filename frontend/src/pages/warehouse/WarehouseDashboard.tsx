import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function WarehouseDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalItems: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    setTimeout(() => {
      setStats({
        totalOrders: 45,
        pendingOrders: 8,
        totalItems: 120,
        lowStockItems: 5,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBagIcon />, color: 'primary' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <PendingActionsIcon />, color: 'warning' },
    { label: 'Total Items', value: stats.totalItems, icon: <InventoryIcon />, color: 'info' },
    { label: 'Low Stock', value: stats.lowStockItems, icon: <CheckCircleIcon />, color: 'error' },
  ];

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Warehouse Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your warehouse operations
        </Typography>
      </Box>

      <Grid container spacing={3}>
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
    </Container>
  );
}
