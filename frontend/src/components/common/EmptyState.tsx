import { Alert, AlertTitle, Box } from '@mui/material';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = 'No data available',
  message,
  icon,
  action
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={2}
      textAlign="center"
    >
      {icon && <Box mb={2}>{icon}</Box>}
      <Alert severity="info" sx={{ maxWidth: 500 }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
      {action && <Box mt={3}>{action}</Box>}
    </Box>
  );
}
