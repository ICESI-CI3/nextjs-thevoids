import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HiveMembersPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useHabitHive } from '@/lib/contexts/HabitHiveContext';
import { useData } from '@/lib/contexts/DataContext';
import { MemberRole, MemberStatus } from '@/lib/api/hiveMembers';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/contexts/HabitHiveContext', () => ({
  useHabitHive: jest.fn(),
}));

jest.mock('@/lib/contexts/DataContext', () => ({
  useData: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseHabitHive = useHabitHive as jest.MockedFunction<
  typeof useHabitHive
>;
const mockUseData = useData as jest.MockedFunction<typeof useData>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const baseMembers = [
  {
    id: 'member-1',
    hiveId: 'hive-1',
    userId: 'user-1',
    role: MemberRole.MEMBER,
    status: MemberStatus.ACTIVE,
    joinedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    hive: { id: 'hive-1', name: 'Morning Runners' },
  },
  {
    id: 'member-2',
    hiveId: 'hive-2',
    userId: 'user-2',
    role: MemberRole.MODERATOR,
    status: MemberStatus.ELIMINATED,
    joinedAt: '2024-02-01T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    user: { id: 'user-2', name: 'Explorer Jane', email: 'jane@example.com' },
    hive: { id: 'hive-2', name: 'Explorer Hive' },
  },
];

const baseHives = [
  { id: 'hive-1', name: 'Morning Runners' },
  { id: 'hive-2', name: 'Explorer Hive' },
];

const baseUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  { id: 'user-2', name: 'Explorer Jane', email: 'jane@example.com' },
];

const createHabitState = (
  overrides?: Partial<{
    hiveMembers: typeof baseMembers;
    hives: typeof baseHives;
    loading: { hiveMembers: boolean; hives: boolean; habits: boolean };
    errors: {
      hiveMembers: string | null;
      hives: string | null;
      habits: string | null;
    };
  }>
) => ({
  hiveMembers: (overrides?.hiveMembers ?? baseMembers).map(member => ({
    ...member,
    user: member.user ? { ...member.user } : null,
    hive: member.hive ? { ...member.hive } : null,
  })),
  hives: (overrides?.hives ?? baseHives).map(hive => ({ ...hive })),
  loading: {
    hiveMembers: false,
    hives: false,
    habits: false,
    ...(overrides?.loading ?? {}),
  },
  errors: {
    hiveMembers: null,
    hives: null,
    habits: null,
    ...(overrides?.errors ?? {}),
  },
});

const createDataState = (
  overrides?: Partial<{
    users: typeof baseUsers;
    loading: { users: boolean };
    errors: { users: string | null };
  }>
) => ({
  users: (overrides?.users ?? baseUsers).map(user => ({ ...user })),
  loading: { users: false, ...(overrides?.loading ?? {}) },
  errors: { users: null, ...(overrides?.errors ?? {}) },
});

const renderPage = () => render(<HiveMembersPage />);

const findSelect = (root: Document | HTMLElement, label: string | RegExp) => {
  const scope = root instanceof HTMLElement ? within(root) : screen;
  const labelElements = scope.queryAllByText(label);
  const labelElement =
    labelElements.find(element => element.tagName === 'LABEL') ??
    labelElements[0];
  const formControl = labelElement?.closest('.MuiFormControl-root');
  return formControl?.querySelector('[role="combobox"]') as HTMLElement | null;
};

const selectOption = async (select: HTMLElement, option: string | RegExp) => {
  await userEvent.click(select);
  const matcher =
    option instanceof RegExp
      ? option
      : new RegExp(option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const listbox = await screen.findByRole('listbox', undefined, {
    timeout: 5000,
  });
  const optionNode = within(listbox).getByText(matcher);
  await userEvent.click(optionNode);
  await waitFor(() => {
    expect(select).toHaveTextContent(matcher);
  });
};

describe('HiveMembersPage', () => {
  jest.setTimeout(15000);

  const fetchHiveMembers = jest.fn();
  const fetchHives = jest.fn();
  const createHiveMemberAsync = jest.fn();
  const updateHiveMemberAsync = jest.fn();
  const deleteHiveMemberAsync = jest.fn();
  const setHiveMembersError = jest.fn();
  const fetchUsers = jest.fn();
  const setUsersError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetchHiveMembers.mockResolvedValue(undefined);
    fetchHives.mockResolvedValue(undefined);
    createHiveMemberAsync.mockResolvedValue({
      success: true,
      data: baseMembers[0],
    });
    updateHiveMemberAsync.mockResolvedValue({
      success: true,
      data: baseMembers[0],
    });
    deleteHiveMemberAsync.mockResolvedValue({ success: true });
    fetchUsers.mockResolvedValue(undefined);

    mockUseRouter.mockReturnValue({ push: jest.fn() } as any);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as any);
    mockUseHabitHive.mockReturnValue({
      state: createHabitState(),
      fetchHiveMembers,
      fetchHives,
      createHiveMemberAsync,
      updateHiveMemberAsync,
      deleteHiveMemberAsync,
      setHiveMembersError,
    } as any);
    mockUseData.mockReturnValue({
      state: createDataState(),
      fetchUsers,
      setUsersError,
    } as any);
  });

  it('renders stats and filters members by search and status', async () => {
    renderPage();

    const totalCard = screen.getByText('Total Miembros').closest('div');
    expect(totalCard).toBeTruthy();
    expect(within(totalCard!).getByText('2')).toBeInTheDocument();
    const activeCard = screen.getByText('Activos').closest('div');
    expect(within(activeCard!).getByText('1')).toBeInTheDocument();
    const eliminatedCard = screen.getByText('Eliminados').closest('div');
    expect(within(eliminatedCard!).getByText('1')).toBeInTheDocument();

    const search = screen.getByPlaceholderText(/Buscar por usuario/i);
    await userEvent.type(search, 'Explorer');
    await waitFor(() => {
      expect(screen.getByText('Explorer Hive')).toBeInTheDocument();
      expect(screen.queryByText('Morning Runners')).not.toBeInTheDocument();
    });

    const statusSelect = findSelect(document.body, 'Estado');
    expect(statusSelect).toBeTruthy();
    await selectOption(statusSelect!, /Eliminados/i);
    await waitFor(() => {
      expect(screen.getByText('Explorer Hive')).toBeInTheDocument();
      expect(screen.queryByText('Morning Runners')).not.toBeInTheDocument();
    });

    await userEvent.clear(search);
    await selectOption(statusSelect!, /Todos/i);
    await waitFor(() => {
      expect(screen.getByText('Morning Runners')).toBeInTheDocument();
      expect(screen.getByText('Explorer Hive')).toBeInTheDocument();
    });
  });

  it('adds a hive member through the dialog', async () => {
    renderPage();

    await userEvent.click(
      screen.getByRole('button', { name: /agregar miembro/i })
    );

    const dialog = await screen.findByRole('dialog');

    const hiveSelect = findSelect(dialog, 'Colmena');
    expect(hiveSelect).toBeTruthy();
    await selectOption(hiveSelect!, 'Morning Runners');

    const userSelect = findSelect(dialog, 'Usuario');
    expect(userSelect).toBeTruthy();
    await selectOption(userSelect!, /John Doe/);

    const roleSelect = findSelect(dialog, 'Rol');
    expect(roleSelect).toBeTruthy();
    await selectOption(roleSelect!, /Moderador/);

    await userEvent.click(
      within(dialog).getByRole('button', { name: /agregar/i })
    );

    await waitFor(() => {
      expect(createHiveMemberAsync).toHaveBeenCalledWith({
        hiveId: 'hive-1',
        userId: 'user-1',
        role: MemberRole.MODERATOR,
      });
    });

    expect(
      screen.getByText('Miembro agregado correctamente')
    ).toBeInTheDocument();
  });

  it('edits an existing member role', async () => {
    renderPage();

    const editIcon = (await screen.findAllByTestId('EditIcon')).find(icon =>
      icon.closest('button')
    );
    expect(editIcon).toBeTruthy();
    await userEvent.click(editIcon!.closest('button')!);

    const dialog = await screen.findByRole('dialog', {
      name: /editar miembro/i,
    });
    const roleSelect = findSelect(dialog, 'Rol');
    expect(roleSelect).toBeTruthy();
    await selectOption(roleSelect!, /Propietario/);

    await userEvent.click(
      within(dialog).getByRole('button', { name: /actualizar/i })
    );

    await waitFor(() => {
      expect(updateHiveMemberAsync).toHaveBeenCalledWith('member-1', {
        role: MemberRole.OWNER,
      });
    });

    expect(
      screen.getByText('Miembro actualizado correctamente')
    ).toBeInTheDocument();
  });

  it('deletes a member from the grid', async () => {
    renderPage();

    const deleteIcon = (await screen.findAllByTestId('DeleteIcon')).find(icon =>
      icon.closest('button')
    );
    expect(deleteIcon).toBeTruthy();
    await userEvent.click(deleteIcon!.closest('button')!);

    const dialog = await screen.findByRole('dialog', {
      name: 'Eliminar Miembro',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: /eliminar/i })
    );

    await waitFor(() => {
      expect(deleteHiveMemberAsync).toHaveBeenCalledWith('hive-1', 'user-1');
    });

    expect(
      screen.getByText('Miembro eliminado correctamente')
    ).toBeInTheDocument();
  });

  it('refreshes the data when the toolbar button is pressed', async () => {
    renderPage();

    await waitFor(() => expect(fetchHiveMembers).toHaveBeenCalled());
    const refreshButton = screen.getByTestId('RefreshIcon').closest('button');
    expect(refreshButton).toBeTruthy();
    await userEvent.click(refreshButton!);

    expect(fetchHiveMembers).toHaveBeenCalledTimes(2);
    expect(fetchHives).toHaveBeenCalled();
    expect(fetchUsers).toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login', () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push } as any);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as any);

    renderPage();

    expect(push).toHaveBeenCalledWith('/login');
  });

  it('clears remote errors when the alert is dismissed', async () => {
    mockUseHabitHive.mockReturnValue({
      state: createHabitState({
        errors: { hiveMembers: 'Hubo un error', hives: null, habits: null },
      }),
      fetchHiveMembers,
      fetchHives,
      createHiveMemberAsync,
      updateHiveMemberAsync,
      deleteHiveMemberAsync,
      setHiveMembersError,
    } as any);
    mockUseData.mockReturnValue({
      state: createDataState({
        errors: { users: 'Usuarios no disponibles' },
      }),
      fetchUsers,
      setUsersError,
    } as any);

    renderPage();

    const alert = screen
      .getByText('Hubo un error')
      .closest('[role="alert"]') as HTMLElement | null;
    expect(alert).toBeTruthy();
    await userEvent.click(
      within(alert!).getByRole('button', { name: /close/i })
    );

    expect(setHiveMembersError).toHaveBeenCalledWith(null);
    expect(setUsersError).toHaveBeenCalledWith(null);
  });
});
