import { apiClient } from './client';

export interface RolePermission {
  roleId: string;
  permissionId: string;
  createdAt?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  permission?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateRolePermissionDto {
  roleId: string;
  permissionId: string;
}

export interface UpdateRolePermissionDto {
  roleId?: string;
  permissionId?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const rolePermissionsApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<RolePermission[]>(
      `/role-permissions${query ? `?${query}` : ''}`
    );
  },

  getById: async (roleId: string, permissionId: string) => {
    return apiClient.get<RolePermission>(
      `/role-permissions/${roleId}/${permissionId}`
    );
  },

  create: async (data: CreateRolePermissionDto) => {
    return apiClient.post<RolePermission>('/role-permissions', data);
  },

  update: async (
    roleId: string,
    permissionId: string,
    data: UpdateRolePermissionDto
  ) => {
    return apiClient.patch<RolePermission>(
      `/role-permissions/${roleId}/${permissionId}`,
      data
    );
  },

  delete: async (roleId: string, permissionId: string) => {
    return apiClient.delete(`/role-permissions/${roleId}/${permissionId}`);
  },
};
