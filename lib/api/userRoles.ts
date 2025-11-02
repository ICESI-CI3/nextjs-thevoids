import { apiClient } from './client';

export interface UserRole {
  userId: string;
  roleId: string;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateUserRoleDto {
  userId: string;
  roleId: string;
}

export interface UpdateUserRoleDto {
  userId?: string;
  roleId?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const userRolesApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<UserRole[]>(`/user-roles${query ? `?${query}` : ''}`);
  },

  getById: async (userId: string, roleId: string) => {
    return apiClient.get<UserRole>(`/user-roles/${userId}/${roleId}`);
  },

  create: async (data: CreateUserRoleDto) => {
    return apiClient.post<UserRole>('/user-roles', data);
  },

  update: async (userId: string, roleId: string, data: UpdateUserRoleDto) => {
    return apiClient.patch<UserRole>(`/user-roles/${userId}/${roleId}`, data);
  },

  delete: async (userId: string, roleId: string) => {
    return apiClient.delete(`/user-roles/${userId}/${roleId}`);
  },
};
