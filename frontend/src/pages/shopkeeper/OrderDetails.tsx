import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { shopkeeperService } from '@/services/shopkeeperService';
import { Order } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import OrderStatusChip from '@/components/common/OrderStatusChip';
import { format } from 'date-fns';

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const data = await shopkeeperService.getOrderDetails(parseInt(orderId!));
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!order) {
    return (
      <Container>
        <Typography variant="h5">Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/shopkeeper/orders')}
        >
          Back to Orders
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Order #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
            </Typography>
          </Box>
          <OrderStatusChip status={order.status} size="medium" />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Warehouse Details
                </Typography>
                <Typography variant="body2">{order.warehouse_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.warehouse_address}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {order.rider_info && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Delivery Information
                  </Typography>
                  <Typography variant="body2">
                    Rider: {order.rider_info.rider_phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Fee: ₹{order.rider_info.delivery_fee}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Order Items
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.order_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.item_sku}</TableCell>
                    <TableCell align="right">₹{item.price}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="h6" fontWeight="bold">
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ₹{order.total_amount}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {order.rejection_reason && (
          <Box mt={3}>
            <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" color="error" gutterBottom>
                  Rejection Reason
                </Typography>
                <Typography variant="body2">{order.rejection_reason}</Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
