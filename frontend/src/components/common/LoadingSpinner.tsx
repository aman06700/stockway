import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: number;
}

export default function LoadingSpinner({
  fullScreen = false,
  message = 'Loading...',
  size = 40
}: LoadingSpinnerProps) {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={{
        animation: 'fadeIn var(--motion-duration-base) var(--motion-easing-decelerate)',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        {content}
      </Box>
    );
  }

  return content;
}
