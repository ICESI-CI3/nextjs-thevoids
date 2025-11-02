'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function UserRoles() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/roles');
    }
  }, [isAuthenticated, router]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Página eliminada</Typography>
      <Typography variant="body2" color="text.secondary">
        La página &quot;Roles de Usuario&quot; fue removida. Use la sección de
        Roles y Permisos de Rol para administrar asignaciones.
      </Typography>
    </Box>
  );
}
