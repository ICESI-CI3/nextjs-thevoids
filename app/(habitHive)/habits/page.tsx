'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Grid,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
  FitnessCenter,
  Camera,
  Person,
  Visibility,
  Api,
} from '@mui/icons-material';
import {
  Habit,
  CreateHabitDto,
  HabitType,
  EvidenceType,
} from '@/lib/api/habits';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useHabitHive } from '@/lib/contexts/HabitHiveContext';

export default function Habits() {
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [formData, setFormData] = useState<CreateHabitDto>({
    title: '',
    type: HabitType.OBJECTIVE,
    frequency: 'daily',
    evidenceType: EvidenceType.PHOTO,
  });

  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const {
    state,
    fetchHabits,
    createHabitAsync,
    updateHabitAsync,
    deleteHabitAsync,
    setHabitsError,
  } = useHabitHive();
  const habits = state.habits;
  const isLoading = state.loading.habits;
  const contextError = state.errors.habits;

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load habits automatically when authenticated
    const timer = setTimeout(() => fetchHabits(), 0);
    return () => clearTimeout(timer);
  }, [authLoading, fetchHabits, isAuthenticated, router]);

  const filteredHabits = useMemo(() => {
    let filtered = habits;

    if (searchTerm) {
      filtered = filtered.filter(habit =>
        habit.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(habit => habit.type === typeFilter);
    }

    if (evidenceFilter !== 'all') {
      filtered = filtered.filter(
        habit => habit.evidenceType === evidenceFilter
      );
    }

    return filtered;
  }, [evidenceFilter, habits, searchTerm, typeFilter]);

  const handleOpenDialog = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        title: habit.title,
        type: habit.type,
        frequency: habit.frequency || 'daily',
        evidenceType: habit.evidenceType,
        userId: habit.userId,
      });
    } else {
      setEditingHabit(null);
      setFormData({
        title: '',
        type: HabitType.OBJECTIVE,
        frequency: 'daily',
        evidenceType: EvidenceType.PHOTO,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHabit(null);
  };

  const handleSubmit = async () => {
    setHabitsError(null);
    setSuccess('');

    if (!user) {
      setLocalError('Debes iniciar sesión para gestionar hábitos');
      router.push('/login');
      return;
    }

    if (editingHabit) {
      const { ...updateData } = formData;
      const result = await updateHabitAsync(editingHabit.id, updateData);
      if (!result.success) {
        return;
      }

      setSuccess('Hábito actualizado correctamente');
      handleCloseDialog();
    } else {
      const result = await createHabitAsync({
        ...formData,
        userId: user.id,
      });
      if (!result.success) {
        return;
      }

      setSuccess('Hábito creado correctamente');
      handleCloseDialog();
    }
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    setHabitsError(null);
    setSuccess('');
    const result = await deleteHabitAsync(habitToDelete.id);
    if (!result.success) {
      return;
    }

    setSuccess('Hábito eliminado correctamente');
    setDeleteDialogOpen(false);
    setHabitToDelete(null);
  };

  const handleViewHives = (habitId: string) => {
    router.push(`/hives?habitId=${habitId}`);
  };

  const getTypeColor = (type: HabitType) => {
    switch (type) {
      case HabitType.OBJECTIVE:
        return 'success';
      case HabitType.SEMI:
        return 'warning';
      case HabitType.SUBJECTIVE:
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: HabitType) => {
    switch (type) {
      case HabitType.OBJECTIVE:
        return 'Objetivo';
      case HabitType.SEMI:
        return 'Semi-Objetivo';
      case HabitType.SUBJECTIVE:
        return 'Subjetivo';
      default:
        return type;
    }
  };

  const getEvidenceIcon = (evidence: EvidenceType) => {
    switch (evidence) {
      case EvidenceType.API:
        return <Api fontSize="small" />;
      case EvidenceType.PHOTO:
        return <Camera fontSize="small" />;
      case EvidenceType.SELF:
        return <Person fontSize="small" />;
      case EvidenceType.WITNESS:
        return <Visibility fontSize="small" />;
      default:
        return null;
    }
  };

  const getEvidenceLabel = (evidence: EvidenceType) => {
    switch (evidence) {
      case EvidenceType.API:
        return 'API';
      case EvidenceType.PHOTO:
        return 'Foto';
      case EvidenceType.SELF:
        return 'Auto-reporte';
      case EvidenceType.WITNESS:
        return 'Testigo';
      default:
        return evidence;
    }
  };

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
            Descubre Hábitos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explora hábitos y únete a colmenas para alcanzar tus metas
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => fetchHabits()} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            data-testid="create-habit-button"
          >
            Crear Hábito
          </Button>
        </Box>
      </Box>

      {contextError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setHabitsError(null)}
        >
          {contextError}
        </Alert>
      )}

      {localError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setLocalError('')}
        >
          {localError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar hábitos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={typeFilter}
            label="Tipo"
            onChange={e => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value={HabitType.OBJECTIVE}>Objetivo</MenuItem>
            <MenuItem value={HabitType.SEMI}>Semi-Objetivo</MenuItem>
            <MenuItem value={HabitType.SUBJECTIVE}>Subjetivo</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Evidencia</InputLabel>
          <Select
            value={evidenceFilter}
            label="Evidencia"
            onChange={e => setEvidenceFilter(e.target.value)}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value={EvidenceType.API}>API</MenuItem>
            <MenuItem value={EvidenceType.PHOTO}>Foto</MenuItem>
            <MenuItem value={EvidenceType.SELF}>Auto-reporte</MenuItem>
            <MenuItem value={EvidenceType.WITNESS}>Testigo</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Habits Grid */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando hábitos...</Typography>
        </Box>
      ) : filteredHabits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FitnessCenter sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron hábitos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || typeFilter !== 'all' || evidenceFilter !== 'all'
              ? 'Intenta con otros filtros'
              : 'Crea tu primer hábito para comenzar'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredHabits.map(habit => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={habit.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleViewHives(habit.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ flexGrow: 1 }}
                    >
                      {habit.title}
                    </Typography>
                    <Chip
                      label={habit.isActive ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={habit.isActive ? 'success' : 'default'}
                    />
                  </Box>

                  <Stack spacing={1}>
                    <Chip
                      label={getTypeLabel(habit.type)}
                      color={getTypeColor(habit.type)}
                      size="small"
                      sx={{ width: 'fit-content' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getEvidenceIcon(habit.evidenceType)}
                      <Typography variant="body2" color="text.secondary">
                        Evidencia: {getEvidenceLabel(habit.evidenceType)}
                      </Typography>
                    </Box>
                    {habit.frequency && (
                      <Typography variant="body2" color="text.secondary">
                        Frecuencia: {habit.frequency}
                      </Typography>
                    )}
                    {habit.user && (
                      <Typography variant="caption" color="text.secondary">
                        Creado por: {habit.user.name}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>

                <CardActions
                  sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}
                  onClick={e => e.stopPropagation()}
                >
                  <Tooltip title="Ver Colmenas">
                    <IconButton
                      size="small"
                      onClick={() => handleViewHives(habit.id)}
                    >
                      <Api fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(habit)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setHabitToDelete(habit);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingHabit ? 'Editar Hábito' : 'Crear Nuevo Hábito'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título del hábito"
            type="text"
            fullWidth
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            helperText="Ej: Correr 5km, Leer 30 minutos, Meditar"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de hábito</InputLabel>
            <Select
              value={formData.type}
              label="Tipo de hábito"
              onChange={e =>
                setFormData({ ...formData, type: e.target.value as HabitType })
              }
            >
              <MenuItem value={HabitType.OBJECTIVE}>
                Objetivo - Verificable por datos
              </MenuItem>
              <MenuItem value={HabitType.SEMI}>
                Semi-Objetivo - Verificable parcialmente
              </MenuItem>
              <MenuItem value={HabitType.SUBJECTIVE}>
                Subjetivo - Auto-reporte
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de evidencia</InputLabel>
            <Select
              value={formData.evidenceType}
              label="Tipo de evidencia"
              onChange={e =>
                setFormData({
                  ...formData,
                  evidenceType: e.target.value as EvidenceType,
                })
              }
            >
              <MenuItem value={EvidenceType.API}>
                API - Integración automática
              </MenuItem>
              <MenuItem value={EvidenceType.PHOTO}>
                Foto - Imagen de prueba
              </MenuItem>
              <MenuItem value={EvidenceType.SELF}>
                Auto-reporte - Confirmación personal
              </MenuItem>
              <MenuItem value={EvidenceType.WITNESS}>
                Testigo - Validación por otro usuario
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Frecuencia"
            type="text"
            fullWidth
            value={formData.frequency}
            onChange={e =>
              setFormData({ ...formData, frequency: e.target.value })
            }
            helperText="Ej: diaria, semanal, 3 veces por semana"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingHabit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHabitToDelete(null);
        }}
      >
        <DialogTitle>Eliminar Hábito</DialogTitle>
        <DialogContent>
          ¿Estás seguro de eliminar el hábito{' '}
          <strong>{habitToDelete?.title}</strong>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setHabitToDelete(null);
            }}
          >
            Cancelar
          </Button>
          <Button color="error" onClick={confirmDelete} variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
