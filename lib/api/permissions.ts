import { apiClient } from './client';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  rolePermissions?: RolePermission[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  role?: {
    id: string;
    name: string;
  };
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const permissionsApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<Permission[]>(
      `/permissions${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: string) => {
    return apiClient.get<Permission>(`/permissions/${id}`);
  },

  create: async (data: CreatePermissionDto) => {
    return apiClient.post<Permission>('/permissions', data);
  },

  update: async (id: string, data: UpdatePermissionDto) => {
    return apiClient.patch<Permission>(`/permissions/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/permissions/${id}`);
  },
};
