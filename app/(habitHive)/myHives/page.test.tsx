import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyHives from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { hivesApi, HiveStatus } from '@/lib/api/hives';
import {
  hiveMembersApi,
  MemberStatus,
  MemberRole,
} from '@/lib/api/hiveMembers';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/contexts/AuthContext');
jest.mock('@/lib/api/hives');
jest.mock('@/lib/api/hiveMembers');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const createMockAuthContext = (
  overrides?: Partial<ReturnType<typeof useAuth>>
) => ({
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  token: 'mock-token',
  permissions: [],
  login: jest.fn(),
  logout: jest.fn(),
  hasPermission: jest.fn().mockReturnValue(true),
  ...overrides,
});

const mockHive = {
  id: 'hive-1',
  name: 'Test Hive',
  description: 'Test description',
  createdById: 'user-1',
  durationDays: 30,
  entryFee: 10,
  eliminationType: 'consecutive',
  allowedHabitTypes: [],
  status: HiveStatus.IN_PROGRESS,
  isPublic: true,
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  members: [
    {
      id: 'member-1',
      userId: 'user-1',
      role: 'owner',
      status: 'active',
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    },
  ],
  _count: { members: 1 },
};

const mockMembership = {
  id: 'membership-1',
  hiveId: 'hive-1',
  userId: 'user-1',
  role: MemberRole.OWNER,
  status: MemberStatus.ACTIVE,
  joinedAt: '2024-01-01',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('MyHives Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Mis Colmenas')).toBeInTheDocument();
      });
    });

    it('should show statistics cards', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Colmenas Activas')).toBeInTheDocument();
        expect(screen.getByText('En Progreso')).toBeInTheDocument();
        expect(screen.getByText('Completadas')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should redirect to login when not authenticated', () => {
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          isAuthenticated: false,
          user: null,
        })
      );

      render(<MyHives />);

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should wait for auth to load before checking', () => {
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          isAuthenticated: false,
          isLoading: true,
          user: null,
        })
      );

      render(<MyHives />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    it('should load user hives on mount', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(hiveMembersApi.getByUser).toHaveBeenCalledWith('user-1');
      });
    });

    it('should display error when loading fails', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to load memberships',
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load memberships')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Leave Hive', () => {
    it('should open confirmation dialog when abandoning hive', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
      });

      const abandonButton = screen.getByText('Abandonar');
      fireEvent.click(abandonButton);

      await waitFor(() => {
        expect(screen.getByText('Confirmar salida')).toBeInTheDocument();
      });
    });

    it('should successfully leave a hive', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hiveMembersApi.delete as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
      });

      const abandonButton = screen.getByText('Abandonar');
      fireEvent.click(abandonButton);

      await waitFor(() => {
        const confirmButtons = screen.getAllByText('Abandonar');
        const confirmButton = confirmButtons.find(btn =>
          btn.closest('button')?.classList.contains('MuiButton-containedError')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(hiveMembersApi.delete).toHaveBeenCalledWith('hive-1', 'user-1');
      });
    });
  });

  describe('Update Hive Status', () => {
    it('should open status dialog when owner clicks update status', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('Actualizar estado');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Actualizar estado' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Nuevo estado')).toBeInTheDocument();
      });
    });

    it('should successfully update hive status', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.update as jest.Mock).mockResolvedValue({
        data: { ...mockHive, status: HiveStatus.FINISHED },
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('Actualizar estado');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Nuevo estado')).toBeInTheDocument();
      });

      // Select new status
      const statusSelect = screen.getByLabelText('Nuevo estado');
      fireEvent.mouseDown(statusSelect);

      await waitFor(() => {
        const finishedOption = screen.getByText('Finalizada');
        fireEvent.click(finishedOption);
      });

      // Click update button
      const updateButtons = screen.getAllByText('Actualizar');
      const confirmButton = updateButtons.find(btn =>
        btn.closest('button')?.classList.contains('MuiButton-contained')
      );
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(hivesApi.update).toHaveBeenCalledWith('hive-1', {
          status: HiveStatus.FINISHED,
        });
      });
    });

    it('should not show update status button for non-owners', async () => {
      const memberMembership = {
        ...mockMembership,
        role: MemberRole.MEMBER,
      };

      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [memberMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [memberMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
      });

      expect(screen.queryByText('Actualizar estado')).not.toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should switch between active and history tabs', async () => {
      const inactiveMembership = {
        ...mockMembership,
        status: MemberStatus.LEFT,
      };

      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership, inactiveMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText(/Activas \(1\)/)).toBeInTheDocument();
      });

      const historyTab = screen.getByText(/Historial \(1\)/);
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(historyTab.closest('button')).toHaveAttribute(
          'aria-selected',
          'true'
        );
      });
    });
  });

  describe('Member Count', () => {
    it('should display correct member count', async () => {
      const hiveWithMultipleMembers = {
        ...mockHive,
        members: [
          {
            id: 'member-1',
            userId: 'user-1',
            role: 'owner',
            status: 'active',
            user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          },
          {
            id: 'member-2',
            userId: 'user-2',
            role: 'member',
            status: 'active',
            user: { id: 'user-2', name: 'User 2', email: 'user2@example.com' },
          },
          {
            id: 'member-3',
            userId: 'user-3',
            role: 'member',
            status: 'eliminated',
            user: { id: 'user-3', name: 'User 3', email: 'user3@example.com' },
          },
        ],
        _count: { members: 2 },
      };

      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: hiveWithMultipleMembers,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: hiveWithMultipleMembers.members,
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('2 miembros')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh', () => {
    it('should reload data when refresh button is clicked', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(hiveMembersApi.getByUser).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByRole('button', { name: '' });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(hiveMembersApi.getByUser).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Filter by status', () => {
    it('should display hives from membership data', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      const openHive = { ...mockHive, status: HiveStatus.OPEN };
      const inProgressHive = {
        ...mockHive,
        id: 'hive-2',
        name: 'In Progress Hive',
        status: HiveStatus.IN_PROGRESS,
      };

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [
          mockMembership,
          { ...mockMembership, id: 'membership-2', hiveId: 'hive-2' },
        ],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockImplementation(async (id: string) => {
        if (id === 'hive-1') return { data: openHive, error: null };
        if (id === 'hive-2') return { data: inProgressHive, error: null };
        return { data: null, error: 'Not found' };
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
        expect(screen.getByText('In Progress Hive')).toBeInTheDocument();
      });
    });
  });

  describe('Member details dialog', () => {
    it('should display membership information', async () => {
      mockUseAuth.mockReturnValue(createMockAuthContext());

      (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      (hivesApi.getById as jest.Mock).mockResolvedValue({
        data: mockHive,
        error: null,
      });

      (hiveMembersApi.getByHive as jest.Mock).mockResolvedValue({
        data: [mockMembership],
        error: null,
      });

      render(<MyHives />);

      await waitFor(() => {
        expect(screen.getByText('Test Hive')).toBeInTheDocument();
      });
    });
  });
});
