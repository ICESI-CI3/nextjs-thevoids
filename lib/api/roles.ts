import { apiClient } from './client';

export interface Role {
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
  permission?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const rolesApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<Role[]>(`/roles${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  create: async (data: CreateRoleDto) => {
    return apiClient.post<Role>('/roles', data);
  },

  update: async (id: string, data: UpdateRoleDto) => {
    return apiClient.patch<Role>(`/roles/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/roles/${id}`);
  },
};
