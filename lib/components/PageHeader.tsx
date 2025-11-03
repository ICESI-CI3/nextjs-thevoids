'use client';

import { usePathname } from 'next/navigation';
import { Typography, Box, Paper, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { navItems } from './Navbar';
import { useThemeContext } from './ThemeContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function PageHeader() {
  const pathname = usePathname();
  const { mode, toggleTheme } = useThemeContext();
  const { hasPermission } = useAuth();

  // Filter navItems by permission before finding current page
  const allowedItems = navItems.filter(item => hasPermission(item.permission));
  const currentPage = allowedItems.find(item => item.href === pathname);
  const pageTitle = currentPage?.label || 'HabitHive';
  const PageIcon = currentPage?.icon;

  const isDark = mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 3,
        background: isDark
          ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
        borderRadius: 2,
        border: isDark ? '1px solid #2a2a2a' : '1px solid #d1fae5',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {PageIcon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            }}
          >
            <PageIcon sx={{ fontSize: 32 }} />
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {pageTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Gestiona y visualiza tus {pageTitle.toLowerCase()}
          </Typography>
        </Box>
        <Box>
          <IconButton
            onClick={toggleTheme}
            color="primary"
            sx={{
              bgcolor: isDark
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(16, 185, 129, 0.05)',
              '&:hover': {
                bgcolor: isDark
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(16, 185, 129, 0.15)',
              },
            }}
            aria-label="toggle theme"
          >
            {isDark ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
