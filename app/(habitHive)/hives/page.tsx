'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  AvatarGroup,
  Divider,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
  Hive as HiveIcon,
  Group,
  AttachMoney,
  Schedule,
  Visibility,
  PersonAdd,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Public,
  Lock,
} from '@mui/icons-material';
import { hivesApi, Hive, CreateHiveDto, HiveStatus } from '@/lib/api/hives';
import { hiveMembersApi, MemberRole } from '@/lib/api/hiveMembers';
import { HabitType } from '@/lib/api/habits';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Hives() {
  const [hives, setHives] = useState<Hive[]>([]);
  const [filteredHives, setFilteredHives] = useState<Hive[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHive, setEditingHive] = useState<Hive | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hiveToDelete, setHiveToDelete] = useState<Hive | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<CreateHiveDto>({
    name: '',
    description: '',
    durationDays: 30,
    entryFee: 0,
    eliminationType: 'consecutive',
    allowedHabitTypes: [
      HabitType.OBJECTIVE,
      HabitType.SEMI,
      HabitType.SUBJECTIVE,
    ],
    isPublic: true,
  });

  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const hasLoadedRef = useRef(false);
  const router = useRouter();

  const loadHives = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const response = await hivesApi.getAll();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setHives(response.data);
      setFilteredHives(response.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // avoid calling setState synchronously inside effect
      const t = setTimeout(() => loadHives(), 0);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, authLoading, loadHives, router]);

  // Filter hives based on search and filters
  useEffect(() => {
    let filtered = hives;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        hive =>
          hive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hive.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(hive => hive.status === statusFilter);
    }

    // avoid calling setState synchronously inside effect
    const t = setTimeout(() => setFilteredHives(filtered), 0);
    return () => clearTimeout(t);
  }, [searchTerm, statusFilter, hives]);

  const handleOpenDialog = (hive?: Hive) => {
    if (hive) {
      setEditingHive(hive);
      setFormData({
        name: hive.name,
        description: hive.description || '',
        durationDays: hive.durationDays,
        entryFee: Number(hive.entryFee),
        eliminationType: hive.eliminationType,
        allowedHabitTypes: hive.allowedHabitTypes,
        isPublic: hive.isPublic,
      });
    } else {
      setEditingHive(null);
      setFormData({
        name: '',
        description: '',
        durationDays: 30,
        entryFee: 0,
        eliminationType: 'consecutive',
        allowedHabitTypes: [
          HabitType.OBJECTIVE,
          HabitType.SEMI,
          HabitType.SUBJECTIVE,
        ],
        isPublic: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHive(null);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (editingHive) {
      const response = await hivesApi.update(editingHive.id, formData);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Colmena actualizada correctamente');
        handleCloseDialog();
        loadHives();
      }
    } else {
      const response = await hivesApi.create(formData);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Colmena creada correctamente');
        handleCloseDialog();
        loadHives();
      }
    }
  };

  const confirmDelete = async () => {
    if (!hiveToDelete) return;
    setError('');
    setSuccess('');
    const response = await hivesApi.delete(hiveToDelete.id);
    if (response.error) {
      setError(response.error);
    } else {
      setSuccess('Colmena eliminada correctamente');
      setDeleteDialogOpen(false);
      setHiveToDelete(null);
      loadHives();
    }
  };

  const handleJoinHive = async (hiveId: string) => {
    if (!user) return;
    setError('');
    setSuccess('');
    const response = await hiveMembersApi.create({
      hiveId,
      userId: user.id,
      role: MemberRole.MEMBER,
    });
    if (response.error) {
      setError(response.error);
    } else {
      setSuccess('¡Te has unido a la colmena!');
      loadHives();
    }
  };

  const handleViewDetails = (hive: Hive) => {
    setSelectedHive(hive);
    setDetailsDialogOpen(true);
  };

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

  const getStatusIcon = (status: HiveStatus) => {
    switch (status) {
      case HiveStatus.OPEN:
        return <PersonAdd />;
      case HiveStatus.IN_PROGRESS:
        return <HourglassEmpty />;
      case HiveStatus.FINISHED:
        return <CheckCircle />;
      case HiveStatus.CANCELLED:
        return <Cancel />;
      default:
        return null;
    }
  };

  const toggleHabitType = (type: HabitType) => {
    setFormData(prev => {
      const current = prev.allowedHabitTypes || [];
      const isSelected = current.includes(type);
      return {
        ...prev,
        allowedHabitTypes: isSelected
          ? current.filter(t => t !== type)
          : [...current, type],
      };
    });
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
            Colmenas Activas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Únete a retos grupales y alcanza tus metas junto a otros
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={loadHives} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Crear Colmena
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

      {/* Search and Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar colmenas..."
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
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            label="Estado"
            onChange={e => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value={HiveStatus.OPEN}>Abiertas</MenuItem>
            <MenuItem value={HiveStatus.IN_PROGRESS}>En Progreso</MenuItem>
            <MenuItem value={HiveStatus.FINISHED}>Finalizadas</MenuItem>
            <MenuItem value={HiveStatus.CANCELLED}>Canceladas</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Hives Grid */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando colmenas...</Typography>
        </Box>
      ) : filteredHives.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <HiveIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron colmenas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all'
              ? 'Intenta con otros filtros'
              : 'Crea tu primera colmena para comenzar'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredHives.map(hive => (
            <Grid item xs={12} sm={6} md={4} key={hive.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  position: 'relative',
                }}
              >
                {/* Privacy Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                  }}
                >
                  {hive.isPublic ? (
                    <Tooltip title="Pública">
                      <Public fontSize="small" color="action" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Privada">
                      <Lock fontSize="small" color="action" />
                    </Tooltip>
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {hive.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {hive.description || 'Sin descripción'}
                  </Typography>

                  <Stack spacing={1.5}>
                    <Chip
                      icon={getStatusIcon(hive.status)}
                      label={getStatusLabel(hive.status)}
                      color={getStatusColor(hive.status)}
                      size="small"
                      sx={{ width: 'fit-content' }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {hive.durationDays} días
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        ${hive.entryFee}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {hive._count?.members || hive.members?.length || 0}{' '}
                        miembros
                      </Typography>
                      {hive.members && hive.members.length > 0 && (
                        <AvatarGroup max={3} sx={{ ml: 'auto' }}>
                          {hive.members.slice(0, 3).map(member => (
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

                    {hive.createdBy && (
                      <Typography variant="caption" color="text.secondary">
                        Creada por: {hive.createdBy.name}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions
                  sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}
                >
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(hive)}
                  >
                    Ver Detalles
                  </Button>
                  <Box>
                    {hive.status === HiveStatus.OPEN && (
                      <Tooltip title="Unirse">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleJoinHive(hive.id)}
                        >
                          <PersonAdd fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(hive)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setHiveToDelete(hive);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingHive ? 'Editar Colmena' : 'Crear Nueva Colmena'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la colmena"
            type="text"
            fullWidth
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            helperText="Ej: Corredores Matutinos, Club de Lectura"
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            helperText="Describe el objetivo y reglas de la colmena"
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Duración (días)"
                type="number"
                fullWidth
                value={formData.durationDays}
                onChange={e =>
                  setFormData({
                    ...formData,
                    durationDays: parseInt(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Cuota de entrada ($)"
                type="number"
                fullWidth
                value={formData.entryFee}
                onChange={e =>
                  setFormData({
                    ...formData,
                    entryFee: parseFloat(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Tipo de eliminación"
            type="text"
            fullWidth
            value={formData.eliminationType}
            onChange={e =>
              setFormData({ ...formData, eliminationType: e.target.value })
            }
            helperText="Ej: consecutive, percentage, strikes"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tipos de hábitos permitidos:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.allowedHabitTypes?.includes(
                      HabitType.OBJECTIVE
                    )}
                    onChange={() => toggleHabitType(HabitType.OBJECTIVE)}
                  />
                }
                label="Objetivo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.allowedHabitTypes?.includes(
                      HabitType.SEMI
                    )}
                    onChange={() => toggleHabitType(HabitType.SEMI)}
                  />
                }
                label="Semi-Objetivo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.allowedHabitTypes?.includes(
                      HabitType.SUBJECTIVE
                    )}
                    onChange={() => toggleHabitType(HabitType.SUBJECTIVE)}
                  />
                }
                label="Subjetivo"
              />
            </Stack>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isPublic}
                onChange={e =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
              />
            }
            label="Colmena pública"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingHive ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HiveIcon />
            {selectedHive?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedHive && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedHive.description || 'Sin descripción'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedHive.status)}
                    label={getStatusLabel(selectedHive.status)}
                    color={getStatusColor(selectedHive.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duración
                  </Typography>
                  <Typography variant="body1">
                    {selectedHive.durationDays} días
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cuota de entrada
                  </Typography>
                  <Typography variant="body1">
                    ${selectedHive.entryFee}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de eliminación
                  </Typography>
                  <Typography variant="body1">
                    {selectedHive.eliminationType}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipos de hábitos permitidos
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {selectedHive.allowedHabitTypes.map(type => (
                      <Chip key={type} label={type} size="small" />
                    ))}
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Miembros ({selectedHive.members?.length || 0})
              </Typography>
              {selectedHive.members && selectedHive.members.length > 0 ? (
                <List>
                  {selectedHive.members.map(member => (
                    <ListItem key={member.id}>
                      <ListItemAvatar>
                        <Avatar>{member.user?.name?.[0] || 'U'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.user?.name || 'Usuario'}
                        secondary={
                          <Stack direction="row" spacing={1}>
                            <Chip label={member.role} size="small" />
                            <Chip label={member.status} size="small" />
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aún no hay miembros en esta colmena
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedHive?.status === HiveStatus.OPEN && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                if (selectedHive) {
                  handleJoinHive(selectedHive.id);
                  setDetailsDialogOpen(false);
                }
              }}
            >
              Unirse a la Colmena
            </Button>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHiveToDelete(null);
        }}
      >
        <DialogTitle>Eliminar Colmena</DialogTitle>
        <DialogContent>
          ¿Estás seguro de eliminar la colmena{' '}
          <strong>{hiveToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setHiveToDelete(null);
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
