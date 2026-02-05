import { useMemo } from 'react';
import { Box, SxProps, Theme, useTheme } from '@mui/material';

interface FloatingParticlesProps {
    count?: number;
    sx?: SxProps<Theme>;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

/**
 * Subtle floating particles background.
 * Creates depth and visual interest without distraction.
 */
export default function FloatingParticles({ count = 30, sx }: FloatingParticlesProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const particles = useMemo<Particle[]>(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * -20,
        }));
    }, [count]);

    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0,
                '@media (prefers-reduced-motion: reduce)': {
                    display: 'none',
                },
                ...sx,
            }}
        >
            {particles.map((particle) => (
                <Box
                    key={particle.id}
                    sx={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        borderRadius: '50%',
                        backgroundColor: isDark
                            ? `rgba(148, 163, 184, ${0.15 + Math.random() * 0.1})`
                            : `rgba(71, 85, 105, ${0.08 + Math.random() * 0.05})`,
                        animation: `floatParticle ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                        '@keyframes floatParticle': {
                            '0%, 100%': {
                                transform: 'translate3d(0, 0, 0)',
                                opacity: 0.3,
                            },
                            '25%': {
                                transform: 'translate3d(20px, -30px, 0)',
                                opacity: 0.6,
                            },
                            '50%': {
                                transform: 'translate3d(-10px, -50px, 0)',
                                opacity: 0.4,
                            },
                            '75%': {
                                transform: 'translate3d(15px, -20px, 0)',
                                opacity: 0.5,
                            },
                        },
                    }}
                />
            ))}
        </Box>
    );
}
