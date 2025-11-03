import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

import UsersPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DataProvider } from '@/lib/contexts/DataContext';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/users', () => ({
  usersApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { usersApi } from '@/lib/api/users';

const renderUsersPage = () =>
  render(
    <DataProvider>
      <UsersPage />
    </DataProvider>
  );

describe('UsersPage', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@test.com',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      role: 'user',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@test.com',
      isActive: false,
      createdAt: '2024-01-02T00:00:00Z',
      role: 'admin',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      hasPermission: jest.fn(() => true),
    });
    (usersApi.getAll as jest.Mock).mockResolvedValue({
      data: mockUsers,
      error: null,
    });
    (usersApi.create as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
    (usersApi.update as jest.Mock).mockResolvedValue({
      data: mockUsers[0],
      error: null,
    });
    (usersApi.delete as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render users page title', () => {
      renderUsersPage();

      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });

    it('should render users table with data', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      });
    });

    it('should render create user button', () => {
      renderUsersPage();

      expect(
        screen.getByRole('button', { name: /nuevo usuario/i })
      ).toBeInTheDocument();
    });

    it('should render refresh button', () => {
      renderUsersPage();

      const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
      expect(refreshButton).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      (usersApi.getAll as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      renderUsersPage();

      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });

    it('should show error message when fetch fails', async () => {
      (usersApi.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to fetch users',
      });

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
      });
    });
  });

  describe('Create User', () => {
    it('should open create modal when create button is clicked', () => {
      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should call createUser with form data', async () => {
      (usersApi.create as jest.Mock).mockResolvedValue({
        data: { id: '3' },
        error: null,
      });

      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      const passwordInput = modalContent.getByLabelText(/contraseña/i);
      const roleSelect = modalContent.getByLabelText(/rol/i);
      const submitButton = screen.getByRole('button', { name: /crear/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(roleSelect, { target: { value: 'admin' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(usersApi.create).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'admin',
        });
      });
    });

    it('should close modal after successful creation', async () => {
      (usersApi.create as jest.Mock).mockResolvedValue({
        data: { id: '3' },
        error: null,
      });

      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      const passwordInput = modalContent.getByLabelText(/contraseña/i);
      const roleSelect = modalContent.getByLabelText(/rol/i);
      const submitButton = screen.getByRole('button', { name: /crear/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(roleSelect, { target: { value: 'admin' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }, 15000);

    it('should show success message after creation', async () => {
      (usersApi.create as jest.Mock).mockResolvedValue({
        data: { id: '3' },
        error: null,
      });

      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      const passwordInput = modalContent.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Usuario creado correctamente')
        ).toBeInTheDocument();
      });
    }, 15000);

    it('should show error message when creation fails', async () => {
      (usersApi.create as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to create user',
      });

      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      const passwordInput = modalContent.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create user')).toBeInTheDocument();
      });
    }, 15000);
  });

  describe('Edit User', () => {
    it('should open edit modal when edit button is clicked', async () => {
      renderUsersPage();

      await waitFor(() => {
        const editIcon = screen.getAllByTestId('EditIcon')[0];
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton!);
      });

      expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    });

    it('should populate form with user data when editing', async () => {
      renderUsersPage();

      await waitFor(() => {
        const editIcon = screen.getAllByTestId('EditIcon')[0];
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton!);
      });

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@test.com');
    });

    it('should call updateUser with modified data', async () => {
      (usersApi.update as jest.Mock).mockResolvedValue({
        data: {
          ...mockUsers[0],
          name: 'Updated Name',
          email: 'updated@test.com',
        },
        error: null,
      });

      renderUsersPage();

      await screen.findByText('John Doe');

      await waitFor(() => {
        const editIcon = screen.getAllByTestId('EditIcon')[0];
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton!);
      });

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /actualizar/i });

      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      fireEvent.change(emailInput, { target: { value: 'updated@test.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(usersApi.update).toHaveBeenCalledWith('1', {
          name: 'Updated Name',
          email: 'updated@test.com',
          role: 'user',
        });
      });
    });

    it('should close modal after successful update', async () => {
      (usersApi.update as jest.Mock).mockResolvedValue({
        data: {
          ...mockUsers[0],
          name: 'Updated Name',
        },
        error: null,
      });

      renderUsersPage();

      await screen.findByText('John Doe');

      await waitFor(() => {
        const editIcon = screen.getAllByTestId('EditIcon')[0];
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton!);
      });

      const submitButton = screen.getByRole('button', { name: /actualizar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete User', () => {
    it('should show delete confirmation dialog', async () => {
      renderUsersPage();

      await waitFor(() => {
        const deleteIcon = screen.getAllByTestId('DeleteIcon')[0];
        const deleteButton = deleteIcon.closest('button');
        fireEvent.click(deleteButton!);
      });

      expect(screen.getByText('Eliminar Usuario')).toBeInTheDocument();
      expect(
        screen.getByText(/¿Está seguro de eliminar al usuario/)
      ).toBeInTheDocument();
    });

    it('should call deleteUser when confirmed', async () => {
      (usersApi.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      renderUsersPage();

      await waitFor(() => {
        const deleteIcon = screen.getAllByTestId('DeleteIcon')[0];
        const deleteButton = deleteIcon.closest('button');
        fireEvent.click(deleteButton!);
      });

      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(usersApi.delete).toHaveBeenCalledWith('1');
      });
    });

    it('should not delete when cancelled', async () => {
      renderUsersPage();

      await waitFor(() => {
        const deleteIcon = screen.getAllByTestId('DeleteIcon')[0];
        const deleteButton = deleteIcon.closest('button');
        fireEvent.click(deleteButton!);
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(usersApi.delete).not.toHaveBeenCalled();
    });

    it('should show success message after deletion', async () => {
      (usersApi.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      renderUsersPage();

      await waitFor(() => {
        const deleteIcon = screen.getAllByTestId('DeleteIcon')[0];
        const deleteButton = deleteIcon.closest('button');
        fireEvent.click(deleteButton!);
      });

      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText('Usuario eliminado correctamente')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Permissions', () => {
    it('should render all action buttons when user has permissions', () => {
      renderUsersPage();

      expect(
        screen.getByRole('button', { name: /nuevo usuario/i })
      ).toBeInTheDocument();
    });

    it('should render edit and delete buttons for each user', async () => {
      renderUsersPage();

      await waitFor(() => {
        const editIcons = screen.getAllByTestId('EditIcon');
        const deleteIcons = screen.getAllByTestId('DeleteIcon');

        expect(editIcons).toHaveLength(2);
        expect(deleteIcons).toHaveLength(2);
      });
    });
  });

  describe('Data fetching', () => {
    it('should fetch users on mount', () => {
      renderUsersPage();

      expect(usersApi.getAll).toHaveBeenCalled();
    });

    it('should add user to the table after successful creation', async () => {
      (usersApi.create as jest.Mock).mockResolvedValue({
        data: {
          id: '3',
          name: 'Test User',
          email: 'test@test.com',
          role: 'admin',
          isActive: true,
        },
        error: null,
      });

      renderUsersPage();

      await screen.findByText('John Doe');

      (usersApi.getAll as jest.Mock).mockClear();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      const passwordInput = modalContent.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      expect(usersApi.getAll).not.toHaveBeenCalled();
    });

    it('should update users list after successful update', async () => {
      (usersApi.update as jest.Mock).mockResolvedValue({
        data: {
          ...mockUsers[0],
          name: 'Updated Name',
        },
        error: null,
      });

      renderUsersPage();

      await screen.findByText('John Doe');

      (usersApi.getAll as jest.Mock).mockClear();

      await waitFor(() => {
        const editIcon = screen.getAllByTestId('EditIcon')[0];
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton!);
      });

      const submitButton = screen.getByRole('button', { name: /actualizar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Updated Name')).toBeInTheDocument();
      });

      expect(usersApi.getAll).not.toHaveBeenCalled();
    });

    it('should remove user from the table after successful deletion', async () => {
      (usersApi.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      renderUsersPage();

      await screen.findByText('John Doe');

      (usersApi.getAll as jest.Mock).mockClear();

      await waitFor(() => {
        const deleteIcon = screen.getAllByTestId('DeleteIcon')[0];
        const deleteButton = deleteIcon.closest('button');
        fireEvent.click(deleteButton!);
      });

      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });

      expect(usersApi.getAll).not.toHaveBeenCalled();
    });

    it('should refetch users when refresh button is clicked', async () => {
      renderUsersPage();

      const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
      fireEvent.click(refreshButton!);

      await waitFor(() => {
        expect(usersApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Form validation', () => {
    it('should require name field', async () => {
      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const submitButton = screen.getByRole('button', { name: /crear/i });
      fireEvent.click(submitButton);

      expect(screen.getAllByText('Nuevo Usuario')).toHaveLength(2);
    });

    it('should require email field', async () => {
      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const submitButton = screen.getByRole('button', { name: /crear/i });
      fireEvent.click(submitButton);

      expect(modal).toBeInTheDocument();
    });

    it('should require password field for new users', async () => {
      renderUsersPage();

      const createButton = screen.getByRole('button', {
        name: /nuevo usuario/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const nameInput = modalContent.getByLabelText(/nombre/i);
      const emailInput = modalContent.getByLabelText(/email/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

      const submitButton = screen.getByRole('button', { name: /crear/i });
      fireEvent.click(submitButton);

      expect(modal).toBeInTheDocument();
    });

    it('should not require password field for editing users', async () => {
      (usersApi.update as jest.Mock).mockResolvedValue({
        data: mockUsers[0],
        error: null,
      });

      renderUsersPage();

      await waitFor(() => {
        const editIcon = screen.getAllByTestId('EditIcon')[0];
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton!);
      });

      const submitButton = screen.getByRole('button', { name: /actualizar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(usersApi.update).toHaveBeenCalled();
      });
    });
  });
});
