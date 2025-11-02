import { userRolesApi } from './userRoles';
import { apiClient } from './client';

// Mock the apiClient
jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('userRolesApi', () => {
  const mockUserRole = {
    userId: '1',
    roleId: '1',
    createdAt: '2023-01-01T00:00:00Z',
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    role: { id: '1', name: 'admin', description: 'Administrator' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [mockUserRole],
        error: null,
      });

      const result = await userRolesApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/user-roles');
      expect(result).toEqual({
        data: [mockUserRole],
        error: null,
      });
    });

    it('should handle pagination parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [mockUserRole],
        error: null,
      });

      const result = await userRolesApi.getAll({ limit: 10, offset: 5 });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/user-roles?limit=10&offset=5'
      );
      expect(result).toEqual({
        data: [mockUserRole],
        error: null,
      });
    });

    it('should handle partial pagination parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [mockUserRole],
        error: null,
      });

      const result = await userRolesApi.getAll({ limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/user-roles?limit=10');
      expect(result).toEqual({
        data: [mockUserRole],
        error: null,
      });
    });
  });

  describe('getById', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockUserRole,
        error: null,
      });

      const result = await userRolesApi.getById('1', '1');

      expect(apiClient.get).toHaveBeenCalledWith('/user-roles/1/1');
      expect(result).toEqual({
        data: mockUserRole,
        error: null,
      });
    });
  });

  describe('create', () => {
    it('should call apiClient.post with correct endpoint and data', async () => {
      const createData = { userId: '1', roleId: '1' };
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockUserRole,
        error: null,
      });

      const result = await userRolesApi.create(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/user-roles', createData);
      expect(result).toEqual({
        data: mockUserRole,
        error: null,
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.patch with correct endpoint and data', async () => {
      const updateData = { roleId: '2' };
      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: { ...mockUserRole, roleId: '2' },
        error: null,
      });

      const result = await userRolesApi.update('1', '1', updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/user-roles/1/1',
        updateData
      );
      expect(result).toEqual({
        data: { ...mockUserRole, roleId: '2' },
        error: null,
      });
    });
  });

  describe('delete', () => {
    it('should call apiClient.delete with correct endpoint', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await userRolesApi.delete('1', '1');

      expect(apiClient.delete).toHaveBeenCalledWith('/user-roles/1/1');
      expect(result).toEqual({
        data: null,
        error: null,
      });
    });
  });

  describe('error handling', () => {
    it('should return error from apiClient', async () => {
      const errorMessage = 'Network error';
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: errorMessage,
      });

      const result = await userRolesApi.getAll();

      expect(result).toEqual({
        data: null,
        error: errorMessage,
      });
    });
  });
});
