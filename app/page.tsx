'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { Person, Badge, Lock, AdminPanelSettings } from '@mui/icons-material';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const adminCards = [
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema',
      icon: <Person sx={{ fontSize: 60 }} />,
      path: '/users',
      color: '#10b981',
    },
    {
      title: 'Roles',
      description: 'Administrar roles y permisos',
      icon: <Badge sx={{ fontSize: 60 }} />,
      path: '/roles',
      color: '#3b82f6',
    },
    {
      title: 'Permisos',
      description: 'Configurar permisos del sistema',
      icon: <Lock sx={{ fontSize: 60 }} />,
      path: '/permissions',
      color: '#f59e0b',
    },
    {
      title: 'Permisos de Rol',
      description: 'Asignar permisos a roles',
      icon: <AdminPanelSettings sx={{ fontSize: 60 }} />,
      path: '/rolePermissions',
      color: '#ec4899',
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Bienvenido, {user?.name}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Panel de Administración - HabitHive
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {adminCards.map(card => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.path}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => router.push(card.path)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
