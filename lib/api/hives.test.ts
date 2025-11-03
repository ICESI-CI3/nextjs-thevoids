import { hivesApi, CreateHiveDto } from './hives';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('hivesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves hives without filters', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hivesApi.getAll();

    expect(apiClient.get).toHaveBeenCalledWith('/hives');
  });

  it('retrieves hives with pagination params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hivesApi.getAll({ limit: 15, offset: 5 });

    expect(apiClient.get).toHaveBeenCalledWith('/hives?limit=15&offset=5');
  });

  it('gets a hive by id', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hivesApi.getById('hive-1');

    expect(apiClient.get).toHaveBeenCalledWith('/hives/hive-1');
  });

  it('creates a hive', async () => {
    const payload: CreateHiveDto = {
      name: 'Morning Joggers',
      durationDays: 30,
    };

    (apiClient.post as jest.Mock).mockResolvedValue({ status: 201 });

    await hivesApi.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/hives', payload);
  });

  it('updates a hive', async () => {
    const update = { description: 'New description' };
    (apiClient.patch as jest.Mock).mockResolvedValue({ status: 200 });

    await hivesApi.update('hive-2', update);

    expect(apiClient.patch).toHaveBeenCalledWith('/hives/hive-2', update);
  });

  it('removes a hive', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({ status: 204 });

    await hivesApi.delete('hive-3');

    expect(apiClient.delete).toHaveBeenCalledWith('/hives/hive-3');
  });
});
