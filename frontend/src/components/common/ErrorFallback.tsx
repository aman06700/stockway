import { Box, Button, Typography, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
        gap={3}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80 }} />
        <Typography variant="h4" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error.message || 'An unexpected error occurred'}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={resetErrorBoundary}
        >
          Try Again
        </Button>
      </Box>
    </Container>
  );
}
