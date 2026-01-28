import { PaletteMode } from '@mui/material';

// Zinc / Neutral Scale
const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

export const getPalette = (mode: PaletteMode) => ({
  mode,
  ...(mode === 'dark'
    ? {
        // Dark Mode
        primary: {
          main: '#ffffff', // Minimalist primary: White text often implies action on dark
          light: zinc[200],
          dark: zinc[200],
          contrastText: '#000000',
        },
        secondary: {
          main: zinc[400],
          light: zinc[300],
          dark: zinc[500],
          contrastText: '#ffffff',
        },
        background: {
          default: zinc[950], // Deep, dark background
          paper: zinc[900],   // Slightly lighter for cards/surfaces
        },
        text: {
          primary: zinc[50],
          secondary: zinc[400],
          disabled: zinc[600],
        },
        divider: zinc[800],
        action: {
            hover: 'rgba(255, 255, 255, 0.05)',
            selected: 'rgba(255, 255, 255, 0.08)',
        }
      }
    : {
        // Light Mode (Strict Professional)
        primary: {
          main: zinc[900], // Black button on light bg
          light: zinc[800],
          dark: zinc[950],
          contrastText: '#ffffff',
        },
        secondary: {
          main: zinc[600],
          light: zinc[500],
          dark: zinc[700],
          contrastText: '#ffffff',
        },
        background: {
          default: '#ffffff', // Pure white
          paper: zinc[50],    // Very subtle off-white for distinction
        },
        text: {
          primary: zinc[900],
          secondary: zinc[600], // Slightly darker than 500 for better readability
          disabled: zinc[400],
        },
        divider: zinc[200],
         action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
        }
      }),
    // Semantic Colors (Shared)
    error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
    },
    success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
    },
    warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
    },
    info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
    }
});
