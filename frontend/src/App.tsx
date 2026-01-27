import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import AppRouter from './routes/AppRouter';
import { useAuthStore } from './store/authStore';
import { theme } from './theme/theme';
import ErrorFallback from './components/common/ErrorFallback';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
