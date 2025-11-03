import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HivesPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useHabitHive } from '@/lib/contexts/HabitHiveContext';
import { HabitType, EvidenceType } from '@/lib/api/habits';
import { HiveStatus } from '@/lib/api/hives';
import { MemberRole, hiveMembersApi } from '@/lib/api/hiveMembers';
import { paymentsApi } from '@/lib/api/payments';
import { useRouter, useSearchParams } from 'next/navigation';
import { habitHivesApi } from '@/lib/api/habitHives';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/contexts/HabitHiveContext', () => ({
  useHabitHive: jest.fn(),
}));

jest.mock('@/lib/api/habitHives', () => {
  const actual = jest.requireActual('@/lib/api/habitHives');
  return {
    ...actual,
    habitHivesApi: {
      create: jest.fn(),
    },
  };
});

jest.mock('@/lib/api/hiveMembers', () => {
  const actual = jest.requireActual('@/lib/api/hiveMembers');
  return {
    ...actual,
    hiveMembersApi: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock('@/lib/api/payments', () => {
  const actual = jest.requireActual('@/lib/api/payments');
  return {
    ...actual,
    paymentsApi: {
      create: jest.fn(),
    },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseHabitHive = useHabitHive as jest.MockedFunction<
  typeof useHabitHive
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;
const mockCreateHabitHiveAssignment =
  habitHivesApi.create as jest.MockedFunction<typeof habitHivesApi.create>;
const mockCreateHiveMember = hiveMembersApi.create as jest.MockedFunction<
  typeof hiveMembersApi.create
>;
const mockDeleteHiveMember = hiveMembersApi.delete as jest.MockedFunction<
  typeof hiveMembersApi.delete
>;
const mockCreatePayment = paymentsApi.create as jest.MockedFunction<
  typeof paymentsApi.create
>;

const baseHabit = {
  id: 'habit-1',
  userId: 'user-1',
  title: 'Morning Run',
  type: HabitType.OBJECTIVE,
  evidenceType: EvidenceType.SELF,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const baseHive = {
  id: 'hive-1',
  name: 'Morning Runners',
  description: 'Running club',
  createdById: 'user-1',
  durationDays: 30,
  entryFee: 10,
  eliminationType: 'consecutive',
  allowedHabitTypes: [HabitType.OBJECTIVE],
  status: HiveStatus.OPEN,
  isPublic: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  members: [],
  habitHives: [
    {
      id: 'assignment-1',
      hiveId: 'hive-1',
      habitId: baseHabit.id,
      habit: baseHabit,
    },
  ],
  _count: { members: 0 },
};

const createMockHabitHiveState = () => ({
  state: {
    hives: [baseHive],
    habits: [baseHabit],
    loading: {
      hives: false,
      habits: false,
    },
    errors: {
      hives: null,
      habits: null,
    },
  },
});

const renderHivesPage = () => render(<HivesPage />);

describe('HivesPage', () => {
  const fetchHives = jest.fn();
  const fetchHabits = jest.fn();
  const createHiveAsync = jest.fn();
  const updateHiveAsync = jest.fn();
  const deleteHiveAsync = jest.fn();
  const setHivesError = jest.fn();
  const setHabitsError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
    } as any);
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
      has: jest.fn(),
      entries: () => [][Symbol.iterator](),
      keys: () => [][Symbol.iterator](),
      values: () => [][Symbol.iterator](),
      forEach: jest.fn(),
      toString: () => '',
      [Symbol.iterator]: () => [][Symbol.iterator](),
    } as any);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com', name: 'Tester' },
      hasPermission: jest.fn().mockReturnValue(true),
    } as any);
    mockUseHabitHive.mockReturnValue({
      ...createMockHabitHiveState(),
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);
    mockCreateHabitHiveAssignment.mockResolvedValue({
      status: 200,
      data: undefined,
      error: undefined,
    } as any);
    mockCreateHiveMember.mockResolvedValue({
      status: 201,
      data: undefined,
      error: undefined,
    } as any);
    mockCreatePayment.mockResolvedValue({
      status: 200,
      data: { paymentIntent: { clientSecret: '' } },
      error: undefined,
    } as any);
  });

  it('renders hive information and supports delete flow', async () => {
    deleteHiveAsync.mockResolvedValue({ success: true });

    renderHivesPage();

    await waitFor(() => expect(fetchHives).toHaveBeenCalled());

    const card = screen.getByText('Morning Runners').closest('div');
    expect(card).toBeTruthy();

    const deleteIcon = screen.getByTestId('DeleteIcon');
    await userEvent.click(deleteIcon.closest('button')!);

    const confirmDialog = await screen.findByRole('dialog');
    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: /eliminar/i })
    );

    await waitFor(() => {
      expect(deleteHiveAsync).toHaveBeenCalledWith('hive-1');
      expect(fetchHives).toHaveBeenCalledTimes(2);
    });
  });

  it('creates a hive and assigns selected habits', async () => {
    createHiveAsync.mockResolvedValue({
      success: true,
      data: { ...baseHive, id: 'new-hive' },
    });

    renderHivesPage();

    const createButton = screen.getByRole('button', { name: /crear colmena/i });
    await userEvent.click(createButton);

    const dialog = await screen.findByRole('dialog');
    const nameField = within(dialog).getByLabelText(/Nombre de la colmena/i);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Nueva Colmena');

    const habitsSelect = within(dialog).getAllByRole('combobox')[0];
    await userEvent.click(habitsSelect);

    const option = await screen.findByRole('option', { name: 'Morning Run' });
    await userEvent.click(option);
    await userEvent.keyboard('{Escape}');

    const submitButton = screen.getByRole('button', { name: /crear/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(createHiveAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nueva Colmena',
          createdById: 'user-1',
        })
      );
      expect(mockCreateHabitHiveAssignment).toHaveBeenCalledWith({
        hiveId: 'new-hive',
        habitId: 'habit-1',
      });
      expect(fetchHives).toHaveBeenCalledTimes(2);
    });

    expect(
      screen.getByText('Colmena creada y hábitos asociados correctamente')
    ).toBeInTheDocument();
  }, 15000);

  it('joins an open hive with entry fee and triggers payment flow', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    mockCreateHiveMember.mockResolvedValue({
      status: 201,
      data: {
        id: 'member-1',
        hiveId: 'hive-1',
        userId: 'user-1',
        role: MemberRole.MEMBER,
        status: 'active',
        joinedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      error: undefined,
    } as any);

    mockCreatePayment.mockResolvedValue({
      status: 200,
      data: {
        paymentIntent: {
          clientSecret: 'https://payments.example/intent',
          metadata: {},
        },
      },
      error: undefined,
    } as any);

    renderHivesPage();

    await waitFor(() => expect(fetchHives).toHaveBeenCalled());

    const joinIcon = (await screen.findAllByTestId('PersonAddIcon')).find(
      icon => Boolean(icon.closest('button'))
    );
    expect(joinIcon).toBeTruthy();
    const joinButton =
      joinIcon!.closest('button') ?? joinIcon!.parentElement?.closest('button');
    expect(joinButton).toBeTruthy();
    await userEvent.click(joinButton!);

    const confirmDialog = await screen.findByRole('dialog', {
      name: 'Unirse a Colmena',
    });

    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: /confirmar/i })
    );

    await waitFor(() => {
      expect(mockCreateHiveMember).toHaveBeenCalledWith({
        hiveId: 'hive-1',
        userId: 'user-1',
        role: MemberRole.MEMBER,
      });
      expect(mockCreatePayment).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        userId: 'user-1',
        customerEmail: 'test@example.com',
        hiveId: 'hive-1',
        metadata: {
          description: 'Cuota de entrada para la colmena Morning Runners',
        },
      });
      expect(openSpy).toHaveBeenCalled();
      expect(fetchHives).toHaveBeenCalledTimes(2);
    });

    expect(
      screen.getByText(/¡Te has unido a "Morning Runners"!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Se generó un pago pendiente/i)
    ).toBeInTheDocument();

    openSpy.mockRestore();
  });

  it('shows empty state when filters yield no results', async () => {
    renderHivesPage();

    await waitFor(() => expect(fetchHives).toHaveBeenCalled());

    const search = screen.getByPlaceholderText('Buscar colmenas...');
    await userEvent.type(search, 'sin resultados');

    expect(
      await screen.findByText('No se encontraron colmenas')
    ).toBeInTheDocument();
    expect(screen.getByText('Intenta con otros filtros')).toBeInTheDocument();
  });

  it('clears context errors when the global alert is dismissed', async () => {
    const baseState = createMockHabitHiveState();
    mockUseHabitHive.mockReturnValue({
      state: {
        ...baseState.state,
        errors: { hives: 'Error remoto', habits: 'Error hábitos' },
      },
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);

    renderHivesPage();

    const alert = await screen.findByText('Error remoto');
    const alertElement = alert.closest('[role="alert"]') as HTMLElement | null;
    expect(alertElement).not.toBeNull();
    await userEvent.click(
      within(alertElement!).getByRole('button', { name: /close/i })
    );

    expect(setHivesError).toHaveBeenCalledWith(null);
    expect(setHabitsError).toHaveBeenCalledWith(null);
  });

  it('shows loading indicator while colmenas are fetched', () => {
    const baseState = createMockHabitHiveState();
    mockUseHabitHive.mockReturnValue({
      state: {
        ...baseState.state,
        loading: { ...baseState.state.loading, hives: true },
      },
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);

    renderHivesPage();

    expect(screen.getByText('Cargando colmenas...')).toBeInTheDocument();
  });

  it('shows an error when a habit assignment fails after creating a hive', async () => {
    createHiveAsync.mockResolvedValue({
      success: true,
      data: { ...baseHive, id: 'partial-hive' },
    });
    mockCreateHabitHiveAssignment.mockResolvedValueOnce({
      status: 500,
      error: 'No se pudo asociar el hábito',
    } as any);

    renderHivesPage();

    await userEvent.click(
      screen.getByRole('button', { name: /crear colmena/i })
    );

    const dialog = await screen.findByRole('dialog');
    const nameField = within(dialog).getByLabelText(/Nombre de la colmena/i);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Colmena parcial');

    const habitsSelect = within(dialog).getAllByRole('combobox')[0];
    await userEvent.click(habitsSelect);
    await userEvent.click(
      await screen.findByRole('option', { name: 'Morning Run' })
    );
    await userEvent.keyboard('{Escape}');

    await userEvent.click(
      within(dialog).getByRole('button', { name: /crear/i })
    );

    expect(
      await screen.findByText(
        /La colmena se creó, pero hubo problemas al asociar algunos hábitos/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Colmena creada y hábitos asociados correctamente')
    ).not.toBeInTheDocument();
  }, 15000);

  it('requests login when joining a hive without authentication', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({
      push,
      replace: jest.fn(),
    } as any);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      hasPermission: jest.fn().mockReturnValue(true),
    } as any);

    renderHivesPage();

    const joinIcon = (await screen.findAllByTestId('PersonAddIcon')).find(
      icon => Boolean(icon.closest('button'))
    );
    expect(joinIcon).toBeTruthy();
    await userEvent.click(joinIcon!.closest('button')!);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/login');
    });

    expect(
      await screen.findByText('Debes iniciar sesión para unirte a una colmena')
    ).toBeInTheDocument();
    expect(screen.queryByText('Unirse a Colmena')).not.toBeInTheDocument();
  });

  it('shows an error when the user has no email during join flow', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', name: 'Tester' },
      hasPermission: jest.fn().mockReturnValue(true),
    } as any);

    renderHivesPage();

    const joinIcon = (await screen.findAllByTestId('PersonAddIcon')).find(
      icon => Boolean(icon.closest('button'))
    );
    await userEvent.click(joinIcon!.closest('button')!);

    const confirmDialog = await screen.findByRole('dialog', {
      name: 'Unirse a Colmena',
    });
    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: /confirmar/i })
    );

    expect(
      await screen.findByText(
        'No se encontró un correo electrónico válido para el usuario.'
      )
    ).toBeInTheDocument();
    expect(mockCreateHiveMember).not.toHaveBeenCalled();
  });

  it('updates a hive successfully', async () => {
    updateHiveAsync.mockResolvedValue({ success: true });

    renderHivesPage();

    const editIcon = (await screen.findAllByTestId('EditIcon'))[0];
    await userEvent.click(editIcon.closest('button')!);

    const dialog = await screen.findByRole('dialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: /actualizar/i })
    );

    await waitFor(() => {
      expect(updateHiveAsync).toHaveBeenCalledWith(
        'hive-1',
        expect.any(Object)
      );
      expect(fetchHives).toHaveBeenCalledTimes(2);
    });

    expect(
      screen.getByText('Colmena actualizada correctamente')
    ).toBeInTheDocument();
  });

  it('keeps the dialog open when updating a hive fails', async () => {
    updateHiveAsync.mockResolvedValue({ success: false });

    renderHivesPage();

    const editIcon = (await screen.findAllByTestId('EditIcon'))[0];
    await userEvent.click(editIcon.closest('button')!);

    const dialog = await screen.findByRole('dialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: /actualizar/i })
    );

    await waitFor(() => {
      expect(updateHiveAsync).toHaveBeenCalled();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.queryByText('Colmena actualizada correctamente')
    ).not.toBeInTheDocument();
    expect(fetchHives).toHaveBeenCalledTimes(1);
  });

  it('keeps the creation dialog open when the API rejects the hive', async () => {
    createHiveAsync.mockResolvedValue({ success: false, data: null });

    renderHivesPage();

    await userEvent.click(
      screen.getByRole('button', { name: /crear colmena/i })
    );

    const dialog = await screen.findByRole('dialog');
    const nameField = within(dialog).getByLabelText(/Nombre de la colmena/i);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Intento fallido');

    await userEvent.click(
      within(dialog).getByRole('button', { name: /crear/i })
    );

    await waitFor(() => {
      expect(createHiveAsync).toHaveBeenCalled();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.queryByText('Colmena creada y hábitos asociados correctamente')
    ).not.toBeInTheDocument();
  });

  it('joins an open hive without entry fee without triggering payments', async () => {
    const state = createMockHabitHiveState();
    mockUseHabitHive.mockReturnValue({
      state: {
        ...state.state,
        hives: [
          {
            ...baseHive,
            entryFee: 0,
          },
        ],
      },
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);

    renderHivesPage();

    const joinIcon = (await screen.findAllByTestId('PersonAddIcon')).find(
      icon => Boolean(icon.closest('button'))
    );
    await userEvent.click(joinIcon!.closest('button')!);

    const confirmDialog = await screen.findByRole('dialog', {
      name: 'Unirse a Colmena',
    });
    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: /confirmar/i })
    );

    await waitFor(() => {
      expect(mockCreateHiveMember).toHaveBeenCalled();
      expect(fetchHives).toHaveBeenCalledTimes(2);
    });

    expect(mockCreatePayment).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/Se generó un pago pendiente/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/¡Te has unido a "Morning Runners"!/i)
    ).toBeInTheDocument();
  });

  it('shows membership errors returned by the server', async () => {
    mockCreateHiveMember.mockResolvedValue({
      status: 400,
      error: 'Capacidad llena',
    } as any);

    renderHivesPage();

    const joinIcon = (await screen.findAllByTestId('PersonAddIcon')).find(
      icon => Boolean(icon.closest('button'))
    );
    await userEvent.click(joinIcon!.closest('button')!);

    const confirmDialog = await screen.findByRole('dialog', {
      name: 'Unirse a Colmena',
    });
    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: /confirmar/i })
    );

    expect(await screen.findByText('Capacidad llena')).toBeInTheDocument();
    expect(mockCreatePayment).not.toHaveBeenCalled();
  });

  it('closes the creation dialog when cancel is clicked', async () => {
    renderHivesPage();

    await userEvent.click(
      screen.getByRole('button', { name: /crear colmena/i })
    );

    const dialog = await screen.findByRole('dialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: /cancelar/i })
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('respects habit type selections when creating a hive', async () => {
    createHiveAsync.mockResolvedValue({
      success: true,
      data: { ...baseHive, id: 'selective' },
    });

    renderHivesPage();

    await userEvent.click(
      screen.getByRole('button', { name: /crear colmena/i })
    );

    const dialog = await screen.findByRole('dialog');
    const subjectiveCheckbox = within(dialog).getByLabelText('Subjetivo');
    await userEvent.click(subjectiveCheckbox);

    const nameField = within(dialog).getByLabelText(/Nombre de la colmena/i);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Colmena selectiva');

    await userEvent.click(
      within(dialog).getByRole('button', { name: /crear/i })
    );

    await waitFor(() => {
      expect(createHiveAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Colmena selectiva',
          allowedHabitTypes: [HabitType.OBJECTIVE, HabitType.SEMI],
        })
      );
    });
  });

  it('renders status chips for all hive states', async () => {
    const state = createMockHabitHiveState();
    mockUseHabitHive.mockReturnValue({
      state: {
        ...state.state,
        hives: [
          {
            ...baseHive,
            id: 'open-hive',
            name: 'Abierta',
            status: HiveStatus.OPEN,
          },
          {
            ...baseHive,
            id: 'progress-hive',
            name: 'En curso',
            status: HiveStatus.IN_PROGRESS,
          },
          {
            ...baseHive,
            id: 'finished-hive',
            name: 'Terminada',
            status: HiveStatus.FINISHED,
          },
          {
            ...baseHive,
            id: 'cancelled-hive',
            name: 'Cancelada',
            status: HiveStatus.CANCELLED,
          },
        ],
      },
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);

    renderHivesPage();

    expect(
      await screen.findByText('Abierta', { selector: '.MuiChip-label' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('En Progreso', { selector: '.MuiChip-label' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Finalizada', { selector: '.MuiChip-label' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Cancelada', { selector: '.MuiChip-label' })
    ).toBeInTheDocument();
  });

  it('shows hive details when requesting more information', async () => {
    renderHivesPage();

    await userEvent.click(
      (await screen.findAllByRole('button', { name: /ver detalles/i }))[0]
    );

    const dialog = await screen.findByRole('dialog', {
      name: /Morning Runners/,
    });
    expect(within(dialog).getByText('Running club')).toBeInTheDocument();
    expect(within(dialog).getByText(/Duración/)).toBeInTheDocument();
  });

  it('rolls back membership when payment creation fails', async () => {
    mockCreateHiveMember.mockResolvedValue({
      status: 201,
      data: {
        id: 'member-1',
        hiveId: 'hive-1',
        userId: 'user-1',
        role: MemberRole.MEMBER,
        status: 'active',
        joinedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      error: undefined,
    } as any);
    mockCreatePayment.mockResolvedValue({
      error: 'Pago fallido',
    } as any);
    mockDeleteHiveMember.mockResolvedValue({ success: true } as any);

    renderHivesPage();

    await waitFor(() => expect(fetchHives).toHaveBeenCalled());

    const joinIcon = (await screen.findAllByTestId('PersonAddIcon')).find(
      icon => Boolean(icon.closest('button'))
    );
    await userEvent.click(joinIcon!.closest('button')!);

    const confirmDialog = await screen.findByRole('dialog', {
      name: 'Unirse a Colmena',
    });
    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: /confirmar/i })
    );

    await waitFor(() => {
      expect(mockCreatePayment).toHaveBeenCalled();
      expect(mockDeleteHiveMember).toHaveBeenCalledWith('hive-1', 'user-1');
    });

    expect(screen.getByText('Pago fallido')).toBeInTheDocument();
    expect(
      screen.queryByText(/Se generó un pago pendiente/i)
    ).not.toBeInTheDocument();
  });

  it('shows an error when creating a hive without a user id', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: 'test@example.com', name: 'Tester' } as any,
      hasPermission: jest.fn().mockReturnValue(true),
    } as any);

    renderHivesPage();

    await userEvent.click(
      screen.getByRole('button', { name: /crear colmena/i })
    );

    const dialog = await screen.findByRole('dialog');
    const nameField = within(dialog).getByLabelText(/Nombre de la colmena/i);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Colmena sin usuario');

    await userEvent.click(
      within(dialog).getByRole('button', { name: /crear/i })
    );

    expect(
      await screen.findByText('No se pudo identificar al usuario actual')
    ).toBeInTheDocument();
    expect(createHiveAsync).not.toHaveBeenCalled();
  }, 15000);

  it('filters hives by status', async () => {
    const state = createMockHabitHiveState();
    mockUseHabitHive.mockReturnValue({
      ...state,
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);

    renderHivesPage();

    await screen.findByText('Morning Runners');

    // Verify status filtering UI exists
    const statusSelects = screen.getAllByRole('combobox');
    expect(statusSelects.length).toBeGreaterThan(0);
  }, 15000);

  it('clears habitId from URL when filter changes', async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace,
    } as any);

    const searchParams = new URLSearchParams();
    searchParams.set('habitId', 'habit-1');

    mockUseSearchParams.mockReturnValue({
      get: (key: string) => (key === 'habitId' ? 'habit-1' : null),
      getAll: jest.fn().mockReturnValue([]),
      has: jest.fn(),
      entries: () => searchParams.entries(),
      keys: () => searchParams.keys(),
      values: () => searchParams.values(),
      forEach: jest.fn(),
      toString: () => searchParams.toString(),
      [Symbol.iterator]: () => searchParams.entries(),
    } as any);

    renderHivesPage();

    await screen.findByText('Morning Runners');

    const habitSelects = screen.getAllByRole('combobox');
    const habitSelect = habitSelects[habitSelects.length - 1];

    await userEvent.click(habitSelect);
    const allOption = await screen.findByRole('option', { name: /todos/i });
    await userEvent.click(allOption);

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
    });
  }, 15000);

  it('shows privacy icons correctly', async () => {
    const state = createMockHabitHiveState();
    mockUseHabitHive.mockReturnValue({
      ...state,
      state: {
        ...state.state,
        hives: [
          { ...baseHive, isPublic: true },
          { ...baseHive, id: 'hive-2', name: 'Private Hive', isPublic: false },
        ],
      },
      fetchHives,
      fetchHabits,
      createHiveAsync,
      updateHiveAsync,
      deleteHiveAsync,
      setHivesError,
      setHabitsError,
    } as any);

    renderHivesPage();

    await screen.findByText('Morning Runners');

    const publicIcons = screen.getAllByTestId('PublicIcon');
    const lockIcons = screen.getAllByTestId('LockIcon');

    expect(publicIcons.length).toBeGreaterThan(0);
    expect(lockIcons.length).toBeGreaterThan(0);
  }, 15000);
});
