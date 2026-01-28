import { createTheme } from '@mui/material/styles';
import { getPalette } from './palette';
import { typography } from './typography';

// Remove all shadows
const shadows = Array(25).fill('none') as any;

export const createAppTheme = (mode: 'light' | 'dark') => {
  const palette = getPalette(mode);

  return createTheme({
    palette,
    typography,
    shadows, // Global shadow removal
    shape: {
      borderRadius: 6, // Tighter radius for a more technical feel
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: mode === 'dark' ? '#3f3f46' : '#d4d4d8',
                borderRadius: '3px',
            }
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            boxShadow: 'none',
            border: '1px solid transparent',
            '&:hover': {
              boxShadow: 'none',
              // Subtle darkening/lightening handled by default action.hover, but we can enforce strictness
            },
          },
          contained: {
             '&:hover': {
                boxShadow: 'none',
             }
          },
          outlined: {
            borderColor: mode === 'dark' ? '#3f3f46' : '#d4d4d8', // Zinc 700 : Zinc 300
            color: mode === 'dark' ? '#f4f4f5' : '#18181b',
            '&:hover': {
                 backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                 borderColor: mode === 'dark' ? '#52525b' : '#a1a1aa',
            }
          }
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Remove MUI gradient overlay
            backgroundColor: palette.background.paper,
            border: `1px solid ${palette.divider}`,
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#ffffff',
              '& fieldset': {
                borderColor: palette.divider,
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? '#71717a' : '#a1a1aa', // Zinc 500
              },
              '&.Mui-focused fieldset': {
                borderColor: palette.primary.main,
                borderWidth: '1px', // Keep it thin, no thick focus rings
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: palette.background.default,
                borderBottom: `1px solid ${palette.divider}`,
                boxShadow: 'none',
                color: palette.text.primary,
            }
        }
      },
      MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: palette.background.default,
                borderRight: `1px solid ${palette.divider}`,
            }
        }
      }
    },
  });
};
