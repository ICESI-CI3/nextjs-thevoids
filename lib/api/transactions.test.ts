import { transactionsApi } from './transactions';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('transactionsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all transactions without params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getAll();

    expect(apiClient.get).toHaveBeenCalledWith('/transactions');
  });

  it('fetches all transactions with pagination', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getAll({ limit: 10, offset: 5 });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/transactions?limit=10&offset=5'
    );
  });

  it('fetches transactions by user', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getByUser('user-1', { limit: 20 });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/transactions/user/user-1?limit=20'
    );
  });

  it('fetches transactions by hive', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getByHive('hive-1', { offset: 3 });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/transactions/hive/hive-1?offset=3'
    );
  });

  it('fetches transactions by user and hive', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getByUserAndHive('user-1', 'hive-2');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/transactions/user/user-1/hive/hive-2'
    );
  });

  it('retrieves stats for a user', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getStatsForUser('user-2');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/transactions/stats/user/user-2'
    );
  });

  it('retrieves stats for a hive', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await transactionsApi.getStatsForHive('hive-3');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/transactions/stats/hive/hive-3'
    );
  });
});
