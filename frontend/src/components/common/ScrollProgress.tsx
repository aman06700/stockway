import { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';

/**
 * Scroll progress indicator that shows reading progress.
 * Subtle accent bar at top of viewport.
 */
export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(scrollProgress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    transition: 'width 0.1s ease-out',
                    boxShadow: `0 0 10px ${theme.palette.primary.main}40`,
                }}
            />
        </Box>
    );
}
