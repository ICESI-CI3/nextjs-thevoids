import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

import Roles from './page';
import { rolesApi } from '@/lib/api/roles';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DataProvider } from '@/lib/contexts/DataContext';
jest.mock('@/lib/api/roles', () => ({
  rolesApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Roles Page', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  const mockRoles = [
    { id: '1', name: 'admin', description: 'Administrator role' },
    { id: '2', name: 'user', description: 'Regular user role' },
  ];

  const createMockAuthContext = (
    overrides?: Partial<ReturnType<typeof useAuth>>
  ) => ({
    isAuthenticated: true,
    isLoading: false,
    token: 'mock-token',
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
    },
    permissions: [],
    login: jest.fn(),
    logout: jest.fn(),
    hasPermission: jest.fn().mockReturnValue(true),
    ...overrides,
  });

  const renderRolesPage = () =>
    render(
      <DataProvider>
        <Roles />
      </DataProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(createMockAuthContext());
    (rolesApi.getAll as jest.Mock).mockResolvedValue({
      data: mockRoles,
      error: null,
    });
  });
  describe('Rendering', () => {
    it('should render the roles page title', () => {
      renderRolesPage();
      expect(screen.getByText('Roles')).toBeInTheDocument();
    });

    it('should render create and refresh buttons', () => {
      renderRolesPage();

      expect(
        screen.getByRole('button', { name: /nuevo rol/i })
      ).toBeInTheDocument();

      expect(
        document.querySelector('svg[data-testid="RefreshIcon"]')
      ).toBeInTheDocument();
    });
  });
  describe('Data Loading', () => {
    it('should fetch roles on mount', () => {
      renderRolesPage();
      expect(rolesApi.getAll).toHaveBeenCalled();
    });

    it('should display roles in the data grid', async () => {
      renderRolesPage();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('Administrator role')).toBeInTheDocument();
        expect(screen.getByText('user')).toBeInTheDocument();
        expect(screen.getByText('Regular user role')).toBeInTheDocument();
      });
    });

    it('should show error message when fetch fails', async () => {
      (rolesApi.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to load roles',
      });

      renderRolesPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load roles')).toBeInTheDocument();
      });
    });
  });
  describe('Create Role', () => {
    it('should open create modal when new role button is clicked', async () => {
      renderRolesPage();

      const createButton = screen.getByRole('button', { name: /nuevo rol/i });
      fireEvent.click(createButton);

      expect(
        await screen.findByRole('heading', { name: 'Nuevo Rol' })
      ).toBeInTheDocument();
    });

    it('should create role successfully', async () => {
      (rolesApi.create as jest.Mock).mockResolvedValue({
        data: { id: '3', name: 'moderator', description: 'Moderator role' },
        error: null,
      });

      renderRolesPage();

      const createButton = screen.getByRole('button', { name: /nuevo rol/i });
      fireEvent.click(createButton);

      await screen.findByRole('heading', { name: 'Nuevo Rol' });

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const descriptionInput = modalContent.getByLabelText(/descripción/i);
      const submitButton = screen.getByRole('button', { name: /crear/i });

      fireEvent.change(nameInput, { target: { value: 'moderator' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'Moderator role' },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(rolesApi.create).toHaveBeenCalledWith({
          name: 'moderator',
          description: 'Moderator role',
        });
      });

      expect(
        await screen.findByText('Rol creado correctamente')
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Nuevo Rol' })
        ).not.toBeInTheDocument();
      });

      expect(rolesApi.getAll).toHaveBeenCalledTimes(1);
    });
  });
  describe('Refresh Functionality', () => {
    it('should refetch roles when refresh button is clicked', async () => {
      renderRolesPage();

      await waitFor(() => {
        expect(rolesApi.getAll).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton!);

      await waitFor(() => {
        expect(rolesApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Authentication', () => {
    it('should not load data when not authenticated', () => {
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          isAuthenticated: false,
          token: null,
          user: null,
        })
      );

      renderRolesPage();

      expect(rolesApi.getAll).not.toHaveBeenCalled();
    });
  });
});
