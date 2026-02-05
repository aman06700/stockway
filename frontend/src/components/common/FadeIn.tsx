import { ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { useInView } from '@/hooks/useInView';

interface FadeInProps {
    children: ReactNode;
    /** Delay before animation starts in ms */
    delay?: number;
    /** Direction to slide from */
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    /** Distance to travel in pixels */
    distance?: number;
    /** Additional sx props */
    sx?: SxProps<Theme>;
}

/**
 * Wrapper component that fades in children when they enter the viewport.
 * Uses transform and opacity for GPU-accelerated, jank-free animation.
 * Respects prefers-reduced-motion automatically via useInView hook.
 */
export default function FadeIn({
    children,
    delay = 0,
    direction = 'up',
    distance = 20,
    sx,
}: FadeInProps) {
    const [ref, isInView] = useInView<HTMLDivElement>({
        threshold: 0.1,
        triggerOnce: true,
    });

    const getTransform = () => {
        if (isInView) return 'translate3d(0, 0, 0)';

        switch (direction) {
            case 'up':
                return `translate3d(0, ${distance}px, 0)`;
            case 'down':
                return `translate3d(0, -${distance}px, 0)`;
            case 'left':
                return `translate3d(${distance}px, 0, 0)`;
            case 'right':
                return `translate3d(-${distance}px, 0, 0)`;
            case 'none':
                return 'translate3d(0, 0, 0)';
            default:
                return `translate3d(0, ${distance}px, 0)`;
        }
    };

    return (
        <Box
            ref={ref}
            sx={{
                opacity: isInView ? 1 : 0,
                transform: getTransform(),
                transition: `opacity var(--motion-duration-slow) var(--motion-easing-decelerate) ${delay}ms, transform var(--motion-duration-slow) var(--motion-easing-decelerate) ${delay}ms`,
                willChange: isInView ? 'auto' : 'opacity, transform',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}
