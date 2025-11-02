import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  userRoles?: UserRole[];
}

export interface UserRole {
  userId: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const usersApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<User[]>(`/users${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiClient.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserDto) => {
    return apiClient.post<User>('/users/register', data);
  },

  update: async (id: string, data: UpdateUserDto) => {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};
