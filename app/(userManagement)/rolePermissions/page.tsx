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
  Autocomplete,
} from '@mui/material';
import { Add, Delete, Refresh } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  RolePermission,
  CreateRolePermissionDto,
} from '@/lib/api/rolePermissions';
import { Role } from '@/lib/api/roles';
import { Permission } from '@/lib/api/permissions';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useData } from '@/lib/contexts/DataContext';

export default function RolePermissions() {
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [rolePermissionToDelete, setRolePermissionToDelete] =
    useState<RolePermission | null>(null);

  const { isAuthenticated } = useAuth();
  const {
    state,
    fetchRolePermissions,
    fetchRoles,
    fetchPermissions,
    createRolePermissionAsync,
    deleteRolePermissionAsync,
    setRolePermissionsError,
    setRolesError,
    setPermissionsError,
  } = useData();
  const hasLoadedRef = useRef(false);

  const loadData = useCallback(async () => {
    setSuccess('');
    await Promise.all([
      fetchRolePermissions(),
      fetchRoles(),
      fetchPermissions(),
    ]);
  }, [fetchPermissions, fetchRolePermissions, fetchRoles]);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleOpenDialog = () => {
    setSelectedRole(null);
    setSelectedPermission(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setSelectedPermission(null);
  };

  const handleSubmit = async () => {
    if (!selectedRole || !selectedPermission) {
      setRolePermissionsError('Debe seleccionar un rol y un permiso');
      return;
    }

    setRolePermissionsError(null);
    setSuccess('');

    const createData: CreateRolePermissionDto = {
      roleId: selectedRole.id,
      permissionId: selectedPermission.id,
    };

    const result = await createRolePermissionAsync(createData);
    if (!result.success) {
      return;
    }

    setSuccess('Permiso asignado al rol correctamente');
    handleCloseDialog();
  };

  const confirmDelete = async () => {
    if (!rolePermissionToDelete) return;
    setRolePermissionsError(null);
    setSuccess('');
    const result = await deleteRolePermissionAsync(
      rolePermissionToDelete.roleId,
      rolePermissionToDelete.permissionId
    );
    if (!result.success) {
      setDeleteDialogOpen(false);
      setRolePermissionToDelete(null);
      return;
    }

    setSuccess('Permiso de rol eliminado correctamente');
    setDeleteDialogOpen(false);
    setRolePermissionToDelete(null);
  };

  const rolePermissions = state.rolePermissions;
  const roles = state.roles;
  const permissions = state.permissions;
  const isLoading =
    state.loading.rolePermissions ||
    state.loading.roles ||
    state.loading.permissions;
  const error =
    state.errors.rolePermissions ||
    state.errors.roles ||
    state.errors.permissions;

  const columns: GridColDef[] = [
    {
      field: 'roleName',
      headerName: 'Rol',
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => row.role?.name || '-',
    },
    {
      field: 'permissionName',
      headerName: 'Permiso',
      flex: 1,
      minWidth: 250,
      valueGetter: (value, row) => row.permission?.name || '-',
    },
    {
      field: 'permissionDescription',
      headerName: 'Descripción',
      flex: 2,
      minWidth: 300,
      valueGetter: (value, row) => row.permission?.description || '-',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: params => [
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Eliminar"
          onClick={() => {
            setRolePermissionToDelete(params.row);
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
          Permisos de Rol
        </Typography>
        <Box>
          <IconButton onClick={loadData} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Asignar Permiso
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setRolePermissionsError(null);
            setRolesError(null);
            setPermissionsError(null);
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

      <DataGrid
        rows={rolePermissions}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        getRowId={row => `${row.roleId}-${row.permissionId}`}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Asignar Permiso a Rol</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={roles}
            getOptionLabel={option => option.name}
            value={selectedRole}
            onChange={(_, newValue) => setSelectedRole(newValue)}
            renderInput={params => (
              <TextField {...params} label="Rol" margin="dense" required />
            )}
          />
          <Autocomplete
            options={permissions}
            getOptionLabel={option =>
              `${option.name}${option.description ? ` - ${option.description}` : ''}`
            }
            value={selectedPermission}
            onChange={(_, newValue) => setSelectedPermission(newValue)}
            renderInput={params => (
              <TextField {...params} label="Permiso" margin="dense" required />
            )}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRolePermissionToDelete(null);
        }}
      >
        <DialogTitle>Eliminar Asignación de Permiso</DialogTitle>
        <DialogContent>
          ¿Está seguro de eliminar el permiso{' '}
          <strong>
            {rolePermissionToDelete?.permission?.name || 'este permiso'}
          </strong>{' '}
          del rol{' '}
          <strong>{rolePermissionToDelete?.role?.name || 'este rol'}</strong>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setRolePermissionToDelete(null);
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
