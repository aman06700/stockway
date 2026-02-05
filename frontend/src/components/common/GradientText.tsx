import { Box, SxProps, Theme } from '@mui/material';

interface GradientTextProps {
    children: React.ReactNode;
    gradient?: string;
    sx?: SxProps<Theme>;
}

/**
 * Text with animated gradient effect.
 * Subtle shimmer animation for emphasis.
 */
export default function GradientText({
    children,
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
    sx,
}: GradientTextProps) {
    return (
        <Box
            component="span"
            sx={{
                background: gradient,
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 8s ease infinite',
                '@keyframes gradientShift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    backgroundPosition: '0% 50%',
                },
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}
