import { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
    children: ReactNode;
}

/**
 * Wrapper component that applies a quick fade animation on route changes.
 * Uses CSS animation for simplicity and performance.
 * Non-blocking - content is immediately interactive.
 */
export default function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();

    return (
        <Box
            key={location.pathname}
            sx={{
                animation: 'pageEnter var(--motion-duration-base) var(--motion-easing-decelerate)',
                '@keyframes pageEnter': {
                    from: {
                        opacity: 0,
                    },
                    to: {
                        opacity: 1,
                    },
                },
                // Reduce motion for accessibility
                '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                },
            }}
        >
            {children}
        </Box>
    );
}
