'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Chip, CircularProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  transactionsApi,
} from '@/lib/api/transactions';
import { useAuth } from '@/lib/contexts/AuthContext';

const READ_TRANSACTIONS_PERMISSION = 'READ_TRANSACTIONS';

const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return 'success';
    case TransactionStatus.FAILED:
      return 'error';
    default:
      return 'warning';
  }
};

const parseAmount = (value: number | string | undefined): number => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(amount) ? Number(amount) : 0;
};

export default function TransactionsPage() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    hasPermission,
  } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isClient, setIsClient] = useState(false);

  interface TransactionRow {
    id: string;
    createdAt: string;
    hiveName: string;
    type: TransactionType;
    status: TransactionStatus;
    amountNumber: number;
    currency: string;
  }

  const rows: TransactionRow[] = useMemo(
    () =>
      transactions.map(transaction => {
        const amountNumber = parseAmount(transaction.amount);

        return {
          id: transaction.id,
          createdAt: transaction.createdAt,
          hiveName: transaction.hive?.name || 'N/A',
          type: transaction.type,
          status: transaction.status,
          amountNumber,
          currency: transaction.currency,
        };
      }),
    [transactions]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      router.push('/login');
      return;
    }

    if (!hasPermission(READ_TRANSACTIONS_PERMISSION)) {
      setInfo('No tienes permisos para consultar las transacciones.');
      setTransactions([]);

      setIsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError('');
      setInfo('');
      const response = await transactionsApi.getByUser(user.id);
      if (response.error) {
        setError(response.error);
        setTransactions([]);
      } else if (response.data) {
        setTransactions(response.data);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, [isClient, authLoading, hasPermission, isAuthenticated, router, user]);

  if (!isClient) {
    return (
      <Box
        data-testid="loading-box"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  const columns: GridColDef<TransactionRow>[] = [
    {
      field: 'createdAt',
      headerName: 'Fecha',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: string | undefined) => {
        return value ? new Date(value).toLocaleString() : '';
      },
    },
    {
      field: 'hiveName',
      headerName: 'Colmena',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      renderCell: params => {
        const labelMap: Record<TransactionType, string> = {
          [TransactionType.ENTRY]: 'Entrada',
          [TransactionType.PAYOUT]: 'Payout',
          [TransactionType.REFUND]: 'Reembolso',
        };
        return labelMap[params.row.type];
      },
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 140,
      renderCell: params => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: 'amountNumber',
      headerName: 'Monto',
      width: 140,
      valueFormatter: (value: number | undefined) => {
        const numValue = Number(value || 0);
        return `$${numValue.toFixed(2)}`;
      },
    },
    {
      field: 'currency',
      headerName: 'Moneda',
      width: 120,
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Transacciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de pagos y movimientos en colmenas
          </Typography>
        </Box>
      </Box>

      {info && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setInfo('')}>
          {info}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 6,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: {
              sortModel: [
                {
                  field: 'createdAt',
                  sort: 'desc',
                },
              ],
            },
          }}
        />
      )}
    </Box>
  );
}
