import { habitHivesApi } from './habitHives';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('habitHivesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a habit-hive assignment', async () => {
    const payload = { hiveId: 'h1', habitId: 'hb1' };
    (apiClient.post as jest.Mock).mockResolvedValue({ status: 201 });

    await habitHivesApi.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/habit-hives', payload);
  });

  it('fetches assignments for a hive', async () => {
    const hiveId = 'hive-123';
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await habitHivesApi.getByHive(hiveId);

    expect(apiClient.get).toHaveBeenCalledWith(`/habit-hives/hive/${hiveId}`);
  });

  it('deletes an assignment', async () => {
    const hiveId = 'hive-789';
    const habitId = 'habit-456';
    (apiClient.delete as jest.Mock).mockResolvedValue({ status: 204 });

    await habitHivesApi.delete(hiveId, habitId);

    expect(apiClient.delete).toHaveBeenCalledWith(
      `/habit-hives/hive/${hiveId}/habit/${habitId}`
    );
  });
});
