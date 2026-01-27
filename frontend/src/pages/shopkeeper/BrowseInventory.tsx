import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { inventoryService } from '@/services/inventoryService';
import { warehouseService } from '@/services/warehouseService';
import { InventoryItem, Warehouse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';

export default function BrowseInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [cart, setCart] = useState<Map<number, number>>(new Map());

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [debouncedSearch, selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseService.getNearbyWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: any = { in_stock: true };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedWarehouse) params.warehouse = selectedWarehouse;

      const data = await inventoryService.browseInventory(params);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (itemId: number) => {
    const newCart = new Map(cart);
    newCart.set(itemId, (newCart.get(itemId) || 0) + 1);
    setCart(newCart);
  };

  const getCartQuantity = (itemId: number) => cart.get(itemId) || 0;

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Browse Inventory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore available items from nearby warehouses
        </Typography>
      </Box>

      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search items by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Warehouse</InputLabel>
              <Select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value as number | '')}
                label="Warehouse"
              >
                <MenuItem value="">All Warehouses</MenuItem>
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            {cart.size > 0 && (
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddShoppingCartIcon />}
                href="/shopkeeper/orders/create"
              >
                Cart ({Array.from(cart.values()).reduce((a, b) => a + b, 0)})
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState message="No items found matching your criteria" />
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image || '/placeholder-item.png'}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    SKU: {item.sku}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.warehouse_name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{item.price}
                    </Typography>
                    <Chip
                      label={`${item.quantity} in stock`}
                      size="small"
                      color={item.quantity > 10 ? 'success' : 'warning'}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant={getCartQuantity(item.id) > 0 ? 'contained' : 'outlined'}
                    onClick={() => handleAddToCart(item.id)}
                    startIcon={<AddShoppingCartIcon />}
                  >
                    {getCartQuantity(item.id) > 0
                      ? `In Cart (${getCartQuantity(item.id)})`
                      : 'Add to Cart'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
