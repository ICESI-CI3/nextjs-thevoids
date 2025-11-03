import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Payments from './page';
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

describe('Payments Page', () => {
  const hasPermission = jest.fn();
  let push: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    hasPermission.mockReturnValue(true);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'user@example.com', name: 'User' },
      hasPermission,
    });
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      data: [],
      status: 200,
    });
  });

  it('renders the payments page title', async () => {
    render(<Payments />);

    expect(await screen.findByText('Pagos y Cuotas')).toBeInTheDocument();
  });

  it('shows permission warning when user lacks access', async () => {
    hasPermission.mockReturnValue(false);

    render(<Payments />);

    expect(
      await screen.findByText('No tienes permisos para consultar tus pagos.')
    ).toBeInTheDocument();

    expect(transactionsApi.getByUser).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      hasPermission,
    });

    render(<Payments />);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/login');
    });
  });

  it('renders totals and sections when transactions exist', async () => {
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      status: 200,
      data: [
        {
          id: 'tx-1',
          createdAt: '2024-05-01T09:00:00Z',
          amount: '15.25',
          currency: 'USD',
          type: TransactionType.ENTRY,
          status: TransactionStatus.PENDING,
          hive: { name: 'Morning Hive' },
          preferenceId: 'pref-1',
        },
        {
          id: 'tx-2',
          createdAt: '2024-05-02T10:00:00Z',
          amount: 20,
          currency: 'EUR',
          type: TransactionType.ENTRY,
          status: TransactionStatus.COMPLETED,
          hive: { name: 'Explorer Hive' },
        },
        {
          id: 'tx-3',
          createdAt: '2024-05-03T11:00:00Z',
          amount: 'invalid',
          currency: 'COP',
          type: TransactionType.PAYOUT,
          status: TransactionStatus.COMPLETED,
          hive: { name: '' },
        },
      ],
    });

    render(<Payments />);

    const pendingCard = (await screen.findByText('Pendiente de pago')).closest(
      '.MuiCardContent-root'
    ) as HTMLElement | null;
    const completedCard = (await screen.findByText('Pagado')).closest(
      '.MuiCardContent-root'
    ) as HTMLElement | null;
    const payoutsCard = (await screen.findByText('Payouts recibidos')).closest(
      '.MuiCardContent-root'
    ) as HTMLElement | null;
    expect(pendingCard).not.toBeNull();
    expect(completedCard).not.toBeNull();
    expect(payoutsCard).not.toBeNull();

    const pendingCardScope = within(pendingCard!);
    const completedCardScope = within(completedCard!);
    const payoutsCardScope = within(payoutsCard!);

    expect(pendingCardScope.getByText(/\$\s*15\.25/)).toBeInTheDocument();
    expect(completedCardScope.getByText(/\$\s*20\.00/)).toBeInTheDocument();
    expect(payoutsCardScope.getByText(/\$\s*0\.00/)).toBeInTheDocument();

    expect(
      pendingCardScope.getByText(/1\s+cuota\s+abiertas/i)
    ).toBeInTheDocument();
    expect(
      completedCardScope.getByText(/1\s+pagos\s+completados/i)
    ).toBeInTheDocument();
    expect(
      payoutsCardScope.getByText(/1\s+movimientos\s+a\s+tu\s+favor/i)
    ).toBeInTheDocument();

    expect(screen.getByText('Preferencia: pref-1')).toBeInTheDocument();
    expect(
      screen.queryByText('No tienes pagos pendientes.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Aún no hay movimientos registrados.')
    ).not.toBeInTheDocument();
  });

  it('shows success when there are no pending payments', async () => {
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      status: 200,
      data: [
        {
          id: 'tx-1',
          createdAt: '2024-05-01T09:00:00Z',
          amount: 5,
          currency: 'USD',
          type: TransactionType.ENTRY,
          status: TransactionStatus.COMPLETED,
          hive: { name: 'Morning Hive' },
        },
      ],
    });

    render(<Payments />);

    expect(
      await screen.findByText('No tienes pagos pendientes.')
    ).toBeInTheDocument();
  });

  it('renders error alert when fetching transactions fails and allows dismissal', async () => {
    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      error: 'No se pudo consultar',
    });

    render(<Payments />);

    const alert = await screen.findByText('No se pudo consultar');
    expect(alert).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(
        screen.queryByText('No se pudo consultar')
      ).not.toBeInTheDocument();
    });
  });
});
