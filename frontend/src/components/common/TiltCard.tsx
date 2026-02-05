import { useRef, useState, useCallback, MouseEvent, ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface TiltCardProps {
    children: ReactNode;
    maxTilt?: number;
    scale?: number;
    glareEnabled?: boolean;
    sx?: SxProps<Theme>;
}

/**
 * 3D tilt card that responds to mouse position.
 * Creates a premium, interactive depth effect.
 */
export default function TiltCard({
    children,
    maxTilt = 8,
    scale = 1.02,
    glareEnabled = true,
    sx
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const percentX = (e.clientX - centerX) / (rect.width / 2);
        const percentY = (e.clientY - centerY) / (rect.height / 2);

        setTilt({
            x: -percentY * maxTilt,
            y: percentX * maxTilt,
        });

        // Glare follows cursor
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePosition({ x: glareX, y: glareY });
    }, [maxTilt]);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        setTilt({ x: 0, y: 0 });
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
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? scale : 1})`,
                transition: isHovering
                    ? 'transform 0.1s ease-out'
                    : 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
                willChange: isHovering ? 'transform' : 'auto',
                ...sx,
            }}
        >
            {children}
            {/* Glare effect */}
            {glareEnabled && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                        opacity: isHovering ? 0.15 : 0,
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                        transition: 'opacity 0.3s ease',
                    }}
                />
            )}
        </Box>
    );
}
