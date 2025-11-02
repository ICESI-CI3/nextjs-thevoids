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
  const mockRoles = [
    { id: '1', name: 'admin', description: 'Administrator role' },
    { id: '2', name: 'user', description: 'Regular user role' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });
    (rolesApi.getAll as jest.Mock).mockResolvedValue({
      data: mockRoles,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render the roles page title', () => {
      render(<Roles />);
      expect(screen.getByText('Roles')).toBeInTheDocument();
    });

    it('should render create and refresh buttons', () => {
      render(<Roles />);

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
      render(<Roles />);
      expect(rolesApi.getAll).toHaveBeenCalled();
    });

    it('should display roles in the data grid', async () => {
      render(<Roles />);

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

      render(<Roles />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load roles')).toBeInTheDocument();
      });
    });
  });

  describe('Create Role', () => {
    it('should open create modal when new role button is clicked', async () => {
      render(<Roles />);

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

      render(<Roles />);

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

      expect(rolesApi.getAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch roles when refresh button is clicked', async () => {
      render(<Roles />);

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
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      render(<Roles />);

      expect(rolesApi.getAll).not.toHaveBeenCalled();
    });
  });
});
