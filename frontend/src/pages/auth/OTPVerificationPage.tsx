import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/components/common/NotificationSnackbar';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { showNotification } = useNotification();

  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, otp);
      showNotification('Login successful!', 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!email) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          minHeight="100vh"
          py={4}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Session expired
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Please start the login process again
            </Typography>
            <Button variant="contained" onClick={handleBackToLogin}>
              Back to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Verify OTP
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter the OTP sent to <strong>{email}</strong>
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              fullWidth
              autoFocus
              margin="normal"
              disabled={loading}
              inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
              helperText="Enter the 6-digit code"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>

            <Box textAlign="center" mt={2}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleBackToLogin}
                sx={{ cursor: 'pointer' }}
              >
                Back to Login
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
