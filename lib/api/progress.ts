const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5173';

export enum ProgressStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
}

export interface Progress {
  id: string;
  hiveId: string;
  userId: string;
  habitId: string;
  date: string;
  status: ProgressStatus;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  habit?: {
    id: string;
    title: string;
    type: string;
    evidenceType: string;
  };
  hive?: {
    id: string;
    name: string;
  };
  verifier?: {
    id: string;
    name: string;
  };
}

export interface CreateProgressDto {
  hiveId: string;
  userId: string;
  habitId: string;
  date: string;
  status?: ProgressStatus;
}

export interface UpdateProgressDto {
  status?: ProgressStatus;
  verifiedBy?: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  completionRate: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ProgressApi {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.message || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  async getAll(limit = 50, offset = 0): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progress?limit=${limit}&offset=${offset}`
    );
  }

  async getById(id: string): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progress/${id}`);
  }

  async getByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progress/user/${userId}?limit=${limit}&offset=${offset}`
    );
  }

  async getByHive(
    hiveId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progress/hive/${hiveId}?limit=${limit}&offset=${offset}`
    );
  }

  async getByHabit(
    habitId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progress/habit/${habitId}?limit=${limit}&offset=${offset}`
    );
  }

  async getByUserAndHive(
    userId: string,
    hiveId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progress/user/${userId}/hive/${hiveId}?limit=${limit}&offset=${offset}`
    );
  }

  async getUserStats(userId: string): Promise<ApiResponse<ProgressStats>> {
    return this.request<ProgressStats>(`/progress/user/${userId}/stats`);
  }

  async getHiveStats(hiveId: string): Promise<ApiResponse<ProgressStats>> {
    return this.request<ProgressStats>(`/progress/hive/${hiveId}/stats`);
  }

  async getTodayByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progress/user/${userId}/today?limit=${limit}&offset=${offset}`
    );
  }

  async getStreak(
    userId: string,
    habitId: string
  ): Promise<ApiResponse<number>> {
    return this.request<number>(
      `/progress/user/${userId}/habit/${habitId}/streak`
    );
  }

  async create(
    createProgressDto: CreateProgressDto
  ): Promise<ApiResponse<Progress>> {
    return this.request<Progress>('/progress', {
      method: 'POST',
      body: JSON.stringify(createProgressDto),
    });
  }

  async update(
    id: string,
    updateProgressDto: UpdateProgressDto
  ): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateProgressDto),
    });
  }

  async updateStatus(
    id: string,
    status: ProgressStatus
  ): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progress/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async verify(id: string, verifiedBy: string): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progress/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verifiedBy }),
    });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/progress/${id}`, {
      method: 'DELETE',
    });
  }
}

export const progressApi = new ProgressApi();
