'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh,
  ExitToApp,
  Group,
  CheckCircle,
  HourglassEmpty,
  EmojiEvents,
} from '@mui/icons-material';
import {
  hiveMembersApi,
  HiveMember,
  MemberStatus,
} from '@/lib/api/hiveMembers';
import { hivesApi, Hive, HiveStatus } from '@/lib/api/hives';
import { useAuth } from '@/lib/contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MyHives() {
  const [myMemberships, setMyMemberships] = useState<HiveMember[]>([]);
  const [hives, setHives] = useState<Map<string, Hive>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  // Store current time when data is loaded for stable calculations
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const loadMyHives = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setCurrentTime(Date.now()); // Update current time when loading data

    // Obtener mis membresías
    const membersResponse = await hiveMembersApi.getAll();
    if (membersResponse.error) {
      setError(membersResponse.error);
      setIsLoading(false);
      return;
    }

    // Filtrar solo mis membresías
    const myMembershipsData =
      membersResponse.data?.filter(m => m.userId === user.id) || [];
    setMyMemberships(myMembershipsData);

    // Obtener detalles de cada colmena
    const hivesMap = new Map<string, Hive>();
    for (const membership of myMembershipsData) {
      const hiveResponse = await hivesApi.getById(membership.hiveId);
      if (hiveResponse.data) {
        hivesMap.set(membership.hiveId, hiveResponse.data);
      }
    }
    setHives(hivesMap);

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load my hives automatically when authenticated
    const timer = setTimeout(() => loadMyHives(), 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading, loadMyHives, router]);

  const handleLeaveHive = async (membershipId: string, hiveName: string) => {
    if (!confirm(`¿Estás seguro de abandonar "${hiveName}"?`)) return;

    setError('');
    setSuccess('');

    const response = await hiveMembersApi.delete(membershipId);
    if (response.error) {
      setError(response.error);
    } else {
      setSuccess(`Has abandonado "${hiveName}"`);
      loadMyHives();
    }
  };

  const activeMemberships = myMemberships.filter(
    m => m.status === MemberStatus.ACTIVE
  );
  const inactiveMemberships = myMemberships.filter(
    m => m.status !== MemberStatus.ACTIVE
  );

  const getStatusColor = (status: HiveStatus) => {
    switch (status) {
      case HiveStatus.OPEN:
        return 'success';
      case HiveStatus.IN_PROGRESS:
        return 'info';
      case HiveStatus.FINISHED:
        return 'default';
      case HiveStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: HiveStatus) => {
    switch (status) {
      case HiveStatus.OPEN:
        return 'Abierta';
      case HiveStatus.IN_PROGRESS:
        return 'En Progreso';
      case HiveStatus.FINISHED:
        return 'Finalizada';
      case HiveStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getMemberStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.ACTIVE:
        return 'success';
      case MemberStatus.ELIMINATED:
        return 'error';
      case MemberStatus.LEFT:
        return 'default';
      default:
        return 'default';
    }
  };

  const getMemberStatusLabel = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.ACTIVE:
        return 'Activo';
      case MemberStatus.ELIMINATED:
        return 'Eliminado';
      case MemberStatus.LEFT:
        return 'Retirado';
      default:
        return status;
    }
  };

  const calculateProgress = useCallback(
    (hive: Hive): number => {
      if (!hive.startDate) return 0;
      const start = new Date(hive.startDate).getTime();
      const end = hive.endDate
        ? new Date(hive.endDate).getTime()
        : start + hive.durationDays * 24 * 60 * 60 * 1000;
      const now = currentTime;

      if (now < start) return 0;
      if (now > end) return 100;

      const total = end - start;
      const elapsed = now - start;
      return Math.round((elapsed / total) * 100);
    },
    [currentTime]
  );
  const renderHiveCard = (membership: HiveMember) => {
    const hive = hives.get(membership.hiveId);
    if (!hive) return null;

    const progress = calculateProgress(hive);
    const daysRemaining = hive.endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(hive.endDate).getTime() - currentTime) /
              (1000 * 60 * 60 * 24)
          )
        )
      : hive.durationDays;
    return (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={membership.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Role Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
            }}
          >
            <Chip
              label={membership.role}
              size="small"
              color={membership.role === 'owner' ? 'error' : 'default'}
            />
          </Box>

          <CardContent sx={{ flexGrow: 1, pt: 4 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {hive.name}
            </Typography>

            {/* Hábito */}
            {hive.habit && (
              <Chip
                label={hive.habit.title}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}

            <Stack spacing={2}>
              {/* Estado */}
              <Box>
                <Chip
                  label={getStatusLabel(hive.status)}
                  color={getStatusColor(hive.status)}
                  size="small"
                />
                <Chip
                  label={getMemberStatusLabel(membership.status)}
                  color={getMemberStatusColor(membership.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>

              {/* Progreso */}
              {hive.status === HiveStatus.IN_PROGRESS && (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {daysRemaining} días restantes
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              )}

              {/* Miembros */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {hive._count?.members || 0} miembros
                </Typography>
                {hive.members && hive.members.length > 0 && (
                  <AvatarGroup max={4} sx={{ ml: 'auto' }}>
                    {hive.members.slice(0, 4).map(member => (
                      <Avatar
                        key={member.id}
                        sx={{ width: 24, height: 24, fontSize: 12 }}
                      >
                        {member.user?.name?.[0] || 'U'}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                )}
              </Box>

              {/* Fecha de ingreso */}
              <Typography variant="caption" color="text.secondary">
                Miembro desde:{' '}
                {new Date(membership.joinedAt).toLocaleDateString('es-ES')}
              </Typography>
            </Stack>
          </CardContent>

          {/* Acciones */}
          {membership.status === MemberStatus.ACTIVE && (
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                size="small"
                color="error"
                startIcon={<ExitToApp />}
                onClick={() => handleLeaveHive(membership.id, hive.name)}
              >
                Abandonar
              </Button>
            </Box>
          )}
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Mis Colmenas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus colmenas activas y ve tu historial
          </Typography>
        </Box>
        <IconButton onClick={loadMyHives}>
          <Refresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {activeMemberships.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Colmenas Activas
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <HourglassEmpty color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {
                      activeMemberships.filter(
                        m =>
                          hives.get(m.hiveId)?.status === HiveStatus.IN_PROGRESS
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En Progreso
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EmojiEvents color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {
                      myMemberships.filter(
                        m =>
                          hives.get(m.hiveId)?.status === HiveStatus.FINISHED &&
                          m.status === MemberStatus.ACTIVE
                      ).length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completadas
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label={`Activas (${activeMemberships.length})`} />
          <Tab label={`Historial (${inactiveMemberships.length})`} />
        </Tabs>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando tus colmenas...</Typography>
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            {activeMemberships.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Group sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No estás en ninguna colmena activa
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explora colmenas disponibles y únete a una para comenzar
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => router.push('/hives')}
                >
                  Explorar Colmenas
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {activeMemberships.map(renderHiveCard)}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {inactiveMemberships.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No tienes historial de colmenas
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {inactiveMemberships.map(renderHiveCard)}
              </Grid>
            )}
          </TabPanel>
        </>
      )}
    </Box>
  );
}
