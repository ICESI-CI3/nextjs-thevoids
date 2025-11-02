import { apiClient } from './client';
import { HabitType } from './habits';

export enum HiveStatus {
  CANCELLED = 'cancelled',
  FINISHED = 'finished',
  IN_PROGRESS = 'in_progress',
  OPEN = 'open',
}

export interface Hive {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  durationDays: number;
  entryFee: number;
  eliminationType: string;
  allowedHabitTypes: HabitType[];
  status: HiveStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  members?: HiveMemberSummary[];
  _count?: {
    members: number;
  };
}

export interface HiveMemberSummary {
  id: string;
  userId: string;
  role: string;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateHiveDto {
  name: string;
  description?: string;
  durationDays: number;
  entryFee?: number;
  eliminationType?: string;
  allowedHabitTypes?: HabitType[];
  isPublic?: boolean;
}

export interface UpdateHiveDto {
  name?: string;
  description?: string;
  durationDays?: number;
  entryFee?: number;
  eliminationType?: string;
  allowedHabitTypes?: HabitType[];
  status?: HiveStatus;
  isPublic?: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const hivesApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<Hive[]>(`/hives${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Hive>(`/hives/${id}`);
  },

  create: async (data: CreateHiveDto) => {
    return apiClient.post<Hive>('/hives', data);
  },

  update: async (id: string, data: UpdateHiveDto) => {
    return apiClient.patch<Hive>(`/hives/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/hives/${id}`);
  },
};
