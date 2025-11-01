'use client';

import { StyledEngineProvider } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo } from 'react';
import { useThemeContext } from './ThemeContext';

interface MuiThemeProviderProps {
  children: ReactNode;
}

export default function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  const { mode } = useThemeContext();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#10b981', // Verde moderno (Emerald 500)
            light: '#34d399', // Verde claro (Emerald 400)
            dark: '#059669', // Verde oscuro (Emerald 600)
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#6ee7b7', // Verde menta (Emerald 300)
            light: '#a7f3d0', // Verde menta claro (Emerald 200)
            dark: '#34d399', // Verde menta oscuro (Emerald 400)
            contrastText: mode === 'dark' ? '#ffffff' : '#065f46',
          },
          background: {
            default: mode === 'dark' ? '#0a0a0a' : '#f0fdf4',
            paper: mode === 'dark' ? '#1a1a1a' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#f0fdf4' : '#064e3b',
            secondary: mode === 'dark' ? '#a7f3d0' : '#047857',
          },
        },
        typography: {
          fontFamily:
            'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h4: {
            fontWeight: 700,
          },
          h5: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 600,
          },
        },
        components: {
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRight: 'none',
                boxShadow:
                  mode === 'dark'
                    ? '4px 0 12px rgba(0, 0, 0, 0.5)'
                    : '4px 0 12px rgba(16, 185, 129, 0.1)',
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                margin: '4px 8px',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
