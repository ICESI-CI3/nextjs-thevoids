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
  FormHelperText,
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
  AttachFile,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  progressApi,
  Progress,
  ProgressStatus,
  ProgressStats,
} from '@/lib/api/progress';
import { hivesApi, Hive } from '@/lib/api/hives';
import { habitsApi, Habit, EvidenceType } from '@/lib/api/habits';
import { hiveMembersApi, MemberStatus } from '@/lib/api/hiveMembers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const resolveEvidenceUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const sanitizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${sanitizedBase}${normalizedPath}`;
};

export default function ProgressPage() {
  const [myProgress, setMyProgress] = useState<Progress[]>([]);
  const [myHives, setMyHives] = useState<Hive[]>([]);
  const [myHabits, setMyHabits] = useState<Map<string, Habit>>(new Map());
  const [habitsByHive, setHabitsByHive] = useState<Record<string, Habit[]>>({});
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
    evidenceNotes: '',
    witnessName: '',
    witnessContact: '',
  });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const loadMyProgress = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const [progressResponse, statsResponse, membershipsResponse] =
        await Promise.all([
          progressApi.getByUser(user.id),
          progressApi.getUserStats(user.id),
          hiveMembersApi.getByUser(user.id),
        ]);

      if (progressResponse.error) {
        setError(progressResponse.error);
        setMyProgress([]);
      } else {
        setMyProgress(progressResponse.data ?? []);
      }

      if (statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        setStats(null);
      }

      if (membershipsResponse.error) {
        setError(prev => prev || membershipsResponse.error!);
      }

      const progressData = progressResponse.data ?? [];
      const activeMemberships =
        membershipsResponse.data?.filter(
          membership => membership.status === MemberStatus.ACTIVE
        ) ?? [];

      const hiveIds = new Set<string>();
      activeMemberships.forEach(membership => hiveIds.add(membership.hiveId));
      progressData.forEach(progress => hiveIds.add(progress.hiveId));

      const hiveResponses = await Promise.all(
        Array.from(hiveIds).map(hiveId => hivesApi.getById(hiveId))
      );

      const hivesMap = new Map<string, Hive>();
      const habitIds = new Set<string>();

      hiveResponses.forEach(response => {
        if (response.data) {
          hivesMap.set(response.data.id, response.data);
          if (response.data.habitId) {
            habitIds.add(response.data.habitId);
          }
          response.data.habitHives?.forEach(relation => {
            habitIds.add(relation.habitId);
          });
        }
      });

      progressData.forEach(progress => {
        if (progress.habitId) {
          habitIds.add(progress.habitId);
        }
        if (progress.habit?.id) {
          habitIds.add(progress.habit.id);
        }
      });

      const habitResponses = await Promise.all(
        Array.from(habitIds).map(habitId => habitsApi.getById(habitId))
      );

      const habitsMap = new Map<string, Habit>();
      habitResponses.forEach(response => {
        if (response.data) {
          habitsMap.set(response.data.id, response.data);
        }
      });

      const habitsByHiveMap: Record<string, Habit[]> = {};
      hivesMap.forEach(hive => {
        const relatedHabits = new Set<string>();
        if (hive.habitId) {
          relatedHabits.add(hive.habitId);
        }
        hive.habitHives?.forEach(relation => {
          relatedHabits.add(relation.habitId);
        });

        habitsByHiveMap[hive.id] = Array.from(relatedHabits)
          .map(id => habitsMap.get(id))
          .filter((habit): habit is Habit => Boolean(habit));
      });

      setMyHives(Array.from(hivesMap.values()));
      setMyHabits(habitsMap);
      setHabitsByHive(habitsByHiveMap);

      setFormData(prev => {
        if (prev.hiveId) {
          return prev;
        }

        const defaultHiveId = Array.from(hivesMap.keys())[0] ?? '';
        const defaultHabitId = habitsByHiveMap[defaultHiveId]?.[0]?.id ?? '';

        return {
          ...prev,
          hiveId: defaultHiveId,
          habitId: defaultHabitId,
        };
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'No se pudo cargar tu progreso'
      );
    } finally {
      setIsLoading(false);
    }
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

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setEvidenceFile(null);
    setFormData(prev => ({
      ...prev,
      evidenceNotes: '',
      witnessName: '',
      witnessContact: '',
    }));
  };

  useEffect(() => {
    setFormData(prev => {
      if (!prev.hiveId) {
        return prev;
      }

      const available = habitsByHive[prev.hiveId] ?? [];
      if (available.length === 0) {
        return prev.habitId ? { ...prev, habitId: '' } : prev;
      }

      const exists = available.some(habit => habit.id === prev.habitId);
      if (exists) {
        return prev;
      }

      return {
        ...prev,
        habitId: available[0].id,
      };
    });
  }, [habitsByHive, formData.hiveId]);

  useEffect(() => {
    setEvidenceFile(null);
    setFormData(prev => ({
      ...prev,
      evidenceNotes: '',
      witnessName: '',
      witnessContact: '',
    }));
  }, [formData.habitId]);

  const handleCreateProgress = async () => {
    if (!user) return;

    setError('');
    setSuccess('');

    if (!formData.hiveId || !formData.habitId) {
      setError('Selecciona una colmena y un hábito');
      return;
    }

    if (!selectedHabitDetails) {
      setError('El hábito seleccionado no es válido');
      return;
    }

    if (
      selectedHabitDetails.evidenceType === EvidenceType.PHOTO &&
      !evidenceFile
    ) {
      setError('Debes adjuntar una evidencia fotográfica');
      return;
    }

    if (
      selectedHabitDetails.evidenceType === EvidenceType.SELF &&
      !formData.evidenceNotes.trim()
    ) {
      setError('Describe tu progreso para este hábito');
      return;
    }

    if (
      selectedHabitDetails.evidenceType === EvidenceType.WITNESS &&
      !formData.witnessName.trim()
    ) {
      setError('Indica el nombre de quien certifica tu progreso');
      return;
    }

    const response = await progressApi.create({
      ...formData,
      userId: user.id,
      evidenceFile: evidenceFile ?? undefined,
    });

    if (response.error) {
      setError(response.error);
    } else {
      setSuccess('Progreso registrado exitosamente');
      handleCloseCreateDialog();
      setFormData({
        hiveId: '',
        habitId: '',
        date: new Date().toISOString().split('T')[0],
        status: ProgressStatus.COMPLETED,
        evidenceNotes: '',
        witnessName: '',
        witnessContact: '',
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

  const evidenceTypeDescriptions: Record<EvidenceType, string> = {
    [EvidenceType.API]: 'Referencia externa',
    [EvidenceType.PHOTO]: 'Archivo fotográfico',
    [EvidenceType.SELF]: 'Descripción personal',
    [EvidenceType.WITNESS]: 'Validación por un tercero',
  };

  const availableHabitsForHive =
    formData.hiveId && habitsByHive[formData.hiveId]
      ? habitsByHive[formData.hiveId]
      : [];

  const selectedHabitDetails = formData.habitId
    ? myHabits.get(formData.habitId)
    : undefined;

  const evidenceMissing = (() => {
    if (!selectedHabitDetails) return false;

    switch (selectedHabitDetails.evidenceType) {
      case EvidenceType.PHOTO:
        return !evidenceFile;
      case EvidenceType.SELF:
        return !formData.evidenceNotes.trim();
      case EvidenceType.API:
        return !formData.evidenceNotes.trim();
      case EvidenceType.WITNESS:
        return !formData.witnessName.trim();
      default:
        return false;
    }
  })();

  const canSubmit =
    Boolean(formData.hiveId && formData.habitId) && !evidenceMissing;

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

                    {resolveEvidenceUrl(progress.evidenceUrl) && (
                      <Button
                        size="small"
                        startIcon={<AttachFile fontSize="small" />}
                        href={resolveEvidenceUrl(progress.evidenceUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                      >
                        Ver evidencia
                      </Button>
                    )}

                    {progress.evidenceNotes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Evidencia: {progress.evidenceNotes}
                      </Typography>
                    )}

                    {progress.witnessName && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        Verificado por: {progress.witnessName}
                        {progress.witnessContact
                          ? ` (${progress.witnessContact})`
                          : ''}
                      </Typography>
                    )}

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
        onClose={handleCloseCreateDialog}
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
                  setFormData(prev => ({
                    ...prev,
                    hiveId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">
                  <em>Selecciona una colmena</em>
                </MenuItem>
                {myHives.map(hive => (
                  <MenuItem key={hive.id} value={hive.id}>
                    {hive.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!formData.hiveId}>
              <InputLabel>Hábito</InputLabel>
              <Select
                value={formData.habitId}
                label="Hábito"
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    habitId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">
                  <em>
                    {formData.hiveId
                      ? 'Selecciona un hábito'
                      : 'Elige una colmena primero'}
                  </em>
                </MenuItem>
                {availableHabitsForHive.map(habit => (
                  <MenuItem key={habit.id} value={habit.id}>
                    {habit.title}
                  </MenuItem>
                ))}
              </Select>
              {formData.hiveId && availableHabitsForHive.length === 0 && (
                <FormHelperText>
                  Esta colmena aún no tiene hábitos asignados.
                </FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.date}
              onChange={e =>
                setFormData(prev => ({ ...prev, date: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    status: e.target.value as ProgressStatus,
                  }))
                }
              >
                <MenuItem value={ProgressStatus.COMPLETED}>Completado</MenuItem>
                <MenuItem value={ProgressStatus.PENDING}>Pendiente</MenuItem>
                <MenuItem value={ProgressStatus.FAILED}>Fallido</MenuItem>
              </Select>
            </FormControl>

            {selectedHabitDetails && (
              <Stack
                spacing={
                  selectedHabitDetails.evidenceType === EvidenceType.WITNESS
                    ? 2
                    : 1
                }
              >
                <Typography variant="body2" color="text.secondary">
                  Evidencia requerida:{' '}
                  {evidenceTypeDescriptions[selectedHabitDetails.evidenceType]}
                </Typography>

                {selectedHabitDetails.evidenceType === EvidenceType.PHOTO && (
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AttachFile />}
                    >
                      {evidenceFile ? 'Cambiar archivo' : 'Adjuntar evidencia'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={event => {
                          const file = event.currentTarget.files?.[0] ?? null;
                          setEvidenceFile(file);
                        }}
                      />
                    </Button>
                    {evidenceFile && (
                      <Typography variant="caption" color="text.secondary">
                        {evidenceFile.name}
                      </Typography>
                    )}
                  </Stack>
                )}

                {selectedHabitDetails.evidenceType === EvidenceType.SELF && (
                  <TextField
                    fullWidth
                    label="Describe tu progreso"
                    multiline
                    minRows={3}
                    value={formData.evidenceNotes}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        evidenceNotes: e.target.value,
                      }))
                    }
                  />
                )}

                {selectedHabitDetails.evidenceType === EvidenceType.API && (
                  <TextField
                    fullWidth
                    label="Referencia o enlace de evidencia"
                    value={formData.evidenceNotes}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        evidenceNotes: e.target.value,
                      }))
                    }
                    helperText="Incluye un enlace, código o texto que respalde tu avance"
                  />
                )}

                {selectedHabitDetails.evidenceType === EvidenceType.WITNESS && (
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nombre del verificador"
                      value={formData.witnessName}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          witnessName: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Contacto del verificador (opcional)"
                      value={formData.witnessContact}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          witnessContact: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Notas adicionales (opcional)"
                      multiline
                      minRows={2}
                      value={formData.evidenceNotes}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          evidenceNotes: e.target.value,
                        }))
                      }
                    />
                  </Stack>
                )}

                {evidenceMissing && (
                  <Typography variant="caption" color="error">
                    Completa la evidencia para poder registrar tu progreso.
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button
            onClick={handleCreateProgress}
            variant="contained"
            disabled={!canSubmit}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
