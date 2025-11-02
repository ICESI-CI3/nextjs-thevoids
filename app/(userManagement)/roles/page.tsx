'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { rolesApi, Role, CreateRoleDto, UpdateRoleDto } from '@/lib/api/roles';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { isAuthenticated } = useAuth();
  const hasLoadedRef = useRef(false);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const response = await rolesApi.getAll();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setRoles(response.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRoles();
    }
  }, [isAuthenticated, loadRoles]);

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (editingRole) {
      const updateData: UpdateRoleDto = formData;
      const response = await rolesApi.update(editingRole.id, updateData);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Rol actualizado correctamente');
        handleCloseDialog();
        loadRoles();
      }
    } else {
      const createData: CreateRoleDto = formData;
      const response = await rolesApi.create(createData);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Rol creado correctamente');
        handleCloseDialog();
        loadRoles();
      }
    }
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    setError('');
    setSuccess('');
    const response = await rolesApi.delete(roleToDelete.id);
    if (response.error) {
      setError(response.error);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } else {
      setSuccess('Rol eliminado correctamente');
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      loadRoles();
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Descripción', flex: 2, minWidth: 250 },
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
            setRoleToDelete(params.row);
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
          Roles
        </Typography>
        <Box>
          <IconButton onClick={loadRoles} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Rol
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

      <DataGrid
        rows={roles}
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
        <DialogTitle>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
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
            label="Descripción"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRole ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
      >
        <DialogTitle>Eliminar Rol</DialogTitle>
        <DialogContent>
          ¿Está seguro de eliminar el rol{' '}
          <strong>{roleToDelete?.name || 'este rol'}</strong>?
          {roleToDelete?.description && (
            <>
              <br />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {roleToDelete.description}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setRoleToDelete(null);
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
