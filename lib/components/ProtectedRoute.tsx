'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const publicRoutes = ['/login'];

// Map routes to their required permissions
const routePermissions: Record<string, string> = {
  '/users': 'READ_USERS',
  '/roles': 'READ_ROLES',
  '/permissions': 'READ_PERMISSIONS',
  '/rolePermissions': 'READ_ROLE_PERMISSIONS',
  '/userRoles': 'READ_USER_ROLES',
  '/habits': 'READ_HABITS',
  '/hives': 'READ_HIVES',
  '/myHives': 'READ_HIVE_MEMBERS',
  '/hiveMembers': 'READ_HIVE_MEMBERS',
  '/progress': 'READ_PROGRESS',
  '/progresses': 'READ_PROGRESS',
  '/payments': 'READ_TRANSACTIONS',
  '/transactions': 'READ_TRANSACTIONS',
};

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push('/login');
      return;
    }

    // Check permissions for protected routes
    if (!isLoading && isAuthenticated && !publicRoutes.includes(pathname)) {
      const requiredPermission = routePermissions[pathname];

      // If route requires a permission and user doesn't have it, redirect to home
      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, hasPermission]);

  if (isLoading) {
    return (
      <Box
        data-testid="loading-box"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress data-testid="loading-spinner" />
      </Box>
    );
  }

  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  // Check permission before rendering
  if (isAuthenticated && !publicRoutes.includes(pathname)) {
    const requiredPermission = routePermissions[pathname];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return null;
    }
  }

  return <>{children}</>;
}
