import { render, screen, waitFor } from '@testing-library/react';
import Payments from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { transactionsApi } from '@/lib/api/transactions';

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
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Payments Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the payments page title', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'user@example.com' },
      hasPermission: jest.fn().mockReturnValue(true),
    });

    (transactionsApi.getByUser as jest.Mock).mockResolvedValue({
      data: [],
      status: 200,
    });

    render(<Payments />);

    await waitFor(() => {
      expect(screen.getByText('Pagos y Cuotas')).toBeInTheDocument();
    });
  });

  it('shows permission warning when user lacks access', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'user@example.com' },
      hasPermission: jest.fn().mockReturnValue(false),
    });

    render(<Payments />);

    await waitFor(() => {
      expect(
        screen.getByText('No tienes permisos para consultar tus pagos.')
      ).toBeInTheDocument();
    });

    expect(transactionsApi.getByUser).not.toHaveBeenCalled();
  });
});
