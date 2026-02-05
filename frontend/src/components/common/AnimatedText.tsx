import { useEffect, useState } from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { useInView } from '@/hooks/useInView';

interface AnimatedTextProps extends Omit<TypographyProps, 'children'> {
    children: string;
    /** Animation style */
    animation?: 'words' | 'chars' | 'lines';
    /** Delay between each unit in ms */
    stagger?: number;
    /** Base delay before animation starts */
    delay?: number;
}

/**
 * Text that reveals word by word or character by character.
 * Creates an elegant, cinematic text entrance.
 */
export default function AnimatedText({
    children,
    animation = 'words',
    stagger = 50,
    delay = 0,
    ...typographyProps
}: AnimatedTextProps) {
    const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.5, triggerOnce: true });
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isInView && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isInView, hasAnimated]);

    const units = animation === 'words'
        ? children.split(' ')
        : animation === 'chars'
            ? children.split('')
            : [children];

    return (
        <Typography
            {...typographyProps}
            component="span"
            ref={ref}
            sx={{
                display: 'inline',
                ...typographyProps.sx,
            }}
        >
            {units.map((unit, index) => (
                <span
                    key={index}
                    style={{
                        display: 'inline-block',
                        opacity: hasAnimated ? 1 : 0,
                        transform: hasAnimated ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
                        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay + index * stagger}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay + index * stagger}ms`,
                        marginRight: animation === 'words' && index < units.length - 1 ? '0.3em' : undefined,
                    }}
                >
                    {unit}
                </span>
            ))}
        </Typography>
    );
}
