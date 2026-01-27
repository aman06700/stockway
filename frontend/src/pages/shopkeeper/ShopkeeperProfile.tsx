import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
} from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/components/common/NotificationSnackbar';

export default function ShopkeeperProfile() {
  const { user } = useAuthStore();
  const { showNotification } = useNotification();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
  });

  const handleSave = async () => {
    try {
      // API call would go here
      showNotification('Profile updated successfully', 'success');
      setEditing(false);
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    }
  };

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="h6">{user?.full_name || 'User'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Role"
              value={user?.role || ''}
              disabled
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          {editing ? (
            <>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
