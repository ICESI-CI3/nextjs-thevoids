'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  transactionsApi,
} from '@/lib/api/transactions';
import { useAuth } from '@/lib/contexts/AuthContext';

const READ_TRANSACTIONS_PERMISSION = 'READ_TRANSACTIONS';

const parseAmount = (value: number | string | undefined): number => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(amount) ? Number(amount) : 0;
};

export default function Payments() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    hasPermission,
  } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(READ_TRANSACTIONS_PERMISSION)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInfo('No tienes permisos para consultar tus pagos.');

      setTransactions([]);
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
  }, [authLoading, hasPermission, isAuthenticated, router, user]);

  const pendingEntries = useMemo(
    () =>
      transactions.filter(
        transaction =>
          transaction.type === TransactionType.ENTRY &&
          transaction.status === TransactionStatus.PENDING
      ),
    [transactions]
  );

  const completedEntries = useMemo(
    () =>
      transactions.filter(
        transaction =>
          transaction.type === TransactionType.ENTRY &&
          transaction.status === TransactionStatus.COMPLETED
      ),
    [transactions]
  );

  const payouts = useMemo(
    () =>
      transactions.filter(
        transaction => transaction.type === TransactionType.PAYOUT
      ),
    [transactions]
  );

  const totals = useMemo(() => {
    const totalPending = pendingEntries.reduce(
      (sum, transaction) => sum + parseAmount(transaction.amount),
      0
    );
    const totalCompleted = completedEntries.reduce(
      (sum, transaction) => sum + parseAmount(transaction.amount),
      0
    );
    const totalPayouts = payouts.reduce(
      (sum, transaction) => sum + parseAmount(transaction.amount),
      0
    );

    return {
      pending: totalPending,
      completed: totalCompleted,
      payouts: totalPayouts,
    };
  }, [completedEntries, pendingEntries, payouts]);

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
            Pagos y Cuotas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa tus pagos pendientes y el historial de movimientos
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
        <>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pendiente de pago
                </Typography>
                <Typography variant="h4">
                  ${totals.pending.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pendingEntries.length}{' '}
                  {pendingEntries.length === 1 ? 'cuota' : 'cuotas'} abiertas
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pagado
                </Typography>
                <Typography variant="h4">
                  ${totals.completed.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {completedEntries.length} pagos completados
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Payouts recibidos
                </Typography>
                <Typography variant="h4">
                  ${totals.payouts.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {payouts.length} movimientos a tu favor
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Pagos pendientes
            </Typography>
            {pendingEntries.length === 0 ? (
              <Alert severity="success">No tienes pagos pendientes.</Alert>
            ) : (
              <Stack spacing={2}>
                {pendingEntries.map(transaction => (
                  <Card key={transaction.id} variant="outlined">
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {transaction.hive?.name || 'Pago pendiente'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Registrado el{' '}
                            {new Date(transaction.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Typography variant="h6">
                            ${parseAmount(transaction.amount).toFixed(2)}
                          </Typography>
                          {transaction.preferenceId && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Preferencia: {transaction.preferenceId}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Historial de pagos
            </Typography>
            {transactions.length === 0 ? (
              <Alert severity="info">Aún no hay movimientos registrados.</Alert>
            ) : (
              <Stack spacing={2}>
                {transactions.map(transaction => (
                  <Card key={`history-${transaction.id}`} variant="outlined">
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {transaction.hive?.name || 'Movimiento'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.type.toUpperCase()} ·{' '}
                            {transaction.status.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Typography variant="h6">
                            ${parseAmount(transaction.amount).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.currency}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
