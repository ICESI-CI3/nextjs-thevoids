import { hiveMembersApi, MemberRole } from './hiveMembers';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('hiveMembersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retrieves members with default pagination', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hiveMembersApi.getAll();

    expect(apiClient.get).toHaveBeenCalledWith('/hive-members');
  });

  it('retrieves members with pagination params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hiveMembersApi.getAll({ limit: 5, offset: 10 });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/hive-members?limit=5&offset=10'
    );
  });

  it('gets a member by id', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hiveMembersApi.getById('member-1');

    expect(apiClient.get).toHaveBeenCalledWith('/hive-members/member-1');
  });

  it('fetches members for a hive', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hiveMembersApi.getByHive('hive-1');

    expect(apiClient.get).toHaveBeenCalledWith('/hive-members/hive/hive-1');
  });

  it('fetches members for a user', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await hiveMembersApi.getByUser('user-1');

    expect(apiClient.get).toHaveBeenCalledWith('/hive-members/user/user-1');
  });

  it('creates a hive member', async () => {
    const payload = {
      hiveId: 'hive-1',
      userId: 'user-1',
      role: MemberRole.MEMBER,
    };
    (apiClient.post as jest.Mock).mockResolvedValue({ status: 201 });

    await hiveMembersApi.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/hive-members', payload);
  });

  it('updates a hive member', async () => {
    const update = { role: MemberRole.MODERATOR };
    (apiClient.patch as jest.Mock).mockResolvedValue({ status: 200 });

    await hiveMembersApi.update('member-2', update);

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/hive-members/member-2',
      update
    );
  });

  it('deletes a hive member', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({ status: 204 });

    await hiveMembersApi.delete('hive-1', 'user-5');

    expect(apiClient.delete).toHaveBeenCalledWith(
      '/hive-members/hive-1/user-5'
    );
  });
});
