import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import ShopkeeperNav from '@/components/shopkeeper/ShopkeeperNav';
import NotificationSnackbar from '@/components/common/NotificationSnackbar';

export default function ShopkeeperLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <ShopkeeperNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      <NotificationSnackbar />
    </Box>
  );
}
