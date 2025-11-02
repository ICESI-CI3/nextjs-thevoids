import { rolesApi } from './roles';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('rolesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /roles', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin', description: 'Administrator role' },
        { id: '2', name: 'User', description: 'Regular user' },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRoles,
      });

      const result = await rolesApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/roles');
      expect(result.data).toEqual(mockRoles);
    });
  });

  describe('getById', () => {
    it('should call GET /roles/:id', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRole,
      });

      const result = await rolesApi.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/roles/1');
      expect(result.data).toEqual(mockRole);
    });
  });

  describe('create', () => {
    it('should call POST /roles with role data', async () => {
      const newRole = {
        name: 'Moderator',
        description: 'Moderator role',
      };

      const createdRole = {
        id: '3',
        ...newRole,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 201,
        data: createdRole,
      });

      const result = await rolesApi.create(newRole);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', newRole);
      expect(result.data).toEqual(createdRole);
    });
  });

  describe('update', () => {
    it('should call PATCH /roles/:id with update data', async () => {
      const updateData = {
        description: 'Updated description',
      };

      const updatedRole = {
        id: '1',
        name: 'Admin',
        description: 'Updated description',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        status: 200,
        data: updatedRole,
      });

      const result = await rolesApi.update('1', updateData);

      expect(apiClient.patch).toHaveBeenCalledWith('/roles/1', updateData);
      expect(result.data).toEqual(updatedRole);
    });
  });

  describe('delete', () => {
    it('should call DELETE /roles/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 204,
      });

      const result = await rolesApi.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/roles/1');
      expect(result.status).toBe(204);
    });
  });
});
