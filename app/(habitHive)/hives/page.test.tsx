import { render, screen, waitFor } from '@testing-library/react';
import HivesPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/hives', () => ({
  hivesApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  HiveStatus: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished',
    CANCELLED: 'cancelled',
  },
}));

jest.mock('@/lib/api/hiveMembers', () => ({
  hiveMembersApi: {
    create: jest.fn(),
  },
  MemberRole: {
    MEMBER: 'member',
    MODERATOR: 'moderator',
    OWNER: 'owner',
  },
}));

jest.mock('@/lib/api/habits', () => ({
  HabitType: {
    OBJECTIVE: 'objective',
    SEMI: 'semi',
    SUBJECTIVE: 'subjective',
  },
}));

jest.mock('@/lib/api/payments', () => ({
  paymentsApi: {
    create: jest.fn(),
  },
}));

import { hivesApi } from '@/lib/api/hives';

describe('HivesPage', () => {
  const mockHives = [
    {
      id: '1',
      name: 'Morning Runners',
      description: 'Running club',
      createdById: 'user1',
      durationDays: 30,
      entryFee: 10,
      eliminationType: 'consecutive',
      allowedHabitTypes: ['objective'],
      status: 'open',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      members: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      hasPermission: jest.fn().mockReturnValue(true),
    });
    (hivesApi.getAll as jest.Mock).mockResolvedValue({
      data: mockHives,
      error: null,
    });
  });

  it('should render hives page title', () => {
    render(<HivesPage />);
    expect(screen.getByText('Colmenas Activas')).toBeDefined();
  });

  it('should fetch hives on mount', async () => {
    render(<HivesPage />);
    await waitFor(() => {
      expect(hivesApi.getAll).toHaveBeenCalled();
    });
  });

  it('should render create button', () => {
    render(<HivesPage />);
    expect(
      screen.getByRole('button', { name: /crear colmena/i })
    ).toBeDefined();
  });
});
