'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography, Alert, IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Permission } from '@/lib/api/permissions';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useData } from '@/lib/contexts/DataContext';

export default function Permissions() {
  const { isAuthenticated } = useAuth();
  const { state, fetchPermissions, setPermissionsError } = useData();
  const hasLoadedRef = useRef(false);

  const permissions = state.permissions as Permission[];
  const isLoading = state.loading.permissions;
  const error = state.errors.permissions;

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchPermissions();
    }
  }, [fetchPermissions, isAuthenticated]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Descripción', flex: 2, minWidth: 300 },
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
          Permisos
        </Typography>
        <Box>
          <IconButton onClick={() => fetchPermissions()} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setPermissionsError(null)}
        >
          {error}
        </Alert>
      )}

      <DataGrid
        rows={permissions}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Box>
  );
}
