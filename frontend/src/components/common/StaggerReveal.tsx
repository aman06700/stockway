import { ReactNode, useEffect, useState, Children, isValidElement } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { useInView } from '@/hooks/useInView';

interface StaggerRevealProps {
    children: ReactNode;
    /** Delay between each child in ms */
    stagger?: number;
    /** Base delay before first child animates */
    baseDelay?: number;
    /** Direction children animate from */
    direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
    /** Distance to travel */
    distance?: number;
    /** Additional sx props for container */
    sx?: SxProps<Theme>;
}

/**
 * Orchestrated stagger reveal for child elements.
 * Each child animates in sequence with configurable timing.
 */
export default function StaggerReveal({
    children,
    stagger = 100,
    baseDelay = 0,
    direction = 'up',
    distance = 30,
    sx,
}: StaggerRevealProps) {
    const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isInView && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isInView, hasAnimated]);

    const getInitialTransform = () => {
        switch (direction) {
            case 'up': return `translate3d(0, ${distance}px, 0)`;
            case 'down': return `translate3d(0, -${distance}px, 0)`;
            case 'left': return `translate3d(${distance}px, 0, 0)`;
            case 'right': return `translate3d(-${distance}px, 0, 0)`;
            case 'scale': return 'scale(0.9)';
            default: return `translate3d(0, ${distance}px, 0)`;
        }
    };

    const childArray = Children.toArray(children);

    return (
        <Box ref={ref} sx={sx}>
            {childArray.map((child, index) => {
                const delay = baseDelay + (index * stagger);

                if (!isValidElement(child)) return child;

                return (
                    <Box
                        key={index}
                        sx={{
                            opacity: hasAnimated ? 1 : 0,
                            transform: hasAnimated ? 'translate3d(0, 0, 0) scale(1)' : getInitialTransform(),
                            transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                            willChange: hasAnimated ? 'auto' : 'opacity, transform',
                        }}
                    >
                        {child}
                    </Box>
                );
            })}
        </Box>
    );
}
