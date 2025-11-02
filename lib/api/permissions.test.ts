import { permissionsApi } from './permissions';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('permissionsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /permissions', async () => {
      const mockPermissions = [
        { id: '1', name: 'users.read', description: 'Read users' },
        { id: '2', name: 'users.write', description: 'Write users' },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockPermissions,
      });

      const result = await permissionsApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/permissions');
      expect(result.data).toEqual(mockPermissions);
    });
  });

  describe('getById', () => {
    it('should call GET /permissions/:id', async () => {
      const mockPermission = {
        id: '1',
        name: 'users.read',
        description: 'Read users',
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockPermission,
      });

      const result = await permissionsApi.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/permissions/1');
      expect(result.data).toEqual(mockPermission);
    });
  });

  describe('create', () => {
    it('should call POST /permissions with permission data', async () => {
      const newPermission = {
        name: 'roles.delete',
        description: 'Delete roles',
      };

      const createdPermission = {
        id: '3',
        ...newPermission,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 201,
        data: createdPermission,
      });

      const result = await permissionsApi.create(newPermission);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        newPermission
      );
      expect(result.data).toEqual(createdPermission);
    });
  });

  describe('update', () => {
    it('should call PATCH /permissions/:id with update data', async () => {
      const updateData = {
        description: 'Updated description',
      };

      const updatedPermission = {
        id: '1',
        name: 'users.read',
        description: 'Updated description',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        status: 200,
        data: updatedPermission,
      });

      const result = await permissionsApi.update('1', updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/permissions/1',
        updateData
      );
      expect(result.data).toEqual(updatedPermission);
    });
  });

  describe('delete', () => {
    it('should call DELETE /permissions/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 204,
      });

      const result = await permissionsApi.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/permissions/1');
      expect(result.status).toBe(204);
    });
  });
});
