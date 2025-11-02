'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Alert, IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { permissionsApi, Permission } from '@/lib/api/permissions';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();
  const hasLoadedRef = useRef(false);

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const response = await permissionsApi.getAll();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setPermissions(response.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPermissions();
    }
  }, [isAuthenticated, loadPermissions]);

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
          <IconButton onClick={loadPermissions} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
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
