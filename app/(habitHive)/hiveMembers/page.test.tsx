import { render, screen, waitFor } from '@testing-library/react';
import HiveMembersPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/hiveMembers', () => ({
  hiveMembersApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  MemberRole: {
    MEMBER: 'member',
    MODERATOR: 'moderator',
    OWNER: 'owner',
  },
  MemberStatus: {
    ACTIVE: 'active',
    ELIMINATED: 'eliminated',
    LEFT: 'left',
  },
}));

jest.mock('@/lib/api/hives', () => ({
  hivesApi: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/lib/api/users', () => ({
  usersApi: {
    getAll: jest.fn(),
  },
}));

import { hiveMembersApi } from '@/lib/api/hiveMembers';
import { hivesApi } from '@/lib/api/hives';
import { usersApi } from '@/lib/api/users';

describe('HiveMembersPage', () => {
  const mockMembers = [
    {
      id: '1',
      hiveId: 'hive1',
      userId: 'user1',
      role: 'member',
      status: 'active',
      joinedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      user: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@test.com',
      },
      hive: {
        id: 'hive1',
        name: 'Morning Runners',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', name: 'Test User' },
    });
    (hiveMembersApi.getAll as jest.Mock).mockResolvedValue({
      data: mockMembers,
      error: null,
    });
    (hivesApi.getAll as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });
    (usersApi.getAll as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it('should render hive members page title', () => {
    render(<HiveMembersPage />);
    expect(screen.getByText('Miembros de Colmenas')).toBeDefined();
  });

  it('should fetch members on mount', async () => {
    render(<HiveMembersPage />);
    await waitFor(() => {
      expect(hiveMembersApi.getAll).toHaveBeenCalled();
    });
  });

  it('should render add member button', () => {
    render(<HiveMembersPage />);
    expect(
      screen.getByRole('button', { name: /agregar miembro/i })
    ).toBeDefined();
  });
});
