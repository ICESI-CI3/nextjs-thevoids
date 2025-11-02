import { apiClient } from './client';

export enum MemberRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  OWNER = 'owner',
}

export enum MemberStatus {
  ACTIVE = 'active',
  ELIMINATED = 'eliminated',
  LEFT = 'left',
}

export interface HiveMember {
  id: string;
  hiveId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  hive?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateHiveMemberDto {
  hiveId: string;
  userId: string;
  role?: MemberRole;
}

export interface UpdateHiveMemberDto {
  role?: MemberRole;
  status?: MemberStatus;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const hiveMembersApi = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return apiClient.get<HiveMember[]>(
      `/hive-members${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: string) => {
    return apiClient.get<HiveMember>(`/hive-members/${id}`);
  },

  getByHive: async (hiveId: string) => {
    return apiClient.get<HiveMember[]>(`/hive-members/hive/${hiveId}`);
  },

  create: async (data: CreateHiveMemberDto) => {
    return apiClient.post<HiveMember>('/hive-members', data);
  },

  update: async (id: string, data: UpdateHiveMemberDto) => {
    return apiClient.patch<HiveMember>(`/hive-members/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/hive-members/${id}`);
  },
};
