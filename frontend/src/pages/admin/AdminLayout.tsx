import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminNav from '@/components/admin/AdminNav';
import NotificationSnackbar from '@/components/common/NotificationSnackbar';

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      <NotificationSnackbar />
    </Box>
  );
}
