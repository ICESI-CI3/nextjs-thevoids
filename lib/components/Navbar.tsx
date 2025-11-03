'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import {
  CheckCircleOutline,
  People,
  Hive,
  Payment,
  Lock,
  TrendingUp,
  AdminPanelSettings,
  Badge,
  Receipt,
  Logout,
  Home,
} from '@mui/icons-material';
import { useThemeContext } from './ThemeContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export const navItems = [
  {
    href: '/habits',
    label: 'Habits',
    icon: CheckCircleOutline,
    permission: 'READ_HABITS',
  },
  {
    href: '/hives',
    label: 'Hives',
    icon: Hive,
    permission: 'READ_HIVES',
  },
  {
    href: '/myHives',
    label: 'My Hives',
    icon: Home,
    permission: 'READ_HIVE_MEMBERS',
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: TrendingUp,
    permission: 'READ_PROGRESS',
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: Payment,
    permission: 'READ_TRANSACTIONS',
  },
  {
    href: '/permissions',
    label: 'Permissions',
    icon: Lock,
    permission: 'READ_PERMISSIONS',
  },
  {
    href: '/rolePermissions',
    label: 'Role Permissions',
    icon: AdminPanelSettings,
    permission: 'READ_ROLE_PERMISSIONS',
  },
  {
    href: '/roles',
    label: 'Roles',
    icon: Badge,
    permission: 'READ_ROLES',
  },
  {
    href: '/transactions',
    label: 'Transactions',
    icon: Receipt,
    permission: 'READ_TRANSACTIONS',
  },
  {
    href: '/users',
    label: 'Users',
    icon: People,
    permission: 'READ_USERS',
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { mode } = useThemeContext();
  const { user, logout, isAuthenticated, hasPermission } = useAuth();
  const isDark = mode === 'dark';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      data-testid="drawer"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: isDark
            ? 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
          borderRight: isDark ? '1px solid #2a2a2a' : '1px solid #d1fae5',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            🌿 HabitHive
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
          >
            Cultiva buenos hábitos
          </Typography>
        </Box>
        <Divider sx={{ mx: 2, borderColor: isDark ? '#2a2a2a' : '#d1fae5' }} />
        {user && (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 0.5 }}
            >
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user.role}
            </Typography>
          </Box>
        )}
        <Divider sx={{ mx: 2, borderColor: isDark ? '#2a2a2a' : '#d1fae5' }} />
        <List sx={{ px: 1, py: 2 }}>
          {navItems
            .filter(item => hasPermission(item.permission))
            .map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <ListItem key={href} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    href={href}
                    selected={isActive}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        borderLeft: '4px solid #10b981',
                        '& .MuiListItemIcon-root': {
                          color: '#059669',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#064e3b',
                          fontWeight: 600,
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: '#10b981' }}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        color: 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={logout}
            sx={{ mt: 2 }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
