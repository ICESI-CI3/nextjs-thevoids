import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  transactionsApi,
  TransactionStatus,
  TransactionType,
} from '@/lib/api/transactions';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/transactions', () => ({
  transactionsApi: {
    getByUser: jest.fn(),
  },
  TransactionStatus: {
    COMPLETED: 'completed',
    FAILED: 'failed',
    PENDING: 'pending',
  },
  TransactionType: {
    ENTRY: 'entry',
    PAYOUT: 'payout',
    REFUND: 'refund',
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as unknown as jest.Mock;
const mockUseRouter = useRouter as unknown as jest.Mock;

describe('Transactions Page', () => {
  const mockHasPermission = jest.fn();
  let routerPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    routerPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: routerPush });
    mockHasPermission.mockReturnValue(true);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'user@example.com' },
      hasPermission: mockHasPermission,
    });
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      data: [],
      status: 200,
    });
  });

  it('renders the transactions page title', async () => {
    render(<TransactionsPage />);

    expect(await screen.findByText('Transacciones')).toBeInTheDocument();
  });

  it('requests transactions for the user when permitted', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(transactionsApi.getByUser).toHaveBeenCalledWith('user-1');
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      hasPermission: mockHasPermission,
    });

    render(<TransactionsPage />);

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith('/login');
    });
    expect(transactionsApi.getByUser).not.toHaveBeenCalled();
  });

  it('shows an info alert when the user lacks permission and clears it on close', async () => {
    mockHasPermission.mockReturnValue(false);

    render(<TransactionsPage />);

    const alert = await screen.findByText(
      'No tienes permisos para consultar las transacciones.'
    );
    expect(alert).toBeInTheDocument();
    expect(transactionsApi.getByUser).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(
          'No tienes permisos para consultar las transacciones.'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('renders an error alert when fetching fails and allows dismissing it', async () => {
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      error: 'No se pudo cargar',
    });

    render(<TransactionsPage />);

    const errorAlert = await screen.findByText('No se pudo cargar');
    expect(errorAlert).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByText('No se pudo cargar')).not.toBeInTheDocument();
    });
  });

  it('renders transaction rows with formatted values and status colors', async () => {
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'tx-1',
          createdAt: '2024-05-01T10:15:00Z',
          amount: '12.5',
          currency: 'USD',
          type: TransactionType.ENTRY,
          status: TransactionStatus.COMPLETED,
          hive: { name: 'Morning Hive' },
        },
        {
          id: 'tx-2',
          createdAt: '2024-05-02T10:15:00Z',
          amount: 7,
          currency: 'EUR',
          type: TransactionType.PAYOUT,
          status: TransactionStatus.FAILED,
          hive: { name: 'Explorer Hive' },
        },
        {
          id: 'tx-3',
          createdAt: '2024-05-03T10:15:00Z',
          amount: 'invalid',
          currency: 'COP',
          type: TransactionType.REFUND,
          status: TransactionStatus.PENDING,
          hive: { name: '' },
        },
      ],
      status: 200,
    });

    render(<TransactionsPage />);

    expect(await screen.findByText('Morning Hive')).toBeInTheDocument();
    expect(screen.getByText('Explorer Hive')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();

    expect(screen.getByText('Entrada')).toBeInTheDocument();
    expect(screen.getByText('Payout')).toBeInTheDocument();
    expect(screen.getByText('Reembolso')).toBeInTheDocument();

    expect(screen.getByText('$12.50')).toBeInTheDocument();
    expect(screen.getByText('$7.00')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();

    const completedChip = screen
      .getByText('completed')
      .closest('.MuiChip-root') as HTMLElement | null;
    const failedChip = screen
      .getByText('failed')
      .closest('.MuiChip-root') as HTMLElement | null;
    const pendingChip = screen
      .getByText('pending')
      .closest('.MuiChip-root') as HTMLElement | null;

    expect(completedChip).not.toBeNull();
    expect(completedChip).toHaveClass('MuiChip-colorSuccess');
    expect(failedChip).not.toBeNull();
    expect(failedChip).toHaveClass('MuiChip-colorError');
    expect(pendingChip).not.toBeNull();
    expect(pendingChip).toHaveClass('MuiChip-colorWarning');
  });
});
