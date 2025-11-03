import { apiClient } from './client';

export interface HabitHiveAssignment {
  id: string;
  hiveId: string;
  habitId: string;
  assignedAt: string;
}

export interface CreateHabitHiveDto {
  hiveId: string;
  habitId: string;
  assignedAt?: string;
}

export const habitHivesApi = {
  create: async (data: CreateHabitHiveDto) => {
    return apiClient.post<HabitHiveAssignment>('/habit-hives', data);
  },
  getByHive: async (hiveId: string) => {
    return apiClient.get<HabitHiveAssignment[]>(`/habit-hives/hive/${hiveId}`);
  },
  delete: async (hiveId: string, habitId: string) => {
    return apiClient.delete(`/habit-hives/hive/${hiveId}/habit/${habitId}`);
  },
};
