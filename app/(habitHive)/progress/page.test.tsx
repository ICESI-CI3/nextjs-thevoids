import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressPage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  progressApi,
  ProgressStatus,
  type Progress,
  type ProgressStats,
} from '@/lib/api/progress';
import { hivesApi, type Hive, HiveStatus } from '@/lib/api/hives';
import {
  habitsApi,
  EvidenceType,
  type Habit,
  HabitType,
} from '@/lib/api/habits';
import {
  hiveMembersApi,
  MemberStatus,
  type HiveMember,
  MemberRole,
} from '@/lib/api/hiveMembers';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api/progress', () => {
  const actual = jest.requireActual('@/lib/api/progress');
  return {
    ...actual,
    progressApi: {
      getByUser: jest.fn(),
      getUserStats: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    },
  };
});

jest.mock('@/lib/api/hives', () => {
  const actual = jest.requireActual('@/lib/api/hives');
  return {
    ...actual,
    hivesApi: {
      getById: jest.fn(),
    },
  };
});

jest.mock('@/lib/api/habits', () => {
  const actual = jest.requireActual('@/lib/api/habits');
  return {
    ...actual,
    habitsApi: {
      getById: jest.fn(),
    },
  };
});

jest.mock('@/lib/api/hiveMembers', () => {
  const actual = jest.requireActual('@/lib/api/hiveMembers');
  return {
    ...actual,
    hiveMembersApi: {
      getByUser: jest.fn(),
    },
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockProgress: Progress = {
  id: 'progress-1',
  hiveId: 'hive-1',
  habitId: 'habit-1',
  userId: 'user-1',
  date: '2024-01-05',
  status: ProgressStatus.PENDING,
  evidenceNotes: '',
  witnessName: '',
  witnessContact: '',
  createdAt: '2024-01-05T00:00:00Z',
  updatedAt: '2024-01-05T00:00:00Z',
  evidenceUrl: 'evidence/proof.png',
};

const mockStats: ProgressStats = {
  total: 3,
  completed: 1,
  failed: 1,
  pending: 1,
  completionRate: 33,
};

const mockHive: Hive = {
  id: 'hive-1',
  name: 'Hive Alpha',
  description: 'Test hive',
  createdById: 'user-1',
  durationDays: 30,
  entryFee: 0,
  eliminationType: 'consecutive',
  allowedHabitTypes: [HabitType.OBJECTIVE],
  status: HiveStatus.OPEN,
  isPublic: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  habitId: 'habit-1',
  habitHives: [
    {
      id: 'hh-1',
      hiveId: 'hive-1',
      habitId: 'habit-1',
      assignedAt: '2024-01-01T00:00:00Z',
      habit: {
        id: 'habit-1',
        title: 'Morning Run',
        type: HabitType.OBJECTIVE,
        evidenceType: EvidenceType.SELF,
        frequency: 'daily',
      },
    },
  ],
};

const mockHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  title: 'Morning Run',
  type: HabitType.OBJECTIVE,
  evidenceType: EvidenceType.SELF,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockMembership: HiveMember = {
  id: 'membership-1',
  hiveId: 'hive-1',
  userId: 'user-1',
  role: MemberRole.MEMBER,
  status: MemberStatus.ACTIVE,
  joinedAt: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

interface SetupOptions {
  progressOverrides?: Partial<Progress>;
  hiveOverrides?: Partial<Hive>;
  habitOverrides?: Partial<Habit>;
  statsOverrides?: Partial<ProgressStats> | null;
  membershipOverrides?: Partial<HiveMember>;
  progressError?: string;
  statsError?: string;
  membershipsError?: string;
  createError?: string;
  updateStatusError?: string;
  habitEvidenceType?: EvidenceType;
}

const setupMocks = (options: SetupOptions = {}) => {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'user-1', email: 'user@example.com', name: 'Test User' },
    hasPermission: jest.fn().mockReturnValue(true),
  } as any);

  mockUseRouter.mockReturnValue({ push: jest.fn() } as any);

  const progressResponse: Progress = {
    ...mockProgress,
    ...options.progressOverrides,
  };

  (progressApi.getByUser as jest.Mock).mockResolvedValue({
    data: options.progressError ? undefined : [progressResponse],
    error: options.progressError,
  });

  const statsResponse =
    options.statsOverrides === null
      ? null
      : { ...mockStats, ...options.statsOverrides };

  (progressApi.getUserStats as jest.Mock).mockResolvedValue({
    data: statsResponse || undefined,
    error: options.statsError,
  });

  (progressApi.create as jest.Mock).mockResolvedValue({
    data: options.createError ? undefined : { id: 'progress-2' },
    error: options.createError,
  });

  (progressApi.updateStatus as jest.Mock).mockResolvedValue({
    data: options.updateStatusError
      ? undefined
      : { id: 'progress-1', status: ProgressStatus.COMPLETED },
    error: options.updateStatusError,
  });

  (hiveMembersApi.getByUser as jest.Mock).mockResolvedValue({
    data: options.membershipsError
      ? undefined
      : [{ ...mockMembership, ...options.membershipOverrides }],
    error: options.membershipsError,
  });

  const habitEvidenceType = options.habitEvidenceType ?? mockHabit.evidenceType;

  (hivesApi.getById as jest.Mock).mockImplementation(async (id: string) => ({
    data: id === 'hive-1' ? { ...mockHive, ...options.hiveOverrides } : null,
    error: undefined,
  }));

  (habitsApi.getById as jest.Mock).mockImplementation(async (id: string) => ({
    data:
      id === 'habit-1'
        ? {
            ...mockHabit,
            evidenceType: habitEvidenceType,
            ...options.habitOverrides,
          }
        : null,
    error: undefined,
  }));
};

const renderProgressPage = (options?: SetupOptions) => {
  setupMocks(options);
  return render(<ProgressPage />);
};

describe('ProgressPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads progress and allows updating status from quick actions', async () => {
    renderProgressPage();

    await screen.findByText('Morning Run');

    const evidenceLink = screen.getByRole('link', { name: /ver evidencia/i });
    const expectedUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/evidence/proof.png`;
    expect(evidenceLink).toHaveAttribute('href', expectedUrl);

    const completeButton = screen.getByRole('button', { name: /completar/i });

    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(progressApi.updateStatus).toHaveBeenCalledWith(
        'progress-1',
        ProgressStatus.COMPLETED
      );
    });
  });

  it('shows an error when progress creation fails', async () => {
    renderProgressPage({ createError: 'No se pudo registrar el progreso' });

    await screen.findByText('Morning Run');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog', {
      name: /registrar progreso/i,
    });

    const descriptionField =
      within(dialog).getByLabelText(/describe tu progreso/i);
    await userEvent.type(descriptionField, 'Intento fallido');

    await userEvent.click(
      within(dialog).getByRole('button', { name: /^registrar$/i })
    );

    expect(
      await screen.findByText('No se pudo registrar el progreso')
    ).toBeInTheDocument();
  }, 12000);

  it('requires photographic evidence before enabling submission', async () => {
    renderProgressPage({ habitEvidenceType: EvidenceType.PHOTO });

    await screen.findByText('Morning Run');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog', {
      name: /registrar progreso/i,
    });

    const fileInput = dialog.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const submitButton = within(dialog).getByRole('button', {
      name: /^registrar$/i,
    });
    expect(submitButton).toBeDisabled();

    const file = new File(['image-data'], 'evidence.jpg', {
      type: 'image/jpeg',
    });
    await userEvent.upload(fileInput!, file);

    expect(submitButton).toBeEnabled();

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(progressApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ evidenceFile: expect.any(File) })
      );
    });
  }, 12000);

  it('resets evidence fields when the dialog is cancelled', async () => {
    renderProgressPage();

    await screen.findByText('Morning Run');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    let dialog = await screen.findByRole('dialog', {
      name: /registrar progreso/i,
    });

    const descriptionField =
      within(dialog).getByLabelText(/describe tu progreso/i);
    await userEvent.type(descriptionField, 'Contenido temporal');

    await userEvent.click(
      within(dialog).getByRole('button', { name: /cancelar/i })
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    dialog = await screen.findByRole('dialog', {
      name: /registrar progreso/i,
    });

    expect(within(dialog).getByLabelText(/describe tu progreso/i)).toHaveValue(
      ''
    );
  }, 12000);

  it('renders API errors when quick status update fails', async () => {
    renderProgressPage({ updateStatusError: 'No se pudo actualizar' });

    await screen.findByText('Morning Run');

    const completeButton = screen.getByRole('button', { name: /completar/i });
    await userEvent.click(completeButton);

    expect(
      await screen.findByText('No se pudo actualizar')
    ).toBeInTheDocument();
  }, 12000);

  it('filters progress by selected hive', async () => {
    renderProgressPage();

    await screen.findByText('Morning Run');

    const hiveSelects = screen.getAllByRole('combobox');
    const hiveSelect = hiveSelects.find(select =>
      select.parentElement?.textContent?.includes('Colmena')
    );
    expect(hiveSelect).toBeTruthy();

    await userEvent.click(hiveSelect!);
    const option = await screen.findByRole('option', { name: 'Hive Alpha' });
    await userEvent.click(option);

    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  }, 12000);

  it('filters progress by selected habit', async () => {
    renderProgressPage();

    await screen.findByText('Morning Run');

    const habitSelects = screen.getAllByRole('combobox');
    const habitSelect = habitSelects.find(select =>
      select.parentElement?.textContent?.includes('Hábito')
    );
    expect(habitSelect).toBeTruthy();

    await userEvent.click(habitSelect!);
    const option = await screen.findByRole('option', { name: 'Morning Run' });
    await userEvent.click(option);

    const titles = screen.getAllByText('Morning Run');
    expect(titles.length).toBeGreaterThan(0);
  }, 12000);

  it('requires witness name for witness evidence type', async () => {
    renderProgressPage({ habitEvidenceType: EvidenceType.WITNESS });

    await screen.findByText('Morning Run');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog');

    const submitButton = within(dialog).getByRole('button', {
      name: /^registrar$/i,
    });
    expect(submitButton).toBeDisabled();

    const witnessNameInput = within(dialog).getByLabelText(
      /nombre del verificador/i
    );
    await userEvent.type(witnessNameInput, 'John Doe');

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(progressApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          witnessName: 'John Doe',
        })
      );
    });
  }, 12000);

  it('requires evidence notes for API evidence type', async () => {
    renderProgressPage({ habitEvidenceType: EvidenceType.API });

    await screen.findByText('Morning Run');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog');

    const submitButton = within(dialog).getByRole('button', {
      name: /^registrar$/i,
    });
    expect(submitButton).toBeDisabled();

    const apiReferenceInput = within(dialog).getByLabelText(
      /referencia o enlace de evidencia/i
    );
    await userEvent.type(apiReferenceInput, 'https://api.example.com/data');

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  }, 12000);

  it('allows marking progress as failed', async () => {
    renderProgressPage();

    await screen.findByText('Morning Run');

    const failButton = screen.getByRole('button', { name: /marcar fallido/i });
    await userEvent.click(failButton);

    await waitFor(() => {
      expect(progressApi.updateStatus).toHaveBeenCalledWith(
        'progress-1',
        ProgressStatus.FAILED
      );
    });
  }, 12000);

  it('shows empty state when no progress exists', async () => {
    renderProgressPage({ progressError: 'No data' });

    expect(
      await screen.findByText('No hay progreso registrado')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Comienza a registrar tu progreso diario en tus hábitos')
    ).toBeInTheDocument();
  }, 12000);

  it('shows error when required evidence is missing', async () => {
    renderProgressPage({ habitEvidenceType: EvidenceType.PHOTO });

    await screen.findByText('Morning Run');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog');

    const submitButton = within(dialog).getByRole('button', {
      name: /^registrar$/i,
    });

    expect(submitButton).toBeDisabled();

    expect(
      screen.getByText(
        /Completa la evidencia para poder registrar tu progreso/i
      )
    ).toBeInTheDocument();
  }, 12000);

  it('shows error when selecting habit without hive', async () => {
    setupMocks();
    (hivesApi.getById as jest.Mock).mockResolvedValue({
      data: { ...mockHive, habitHives: [] },
      error: undefined,
    });

    render(<ProgressPage />);

    await screen.findByText('Mi Progreso');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog');

    const submitButton = within(dialog).getByRole('button', {
      name: /^registrar$/i,
    });

    expect(submitButton).toBeDisabled();
  }, 12000);

  it('displays witness information when present', async () => {
    renderProgressPage({
      progressOverrides: {
        witnessName: 'Jane Doe',
        witnessContact: 'jane@example.com',
      },
    });

    await screen.findByText('Morning Run');

    expect(screen.getByText(/Verificado por: Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
  }, 12000);

  it('displays verified badge when progress is verified', async () => {
    renderProgressPage({
      progressOverrides: {
        verifiedBy: 'admin-1',
      },
    });

    await screen.findByText('Morning Run');

    expect(screen.getByText('✓ Verificado')).toBeInTheDocument();
  }, 12000);

  it('handles error when habit is not valid', async () => {
    setupMocks();
    (habitsApi.getById as jest.Mock).mockResolvedValue({
      data: null,
      error: undefined,
    });
    (hivesApi.getById as jest.Mock).mockResolvedValue({
      data: { ...mockHive, habitHives: [] },
      error: undefined,
    });

    render(<ProgressPage />);

    await screen.findByText('Mi Progreso');

    await userEvent.click(
      screen.getByRole('button', { name: /registrar progreso/i })
    );

    const dialog = await screen.findByRole('dialog');
    const submitButton = within(dialog).getByRole('button', {
      name: /^registrar$/i,
    });

    expect(submitButton).toBeDisabled();
  }, 12000);
});
