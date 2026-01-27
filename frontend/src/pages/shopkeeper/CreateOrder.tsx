import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { warehouseService } from '@/services/warehouseService';
import { inventoryService } from '@/services/inventoryService';
import { orderService } from '@/services/orderService';
import { Warehouse, InventoryItem } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNotification } from '@/components/common/NotificationSnackbar';

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export default function CreateOrder() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchWarehouseItems();
    }
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getNearbyWarehouses();
      setWarehouses(data);
    } catch (error) {
      showNotification('Failed to fetch warehouses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseItems = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.browseInventory({
        warehouse: selectedWarehouse as number,
        in_stock: true,
      });
      setAvailableItems(data);
    } catch (error) {
      showNotification('Failed to fetch items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      updateQuantity(item.id, existing.quantity + 1);
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map((c) => (c.item.id === itemId ? { ...c, quantity } : c)));
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, c) => sum + parseFloat(c.item.price) * c.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedWarehouse || cart.length === 0) {
      showNotification('Please select items to order', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        warehouse_id: selectedWarehouse as number,
        items: cart.map((c) => ({
          item_id: c.item.id,
          quantity: c.quantity,
        })),
      };

      const newOrder = await orderService.createOrder(orderData);
      showNotification('Order placed successfully!', 'success');
      navigate(`/shopkeeper/orders/${newOrder.id}`);
    } catch (error: any) {
      showNotification(
        error.response?.data?.error || 'Failed to create order',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && warehouses.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Order
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a warehouse and add items to your order
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Warehouse</InputLabel>
          <Select
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value as number);
              setCart([]);
            }}
            label="Select Warehouse"
          >
            {warehouses.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name} - {w.address}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedWarehouse && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Available Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => addToCart(item)}>
                          Add to Cart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {cart.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cart ({cart.length} items)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((cartItem) => (
                  <TableRow key={cartItem.item.id}>
                    <TableCell>{cartItem.item.name}</TableCell>
                    <TableCell align="right">₹{cartItem.item.price}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                          }
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={cartItem.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              cartItem.item.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          size="small"
                          sx={{ width: 60, mx: 1 }}
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ₹{(parseFloat(cartItem.item.price) * cartItem.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(cartItem.item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="h6" fontWeight="bold">
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ₹{calculateTotal().toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button onClick={() => setCart([])}>Clear Cart</Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
