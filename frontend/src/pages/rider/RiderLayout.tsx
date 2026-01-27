import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import RiderNav from '@/components/rider/RiderNav';
import NotificationSnackbar from '@/components/common/NotificationSnackbar';

export default function RiderLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <RiderNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      <NotificationSnackbar />
    </Box>
  );
}
