const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  evidenceUrl?: string;
  evidenceNotes?: string;
  witnessName?: string;
  witnessContact?: string;
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
  verifiedBy?: string;
  evidenceNotes?: string;
  witnessName?: string;
  witnessContact?: string;
  evidenceFile?: File;
}

export interface UpdateProgressDto {
  status?: ProgressStatus;
  verifiedBy?: string;
  evidenceNotes?: string;
  witnessName?: string;
  witnessContact?: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  completionRate: number;
  userId?: string;
  hiveId?: string;
  habitId?: string;
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
      const isFormData = options?.body instanceof FormData;

      const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      });

      if (options?.headers) {
        const extraHeaders = new Headers(options.headers as HeadersInit);
        extraHeaders.forEach((value, key) => headers.set(key, value));
      }

      if (isFormData) {
        headers.delete('Content-Type');
      }

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

      if (response.status === 204) {
        return { data: undefined };
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = (await response.json()) as T;
        return { data };
      }

      return { data: undefined };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  async getAll(limit = 50, offset = 0): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progresses?limit=${limit}&offset=${offset}`
    );
  }

  async getById(id: string): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progresses/${id}`);
  }

  async getByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progresses/user/${userId}?limit=${limit}&offset=${offset}`
    );
  }

  async getByHive(
    hiveId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progresses/hive/${hiveId}?limit=${limit}&offset=${offset}`
    );
  }

  async getByHabit(
    habitId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progresses/habit/${habitId}?limit=${limit}&offset=${offset}`
    );
  }

  async getByUserAndHive(
    userId: string,
    hiveId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progresses/user/${userId}/hive/${hiveId}?limit=${limit}&offset=${offset}`
    );
  }

  async getUserStats(userId: string): Promise<ApiResponse<ProgressStats>> {
    return this.request<ProgressStats>(`/progresses/stats/user/${userId}`);
  }

  async getHiveStats(hiveId: string): Promise<ApiResponse<ProgressStats>> {
    return this.request<ProgressStats>(`/progresses/stats/hive/${hiveId}`);
  }

  async getTodayByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<Progress[]>> {
    return this.request<Progress[]>(
      `/progresses/today/user/${userId}?limit=${limit}&offset=${offset}`
    );
  }

  async getStreak(
    userId: string,
    habitId: string
  ): Promise<ApiResponse<number>> {
    return this.request<number>(
      `/progresses/streak/user/${userId}/habit/${habitId}`
    );
  }

  async create(
    createProgressDto: CreateProgressDto
  ): Promise<ApiResponse<Progress>> {
    const { evidenceFile, ...rest } = createProgressDto;

    if (evidenceFile) {
      const formData = new FormData();

      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, String(value));
      });

      formData.append('evidence', evidenceFile);

      return this.request<Progress>('/progresses', {
        method: 'POST',
        body: formData,
      });
    }

    return this.request<Progress>('/progresses', {
      method: 'POST',
      body: JSON.stringify(rest),
    });
  }

  async update(
    id: string,
    updateProgressDto: UpdateProgressDto
  ): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateProgressDto),
    });
  }

  async updateStatus(
    id: string,
    status: ProgressStatus
  ): Promise<ApiResponse<Progress>> {
    return this.request<Progress>(`/progresses/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  async verify(id: string, verifiedBy: string): Promise<ApiResponse<Progress>> {
    const query = new URLSearchParams({ verifiedBy }).toString();
    return this.request<Progress>(`/progresses/${id}/verify?${query}`, {
      method: 'PATCH',
    });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/progresses/${id}`, {
      method: 'DELETE',
    });
  }
}

export const progressApi = new ProgressApi();
