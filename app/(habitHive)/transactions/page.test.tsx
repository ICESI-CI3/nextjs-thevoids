import { render, screen, waitFor } from '@testing-library/react';
import TransactionsPage from './page';
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

describe('Transactions Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the transactions page title', async () => {
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

    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Transacciones')).toBeInTheDocument();
    });
  });

  it('requests transactions for the user when permitted', async () => {
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

    render(<TransactionsPage />);

    await waitFor(() => {
      expect(transactionsApi.getByUser).toHaveBeenCalledWith('user-1');
    });
  });
});
