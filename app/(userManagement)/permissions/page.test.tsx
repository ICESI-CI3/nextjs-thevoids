import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Permissions from './page';
import { permissionsApi } from '@/lib/api/permissions';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies
jest.mock('@/lib/api/permissions', () => ({
  permissionsApi: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Permissions Page', () => {
  const mockPermissions = [
    { id: '1', name: 'create_user', description: 'Create users' },
    { id: '2', name: 'delete_user', description: 'Delete users' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });
    (permissionsApi.getAll as jest.Mock).mockResolvedValue({
      data: mockPermissions,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render the permissions page title', () => {
      render(<Permissions />);
      expect(screen.getByText('Permisos')).toBeInTheDocument();
    });

    it('should render refresh button', () => {
      render(<Permissions />);
      expect(
        document.querySelector('svg[data-testid="RefreshIcon"]')
      ).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should fetch permissions on mount', () => {
      render(<Permissions />);
      expect(permissionsApi.getAll).toHaveBeenCalled();
    });

    it('should display permissions in the data grid', async () => {
      render(<Permissions />);

      await waitFor(() => {
        expect(screen.getByText('create_user')).toBeInTheDocument();
        expect(screen.getByText('Create users')).toBeInTheDocument();
        expect(screen.getByText('delete_user')).toBeInTheDocument();
        expect(screen.getByText('Delete users')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      (permissionsApi.getAll as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () => resolve({ data: mockPermissions, error: null }),
              100
            )
          )
      );

      render(<Permissions />);

      const dataGrid = screen.getByRole('grid');
      expect(dataGrid).toBeInTheDocument();
    });

    it('should show error message when fetch fails', async () => {
      (permissionsApi.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to load permissions',
      });

      render(<Permissions />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load permissions')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch permissions when refresh button is clicked', async () => {
      render(<Permissions />);

      await waitFor(() => {
        expect(permissionsApi.getAll).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton!);

      await waitFor(() => {
        expect(permissionsApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Authentication', () => {
    it('should not load data when not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      render(<Permissions />);

      expect(permissionsApi.getAll).not.toHaveBeenCalled();
    });
  });
});
