'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Refresh,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  LocalFireDepartment,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  progressApi,
  Progress,
  ProgressStatus,
  ProgressStats,
} from '@/lib/api/progress';
import { hivesApi, Hive } from '@/lib/api/hives';
import { habitsApi, Habit } from '@/lib/api/habits';

export default function ProgressPage() {
  const [myProgress, setMyProgress] = useState<Progress[]>([]);
  const [myHives, setMyHives] = useState<Hive[]>([]);
  const [myHabits, setMyHabits] = useState<Map<string, Habit>>(new Map());
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedHive, setSelectedHive] = useState<string>('all');
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    hiveId: '',
    habitId: '',
    date: new Date().toISOString().split('T')[0],
    status: ProgressStatus.COMPLETED,
  });

  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const loadMyProgress = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    // Cargar progreso del usuario
    const progressResponse = await progressApi.getByUser(user.id);
    if (progressResponse.error) {
      setError(progressResponse.error);
    } else if (progressResponse.data) {
      setMyProgress(progressResponse.data);

      // Extraer hives únicos
      const uniqueHiveIds = [
        ...new Set(progressResponse.data.map(p => p.hiveId)),
      ];
      const hivesMap = new Map<string, Hive>();

      for (const hiveId of uniqueHiveIds) {
        const hiveResponse = await hivesApi.getById(hiveId);
        if (hiveResponse.data) {
          hivesMap.set(hiveId, hiveResponse.data);
        }
      }
      setMyHives(Array.from(hivesMap.values()));

      // Extraer hábitos únicos
      const uniqueHabitIds = [
        ...new Set(progressResponse.data.map(p => p.habitId)),
      ];
      const habitsMap = new Map<string, Habit>();

      for (const habitId of uniqueHabitIds) {
        const habitResponse = await habitsApi.getById(habitId);
        if (habitResponse.data) {
          habitsMap.set(habitId, habitResponse.data);
        }
      }
      setMyHabits(habitsMap);
    }

    // Cargar estadísticas
    const statsResponse = await progressApi.getUserStats(user.id);
    if (statsResponse.data) {
      setStats(statsResponse.data);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => loadMyProgress(), 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading, loadMyProgress, router]);

  const handleCreateProgress = async () => {
    if (!user) return;

    setError('');
    setSuccess('');

    const response = await progressApi.create({
      ...formData,
      userId: user.id,
    });

    if (response.error) {
      setError(response.error);
    } else {
      setSuccess('Progreso registrado exitosamente');
      setCreateDialogOpen(false);
      setFormData({
        hiveId: '',
        habitId: '',
        date: new Date().toISOString().split('T')[0],
        status: ProgressStatus.COMPLETED,
      });
      loadMyProgress();
    }
  };

  const handleUpdateStatus = async (
    progressId: string,
    newStatus: ProgressStatus
  ) => {
    const response = await progressApi.updateStatus(progressId, newStatus);

    if (response.error) {
      setError(response.error);
    } else {
      setSuccess('Estado actualizado correctamente');
      loadMyProgress();
    }
  };

  const getStatusColor = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return 'success';
      case ProgressStatus.FAILED:
        return 'error';
      case ProgressStatus.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return <CheckCircle fontSize="small" />;
      case ProgressStatus.FAILED:
        return <Cancel fontSize="small" />;
      case ProgressStatus.PENDING:
        return <HourglassEmpty fontSize="small" />;
    }
  };

  const getStatusLabel = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return 'Completado';
      case ProgressStatus.FAILED:
        return 'Fallido';
      case ProgressStatus.PENDING:
        return 'Pendiente';
      default:
        return status;
    }
  };

  // Filtrar progreso
  const filteredProgress = myProgress.filter(progress => {
    if (selectedHive !== 'all' && progress.hiveId !== selectedHive)
      return false;
    if (selectedHabit !== 'all' && progress.habitId !== selectedHabit)
      return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Mi Progreso
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sigue tu avance en los hábitos de tus colmenas
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={loadMyProgress} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            startIcon={<CheckCircle />}
          >
            Registrar Progreso
          </Button>
        </Box>
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

      {/* Estadísticas */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LocalFireDepartment color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{stats.completed}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completados
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">
                      {stats.completionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tasa de Éxito
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <HourglassEmpty color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{stats.pending}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pendientes
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarToday color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Registros
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Colmena</InputLabel>
          <Select
            value={selectedHive}
            label="Colmena"
            onChange={e => setSelectedHive(e.target.value)}
          >
            <MenuItem value="all">Todas las Colmenas</MenuItem>
            {myHives.map(hive => (
              <MenuItem key={hive.id} value={hive.id}>
                {hive.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Hábito</InputLabel>
          <Select
            value={selectedHabit}
            label="Hábito"
            onChange={e => setSelectedHabit(e.target.value)}
          >
            <MenuItem value="all">Todos los Hábitos</MenuItem>
            {Array.from(myHabits.values()).map(habit => (
              <MenuItem key={habit.id} value={habit.id}>
                {habit.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Progress List */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando progreso...</Typography>
        </Box>
      ) : filteredProgress.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay progreso registrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comienza a registrar tu progreso diario en tus hábitos
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProgress.map(progress => {
            const hive = myHives.find(h => h.id === progress.hiveId);
            const habit = myHabits.get(progress.habitId);

            return (
              <Grid key={progress.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {habit?.title || 'Hábito Desconocido'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hive?.name || 'Colmena Desconocida'}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(progress.status)}
                        label={getStatusLabel(progress.status)}
                        color={getStatusColor(progress.status)}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Fecha: {new Date(progress.date).toLocaleDateString()}
                    </Typography>

                    {progress.verifiedBy && (
                      <Typography variant="caption" color="success.main">
                        ✓ Verificado
                      </Typography>
                    )}

                    {/* Acciones rápidas */}
                    {progress.status === ProgressStatus.PENDING && (
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() =>
                            handleUpdateStatus(
                              progress.id,
                              ProgressStatus.COMPLETED
                            )
                          }
                        >
                          Completar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            handleUpdateStatus(
                              progress.id,
                              ProgressStatus.FAILED
                            )
                          }
                        >
                          Marcar Fallido
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Progress Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registrar Progreso</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Colmena</InputLabel>
              <Select
                value={formData.hiveId}
                label="Colmena"
                onChange={e =>
                  setFormData({ ...formData, hiveId: e.target.value })
                }
              >
                {myHives.map(hive => (
                  <MenuItem key={hive.id} value={hive.id}>
                    {hive.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Hábito</InputLabel>
              <Select
                value={formData.habitId}
                label="Hábito"
                onChange={e =>
                  setFormData({ ...formData, habitId: e.target.value })
                }
              >
                {Array.from(myHabits.values()).map(habit => (
                  <MenuItem key={habit.id} value={habit.id}>
                    {habit.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={e =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProgressStatus,
                  })
                }
              >
                <MenuItem value={ProgressStatus.COMPLETED}>Completado</MenuItem>
                <MenuItem value={ProgressStatus.PENDING}>Pendiente</MenuItem>
                <MenuItem value={ProgressStatus.FAILED}>Fallido</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateProgress}
            variant="contained"
            disabled={!formData.hiveId || !formData.habitId}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
