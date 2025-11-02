import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import RolePermissions from './page';
import { rolePermissionsApi } from '@/lib/api/rolePermissions';
import { rolesApi } from '@/lib/api/roles';
import { permissionsApi } from '@/lib/api/permissions';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies
jest.mock('@/lib/api/rolePermissions', () => ({
  rolePermissionsApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/api/roles', () => ({
  rolesApi: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/lib/api/permissions', () => ({
  permissionsApi: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('RolePermissions Page', () => {
  const mockRolePermissions = [
    {
      id: '1',
      roleId: '1',
      permissionId: '1',
      role: { id: '1', name: 'admin', description: 'Administrator' },
      permission: { id: '1', name: 'create_user', description: 'Create users' },
    },
  ];

  const mockRoles = [
    { id: '1', name: 'admin', description: 'Administrator' },
    { id: '2', name: 'user', description: 'Regular user' },
  ];

  const mockPermissions = [
    { id: '1', name: 'create_user', description: 'Create users' },
    { id: '2', name: 'delete_user', description: 'Delete users' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });
    (rolePermissionsApi.getAll as jest.Mock).mockResolvedValue({
      data: mockRolePermissions,
      error: null,
    });
    (rolesApi.getAll as jest.Mock).mockResolvedValue({
      data: mockRoles,
      error: null,
    });
    (permissionsApi.getAll as jest.Mock).mockResolvedValue({
      data: mockPermissions,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render the role permissions page title', () => {
      render(<RolePermissions />);
      expect(screen.getByText('Permisos de Rol')).toBeInTheDocument();
    });

    it('should render create and refresh buttons', () => {
      render(<RolePermissions />);

      expect(
        screen.getByRole('button', { name: /asignar permiso/i })
      ).toBeInTheDocument();
      expect(
        document.querySelector('svg[data-testid="RefreshIcon"]')
      ).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should fetch all data on mount', () => {
      render(<RolePermissions />);

      expect(rolePermissionsApi.getAll).toHaveBeenCalled();
      expect(rolesApi.getAll).toHaveBeenCalled();
      expect(permissionsApi.getAll).toHaveBeenCalled();
    });

    it('should display role permissions in the data grid', async () => {
      render(<RolePermissions />);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('create_user')).toBeInTheDocument();
      });
    });

    it('should show error message when fetch fails', async () => {
      (rolePermissionsApi.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to load role permissions',
      });

      render(<RolePermissions />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load role permissions')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Create Role Permission', () => {
    it('should open create modal when assign permission button is clicked', async () => {
      render(<RolePermissions />);

      const createButton = screen.getByRole('button', {
        name: /asignar permiso/i,
      });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Asignar Permiso a Rol')).toBeInTheDocument();
      });
    });

    it('should create role permission successfully', async () => {
      (rolePermissionsApi.create as jest.Mock).mockResolvedValue({
        data: {
          id: '3',
          roleId: '1',
          permissionId: '2',
          role: mockRoles[0],
          permission: mockPermissions[1],
        },
        error: null,
      });

      render(<RolePermissions />);

      const createButton = screen.getByRole('button', {
        name: /asignar permiso/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      expect(modalContent.getByText('Rol')).toBeInTheDocument();
      expect(modalContent.getByText('Permiso')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /asignar/i })
      ).toBeInTheDocument();

      const roleInputs = modalContent.getAllByRole('combobox');
      const roleInput = roleInputs[0];

      fireEvent.change(roleInput, { target: { value: 'admin' } });
      fireEvent.keyDown(roleInput, { key: 'ArrowDown' });

      await waitFor(() => {
        const roleOption = screen
          .getAllByText('admin')
          .find(el => el.tagName === 'LI');
        expect(roleOption).toBeInTheDocument();
        fireEvent.click(roleOption!);
      });

      const permissionInput = roleInputs[1];
      fireEvent.change(permissionInput, { target: { value: 'delete' } });
      fireEvent.keyDown(permissionInput, { key: 'ArrowDown' });

      await waitFor(() => {
        const permissionOption = screen
          .getAllByText(/delete_user/i)
          .find(el => el.tagName === 'LI');
        expect(permissionOption).toBeInTheDocument();
        fireEvent.click(permissionOption!);
      });

      const submitButton = screen.getByRole('button', { name: /asignar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(rolePermissionsApi.create).toHaveBeenCalledWith({
          roleId: '1',
          permissionId: '2',
        });
        expect(
          screen.getByText('Permiso asignado al rol correctamente')
        ).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show error when creating role permission fails', async () => {
      (rolePermissionsApi.create as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to create role permission',
      });

      render(<RolePermissions />);

      const createButton = screen.getByRole('button', {
        name: /asignar permiso/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const roleInputs = modalContent.getAllByRole('combobox');
      const roleInput = roleInputs[0];
      fireEvent.change(roleInput, { target: { value: 'admin' } });
      fireEvent.keyDown(roleInput, { key: 'ArrowDown' });

      await waitFor(() => {
        const roleOption = screen
          .getAllByText('admin')
          .find(el => el.tagName === 'LI');
        fireEvent.click(roleOption!);
      });

      const permissionInput = roleInputs[1];
      fireEvent.change(permissionInput, { target: { value: 'delete' } });
      fireEvent.keyDown(permissionInput, { key: 'ArrowDown' });

      await waitFor(() => {
        const permissionOption = screen
          .getAllByText(/delete_user/i)
          .find(el => el.tagName === 'LI');
        fireEvent.click(permissionOption!);
      });

      const submitButton = screen.getByRole('button', { name: /asignar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to create role permission')
        ).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should show validation error when no role or permission selected', async () => {
      render(<RolePermissions />);

      const createButton = screen.getByRole('button', {
        name: /asignar permiso/i,
      });
      fireEvent.click(createButton);

      await screen.findByText('Asignar Permiso a Rol');

      const submitButton = screen.getByRole('button', { name: /asignar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Debe seleccionar un rol y un permiso')
        ).toBeInTheDocument();
      });
    });

    it('should close create modal when cancel button is clicked', async () => {
      render(<RolePermissions />);

      const createButton = screen.getByRole('button', {
        name: /asignar permiso/i,
      });
      fireEvent.click(createButton);

      await screen.findByText('Asignar Permiso a Rol');

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch all data when refresh button is clicked', async () => {
      render(<RolePermissions />);

      await waitFor(() => {
        expect(rolePermissionsApi.getAll).toHaveBeenCalledTimes(1);
        expect(rolesApi.getAll).toHaveBeenCalledTimes(1);
        expect(permissionsApi.getAll).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton!);

      await waitFor(() => {
        expect(rolePermissionsApi.getAll).toHaveBeenCalledTimes(2);
        expect(rolesApi.getAll).toHaveBeenCalledTimes(2);
        expect(permissionsApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Authentication', () => {
    it('should not load data when not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      render(<RolePermissions />);

      expect(rolePermissionsApi.getAll).not.toHaveBeenCalled();
      expect(rolesApi.getAll).not.toHaveBeenCalled();
      expect(permissionsApi.getAll).not.toHaveBeenCalled();
    });
  });

  describe('Delete Role Permission', () => {
    it('should open delete confirmation dialog when delete button is clicked', async () => {
      render(<RolePermissions />);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      const deleteButton = document
        .querySelector('svg[data-testid="DeleteIcon"]')
        ?.closest('button');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);

      const dialog = await screen.findByRole('dialog');
      const dialogContent = within(dialog);

      expect(
        dialogContent.getByText('Eliminar Asignación de Permiso')
      ).toBeInTheDocument();
      expect(
        dialogContent.getByText(/¿Está seguro de eliminar el permiso/i)
      ).toBeInTheDocument();
      expect(dialogContent.getByText(/create_user/i)).toBeInTheDocument();
    });

    it('should delete role permission successfully', async () => {
      (rolePermissionsApi.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      render(<RolePermissions />);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      const deleteButton = document
        .querySelector('svg[data-testid="DeleteIcon"]')
        ?.closest('button');
      fireEvent.click(deleteButton!);

      await screen.findByText('Eliminar Asignación de Permiso');
      const confirmDeleteButton = screen.getByRole('button', {
        name: /eliminar/i,
      });
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(rolePermissionsApi.delete).toHaveBeenCalledWith('1', '1');
        expect(
          screen.getByText('Permiso de rol eliminado correctamente')
        ).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show error when deleting role permission fails', async () => {
      (rolePermissionsApi.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to delete role permission',
      });

      render(<RolePermissions />);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      const deleteButton = document
        .querySelector('svg[data-testid="DeleteIcon"]')
        ?.closest('button');
      fireEvent.click(deleteButton!);

      await screen.findByText('Eliminar Asignación de Permiso');
      const confirmDeleteButton = screen.getByRole('button', {
        name: /eliminar/i,
      });
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to delete role permission')
        ).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close delete dialog when cancel button is clicked', async () => {
      render(<RolePermissions />);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      const deleteButton = document
        .querySelector('svg[data-testid="DeleteIcon"]')
        ?.closest('button');
      fireEvent.click(deleteButton!);

      await screen.findByText('Eliminar Asignación de Permiso');

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
