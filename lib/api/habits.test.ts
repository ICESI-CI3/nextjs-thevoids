import { habitsApi, HabitType, EvidenceType } from './habits';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('habitsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves all habits without params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await habitsApi.getAll();

    expect(apiClient.get).toHaveBeenCalledWith('/habits');
  });

  it('retrieves all habits with pagination', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await habitsApi.getAll({ limit: 10, offset: 20 });

    expect(apiClient.get).toHaveBeenCalledWith('/habits?limit=10&offset=20');
  });

  it('gets a habit by id', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await habitsApi.getById('habit-1');

    expect(apiClient.get).toHaveBeenCalledWith('/habits/habit-1');
  });

  it('creates a habit', async () => {
    const payload = {
      title: 'Test Habit',
      type: HabitType.OBJECTIVE,
      evidenceType: EvidenceType.API,
    } as const;

    (apiClient.post as jest.Mock).mockResolvedValue({ status: 201 });

    await habitsApi.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/habits', payload);
  });

  it('updates a habit', async () => {
    const update = { title: 'Updated' };
    (apiClient.patch as jest.Mock).mockResolvedValue({ status: 200 });

    await habitsApi.update('habit-2', update);

    expect(apiClient.patch).toHaveBeenCalledWith('/habits/habit-2', update);
  });

  it('deletes a habit', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({ status: 204 });

    await habitsApi.delete('habit-3');

    expect(apiClient.delete).toHaveBeenCalledWith('/habits/habit-3');
  });
});
