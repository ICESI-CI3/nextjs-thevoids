import { apiClient } from './client';

export enum HabitType {
  OBJECTIVE = 'objective',
  SEMI = 'semi',
  SUBJECTIVE = 'subjective',
}

export enum EvidenceType {
  API = 'api',
  PHOTO = 'photo',
  SELF = 'self',
  WITNESS = 'witness',
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  type: HabitType;
  frequency?: string;
  evidenceType: EvidenceType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateHabitDto {
  title: string;
  type: HabitType;
  frequency?: string;
  evidenceType: EvidenceType;
}

export interface UpdateHabitDto {
  title?: string;
  type?: HabitType;
  frequency?: string;
  evidenceType?: EvidenceType;
  isActive?: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const habitsApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<Habit[]>(`/habits${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Habit>(`/habits/${id}`);
  },

  create: async (data: CreateHabitDto) => {
    return apiClient.post<Habit>('/habits', data);
  },

  update: async (id: string, data: UpdateHabitDto) => {
    return apiClient.patch<Habit>(`/habits/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/habits/${id}`);
  },
};
