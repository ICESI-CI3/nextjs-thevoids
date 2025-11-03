import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  roles?: string[];
}

export interface LoginResponse {
  user: User;
  token: string;
  permissions: string[];
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<LoginResponse>('/users/login', credentials);
  },

  getProfile: async () => {
    return apiClient.get<User>('/users/profile');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
    }
  },
};
