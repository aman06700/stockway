import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import WarehouseNav from '@/components/warehouse/WarehouseNav';
import NotificationSnackbar from '@/components/common/NotificationSnackbar';

export default function WarehouseLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <WarehouseNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      <NotificationSnackbar />
    </Box>
  );
}
