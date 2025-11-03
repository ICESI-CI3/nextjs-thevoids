'use client';

import { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { User, CreateUserDto, UpdateUserDto } from '@/lib/api/users';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useData } from '@/lib/contexts/DataContext';

export default function Users() {
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const { isAuthenticated } = useAuth();
  const {
    state,
    fetchUsers,
    createUserAsync,
    updateUserAsync,
    deleteUserAsync,
    setUsersError,
  } = useData();
  const hasLoadedRef = useRef(false);

  const users = state.users;
  const isLoading = state.loading.users;
  const error = state.errors.users;

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchUsers();
    }
  }, [fetchUsers, isAuthenticated]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
    });
  };

  const handleSubmit = async () => {
    setUsersError(null);
    setSuccess('');

    if (editingUser) {
      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateUserAsync(editingUser.id, updateData);
      if (!result.success) {
        return;
      }

      setSuccess('Usuario actualizado correctamente');
      handleCloseDialog();
    } else {
      const createData: CreateUserDto = formData;
      const result = await createUserAsync(createData);
      if (!result.success) {
        return;
      }

      setSuccess('Usuario creado correctamente');
      handleCloseDialog();
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setUsersError(null);
    setSuccess('');
    const result = await deleteUserAsync(userToDelete.id);
    if (!result.success) {
      return;
    }

    setSuccess('Usuario eliminado correctamente');
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Rol',
      width: 130,
      renderCell: params => (
        <Chip
          label={params.value}
          color={
            params.value === 'superadmin'
              ? 'error'
              : params.value === 'admin'
                ? 'warning'
                : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Activo',
      width: 100,
      renderCell: params => (
        <Chip
          label={params.value ? 'Sí' : 'No'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
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
            setUserToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Usuarios
        </Typography>
        <Box>
          <IconButton onClick={() => fetchUsers()} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setUsersError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <DataGrid
        rows={users}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label={
              editingUser
                ? 'Contraseña (dejar vacío para mantener)'
                : 'Contraseña'
            }
            type="password"
            fullWidth
            value={formData.password}
            onChange={e =>
              setFormData({ ...formData, password: e.target.value })
            }
            required={!editingUser}
          />
          <TextField
            margin="dense"
            label="Rol"
            select
            fullWidth
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
      >
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          ¿Está seguro de eliminar al usuario{' '}
          <strong>{userToDelete?.name || 'este usuario'}</strong>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setUserToDelete(null);
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
