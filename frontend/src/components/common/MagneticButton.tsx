import { useRef, useState, useCallback, MouseEvent } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface MagneticButtonProps {
    children: React.ReactNode;
    strength?: number;
    sx?: SxProps<Theme>;
}

/**
 * Magnetic button that subtly follows the cursor on hover.
 * Creates a premium, interactive feel without being distracting.
 */
export default function MagneticButton({ children, strength = 0.3, sx }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        setPosition({ x: deltaX, y: deltaY });
    }, [strength]);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
    }, []);

    return (
        <Box
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            sx={{
                display: 'inline-block',
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transition: isHovering
                    ? 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)'
                    : 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
                willChange: isHovering ? 'transform' : 'auto',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}
