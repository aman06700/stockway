import { useEffect, useRef, useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { useInView } from '@/hooks/useInView';

interface AnimatedCounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    sx?: SxProps<Theme>;
}

/**
 * Animated counter that counts up to a target value.
 * Uses easeOutExpo for a satisfying deceleration.
 */
export default function AnimatedCounter({
    value,
    prefix = '',
    suffix = '',
    duration = 2000,
    sx,
}: AnimatedCounterProps) {
    const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.5, triggerOnce: true });
    const [displayValue, setDisplayValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);

    useEffect(() => {
        if (!isInView) return;

        const animate = (currentTime: number) => {
            if (startTime.current === null) {
                startTime.current = currentTime;
            }

            const elapsed = currentTime - startTime.current;
            const progress = Math.min(elapsed / duration, 1);

            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setDisplayValue(Math.round(eased * value));

            if (progress < 1) {
                animationFrame.current = requestAnimationFrame(animate);
            }
        };

        animationFrame.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [isInView, value, duration]);

    return (
        <Box
            component="span"
            ref={ref}
            sx={{
                fontVariantNumeric: 'tabular-nums',
                ...sx,
            }}
        >
            {prefix}{displayValue.toLocaleString()}{suffix}
        </Box>
    );
}
