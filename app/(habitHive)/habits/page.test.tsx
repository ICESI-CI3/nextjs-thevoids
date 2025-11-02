import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

import HabitsPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { HabitType, EvidenceType } from '@/lib/api/habits';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/habits', () => ({
  habitsApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  HabitType: {
    OBJECTIVE: 'objective',
    SEMI: 'semi',
    SUBJECTIVE: 'subjective',
  },
  EvidenceType: {
    API: 'api',
    PHOTO: 'photo',
    SELF: 'self',
    WITNESS: 'witness',
  },
}));

import { habitsApi } from '@/lib/api/habits';

describe('HabitsPage', () => {
  const mockHabits = [
    {
      id: '1',
      userId: 'user1',
      title: 'Morning Run',
      type: HabitType.OBJECTIVE,
      frequency: 'daily',
      evidenceType: EvidenceType.PHOTO,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      user: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@test.com',
      },
    },
    {
      id: '2',
      userId: 'user2',
      title: 'Read Book',
      type: HabitType.SEMI,
      frequency: 'weekly',
      evidenceType: EvidenceType.SELF,
      isActive: false,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      user: {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@test.com',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', name: 'Test User' },
    });
    (habitsApi.getAll as jest.Mock).mockResolvedValue({
      data: mockHabits,
      error: null,
    });
    (habitsApi.create as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
    (habitsApi.update as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
    (habitsApi.delete as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render habits page title', () => {
      render(<HabitsPage />);

      expect(screen.getByText('Descubre Hábitos')).toBeInTheDocument();
    });

    it('should render habits cards with data', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText('Morning Run')).toBeInTheDocument();
        expect(screen.getByText('Read Book')).toBeInTheDocument();
      });
    });

    it('should render create habit button', () => {
      render(<HabitsPage />);

      expect(
        screen.getByRole('button', { name: /crear hábito/i })
      ).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<HabitsPage />);

      expect(
        screen.getByPlaceholderText('Buscar hábitos...')
      ).toBeInTheDocument();
    });

    it('should show error message when fetch fails', async () => {
      (habitsApi.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to fetch habits',
      });

      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch habits')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter habits by search term', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText('Morning Run')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar hábitos...');
      fireEvent.change(searchInput, { target: { value: 'Morning' } });

      await waitFor(() => {
        expect(screen.getByText('Morning Run')).toBeInTheDocument();
        expect(screen.queryByText('Read Book')).not.toBeInTheDocument();
      });
    });

    it('should filter habits by type', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText('Morning Run')).toBeInTheDocument();
      });

      const typeSelect = screen.getByLabelText('Tipo');
      fireEvent.mouseDown(typeSelect);

      const listbox = within(screen.getByRole('listbox'));
      fireEvent.click(listbox.getByText('Objetivo'));

      await waitFor(() => {
        expect(screen.getByText('Morning Run')).toBeInTheDocument();
        expect(screen.queryByText('Read Book')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create Habit', () => {
    it('should open create modal when create button is clicked', () => {
      render(<HabitsPage />);

      const createButton = screen.getByRole('button', {
        name: /crear hábito/i,
      });
      fireEvent.click(createButton);

      expect(screen.getByText('Crear Nuevo Hábito')).toBeInTheDocument();
    });

    it('should call createHabit with form data', async () => {
      (habitsApi.create as jest.Mock).mockResolvedValue({
        data: { id: '3' },
        error: null,
      });

      render(<HabitsPage />);

      const createButton = screen.getByRole('button', {
        name: /crear hábito/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const titleInput = modalContent.getByLabelText(/título del hábito/i);
      const submitButton = screen.getByRole('button', { name: /^crear$/i });

      fireEvent.change(titleInput, { target: { value: 'New Habit' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(habitsApi.create).toHaveBeenCalled();
      });
    });

    it('should show success message after creation', async () => {
      (habitsApi.create as jest.Mock).mockResolvedValue({
        data: { id: '3' },
        error: null,
      });

      render(<HabitsPage />);

      const createButton = screen.getByRole('button', {
        name: /crear hábito/i,
      });
      fireEvent.click(createButton);

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const titleInput = modalContent.getByLabelText(/título del hábito/i);
      const submitButton = screen.getByRole('button', { name: /^crear$/i });

      fireEvent.change(titleInput, { target: { value: 'New Habit' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Hábito creado correctamente')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edit Habit', () => {
    it('should open edit modal when edit button is clicked', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        const editIcons = screen.getAllByTestId('EditIcon');
        const editButton = editIcons[0].closest('button');
        fireEvent.click(editButton!);
      });

      expect(screen.getByText('Editar Hábito')).toBeInTheDocument();
    });

    it('should populate form with habit data when editing', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        const editIcons = screen.getAllByTestId('EditIcon');
        const editButton = editIcons[0].closest('button');
        fireEvent.click(editButton!);
      });

      const modal = await screen.findByRole('dialog');
      const modalContent = within(modal);

      const titleInput = modalContent.getByLabelText(/título del hábito/i);
      expect(titleInput).toHaveValue('Morning Run');
    });
  });

  describe('Delete Habit', () => {
    it('should show delete confirmation dialog', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        const deleteIcons = screen.getAllByTestId('DeleteIcon');
        const deleteButton = deleteIcons[0].closest('button');
        fireEvent.click(deleteButton!);
      });

      expect(screen.getByText('Eliminar Hábito')).toBeInTheDocument();
    });

    it('should call deleteHabit when confirmed', async () => {
      (habitsApi.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      render(<HabitsPage />);

      await waitFor(() => {
        const deleteIcons = screen.getAllByTestId('DeleteIcon');
        const deleteButton = deleteIcons[0].closest('button');
        fireEvent.click(deleteButton!);
      });

      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(habitsApi.delete).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Data fetching', () => {
    it('should fetch habits on mount', () => {
      render(<HabitsPage />);

      expect(habitsApi.getAll).toHaveBeenCalled();
    });

    it('should refetch habits when refresh button is clicked', async () => {
      render(<HabitsPage />);

      const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
      fireEvent.click(refreshButton!);

      await waitFor(() => {
        expect(habitsApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });
});
