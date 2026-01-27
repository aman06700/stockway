import { Box } from '@mui/material';
import { useEffect } from 'react';

export default function DocsPage() {
  useEffect(() => {
    // Scroll to hash if present
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <iframe
        src="/docs_site/index.html"
        title="API Documentation"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </Box>
  );
}
