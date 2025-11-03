'use client';

import { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Avatar,
  Stack,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Search, Group } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  HiveMember,
  CreateHiveMemberDto,
  UpdateHiveMemberDto,
  MemberRole,
  MemberStatus,
} from '@/lib/api/hiveMembers';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useHabitHive } from '@/lib/contexts/HabitHiveContext';
import { useData } from '@/lib/contexts/DataContext';

export default function HiveMembers() {
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<HiveMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<HiveMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    hiveId: '',
    userId: '',
    role: MemberRole.MEMBER,
  });

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    state: habitState,
    fetchHiveMembers,
    fetchHives,
    createHiveMemberAsync,
    updateHiveMemberAsync,
    deleteHiveMemberAsync,
    setHiveMembersError,
  } = useHabitHive();
  const { state: dataState, fetchUsers, setUsersError } = useData();
  const hasLoadedRef = useRef(false);
  const router = useRouter();

  const members = habitState.hiveMembers;
  const hives = habitState.hives;
  const users = dataState.users;
  const isLoading =
    habitState.loading.hiveMembers ||
    habitState.loading.hives ||
    dataState.loading.users;
  const error =
    habitState.errors.hiveMembers ||
    habitState.errors.hives ||
    dataState.errors.users;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // avoid calling setState synchronously inside effect
      const t = setTimeout(() => {
        fetchHiveMembers();
        fetchHives();
        fetchUsers();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [
    authLoading,
    fetchHiveMembers,
    fetchHives,
    fetchUsers,
    isAuthenticated,
    router,
  ]);

  const handleOpenDialog = (member?: HiveMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        hiveId: member.hiveId,
        userId: member.userId,
        role: member.role,
      });
    } else {
      setEditingMember(null);
      setFormData({
        hiveId: '',
        userId: '',
        role: MemberRole.MEMBER,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
  };

  const handleSubmit = async () => {
    setHiveMembersError(null);
    setUsersError(null);
    setSuccess('');

    if (editingMember) {
      const updateData: UpdateHiveMemberDto = {
        role: formData.role,
      };

      const result = await updateHiveMemberAsync(editingMember.id, updateData);
      if (!result.success) {
        return;
      }

      setSuccess('Miembro actualizado correctamente');
      handleCloseDialog();
    } else {
      const createData: CreateHiveMemberDto = formData;
      const result = await createHiveMemberAsync(createData);
      if (!result.success) {
        return;
      }

      setSuccess('Miembro agregado correctamente');
      handleCloseDialog();
    }
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    setHiveMembersError(null);
    setSuccess('');
    const result = await deleteHiveMemberAsync(
      memberToDelete.hiveId,
      memberToDelete.userId
    );
    if (!result.success) {
      return;
    }

    setSuccess('Miembro eliminado correctamente');
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case MemberRole.OWNER:
        return 'error';
      case MemberRole.MODERATOR:
        return 'warning';
      case MemberRole.MEMBER:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: MemberStatus) => {
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

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'Usuario',
      flex: 1,
      minWidth: 200,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.user?.name?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2">
              {params.row.user?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.user?.email || ''}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'hive',
      headerName: 'Colmena',
      flex: 1,
      minWidth: 200,
      renderCell: params => (
        <Typography variant="body2">
          {params.row.hive?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 130,
      renderCell: params => (
        <Chip
          label={params.value}
          color={getRoleColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      renderCell: params => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'joinedAt',
      headerName: 'Fecha de Ingreso',
      width: 150,
      renderCell: params =>
        new Date(params.value).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: params => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Eliminar"
          onClick={() => {
            setMemberToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      searchTerm === '' ||
      member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.hive?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === MemberStatus.ACTIVE).length,
    eliminated: members.filter(m => m.status === MemberStatus.ELIMINATED)
      .length,
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
            Miembros de Colmenas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona los miembros y sus roles en las colmenas
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => fetchHiveMembers()} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Agregar Miembro
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Group color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Miembros
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
                <Group color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.active}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activos
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
                <Group color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.eliminated}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Eliminados
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setHiveMembersError(null);
            setUsersError(null);
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por usuario o colmena..."
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
            <MenuItem value={MemberStatus.ACTIVE}>Activos</MenuItem>
            <MenuItem value={MemberStatus.ELIMINATED}>Eliminados</MenuItem>
            <MenuItem value={MemberStatus.LEFT}>Retirados</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Data Grid */}
      <DataGrid
        rows={filteredMembers}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingMember ? 'Editar Miembro' : 'Agregar Miembro'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" disabled={!!editingMember}>
            <InputLabel>Colmena</InputLabel>
            <Select
              value={formData.hiveId}
              label="Colmena"
              onChange={e =>
                setFormData({ ...formData, hiveId: e.target.value })
              }
              required
            >
              {hives.map(hive => (
                <MenuItem key={hive.id} value={hive.id}>
                  {hive.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" disabled={!!editingMember}>
            <InputLabel>Usuario</InputLabel>
            <Select
              value={formData.userId}
              label="Usuario"
              onChange={e =>
                setFormData({ ...formData, userId: e.target.value })
              }
              required
            >
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              label="Rol"
              onChange={e =>
                setFormData({ ...formData, role: e.target.value as MemberRole })
              }
            >
              <MenuItem value={MemberRole.MEMBER}>Miembro</MenuItem>
              <MenuItem value={MemberRole.MODERATOR}>Moderador</MenuItem>
              <MenuItem value={MemberRole.OWNER}>Propietario</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMember ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMemberToDelete(null);
        }}
      >
        <DialogTitle>Eliminar Miembro</DialogTitle>
        <DialogContent>
          ¿Estás seguro de eliminar a{' '}
          <strong>{memberToDelete?.user?.name || 'este miembro'}</strong> de la
          colmena?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setMemberToDelete(null);
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
