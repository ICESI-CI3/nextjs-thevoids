import { rolePermissionsApi } from './rolePermissions';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('rolePermissionsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /role-permissions', async () => {
      const mockRolePermissions = [
        { roleId: '1', permissionId: '1' },
        { roleId: '1', permissionId: '2' },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRolePermissions,
      });

      const result = await rolePermissionsApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/role-permissions');
      expect(result.data).toEqual(mockRolePermissions);
    });

    it('should call GET /role-permissions with limit parameter', async () => {
      const mockRolePermissions = [{ roleId: '1', permissionId: '1' }];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRolePermissions,
      });

      const result = await rolePermissionsApi.getAll({ limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/role-permissions?limit=10');
      expect(result.data).toEqual(mockRolePermissions);
    });

    it('should call GET /role-permissions with offset parameter', async () => {
      const mockRolePermissions = [{ roleId: '2', permissionId: '1' }];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRolePermissions,
      });

      const result = await rolePermissionsApi.getAll({ offset: 5 });

      expect(apiClient.get).toHaveBeenCalledWith('/role-permissions?offset=5');
      expect(result.data).toEqual(mockRolePermissions);
    });

    it('should call GET /role-permissions with both limit and offset parameters', async () => {
      const mockRolePermissions = [{ roleId: '1', permissionId: '1' }];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRolePermissions,
      });

      const result = await rolePermissionsApi.getAll({ limit: 10, offset: 5 });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/role-permissions?limit=10&offset=5'
      );
      expect(result.data).toEqual(mockRolePermissions);
    });
  });

  describe('getById', () => {
    it('should call GET /role-permissions/:roleId/:permissionId', async () => {
      const mockRolePermission = {
        roleId: '1',
        permissionId: '2',
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockRolePermission,
      });

      const result = await rolePermissionsApi.getById('1', '2');

      expect(apiClient.get).toHaveBeenCalledWith('/role-permissions/1/2');
      expect(result.data).toEqual(mockRolePermission);
    });
  });

  describe('create', () => {
    it('should call POST /role-permissions with roleId and permissionId', async () => {
      const newRolePermission = {
        roleId: '2',
        permissionId: '3',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 201,
        data: newRolePermission,
      });

      const result = await rolePermissionsApi.create(newRolePermission);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/role-permissions',
        newRolePermission
      );
      expect(result.data).toEqual(newRolePermission);
    });
  });

  describe('delete', () => {
    it('should call DELETE /role-permissions/:roleId/:permissionId', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 204,
      });

      const result = await rolePermissionsApi.delete('1', '2');

      expect(apiClient.delete).toHaveBeenCalledWith('/role-permissions/1/2');
      expect(result.status).toBe(204);
    });
  });

  describe('update', () => {
    it('should call PATCH /role-permissions/:roleId/:permissionId', async () => {
      const updateData = {
        roleId: '3',
        permissionId: '4',
      };

      const mockUpdatedRolePermission = {
        roleId: '3',
        permissionId: '4',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockUpdatedRolePermission,
      });

      const result = await rolePermissionsApi.update('1', '2', updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/role-permissions/1/2',
        updateData
      );
      expect(result.data).toEqual(mockUpdatedRolePermission);
    });

    it('should call PATCH with partial update data', async () => {
      const updateData = {
        roleId: '5',
      };

      const mockUpdatedRolePermission = {
        roleId: '5',
        permissionId: '2',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockUpdatedRolePermission,
      });

      const result = await rolePermissionsApi.update('1', '2', updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/role-permissions/1/2',
        updateData
      );
      expect(result.data).toEqual(mockUpdatedRolePermission);
    });
  });
});
