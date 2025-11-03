const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const isFormData = options.body instanceof FormData;

      const headers = new Headers({
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      });

      if (options.headers) {
        const extraHeaders = new Headers(options.headers as HeadersInit);
        extraHeaders.forEach((value, key) => {
          headers.set(key, value);
        });
      }

      if (isFormData) {
        headers.delete('Content-Type');
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const status = response.status;

      if (status === 204) {
        return { status, data: undefined };
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : undefined;

      if (!response.ok) {
        // Manejo específico de errores HTTP comunes
        let errorMessage = data.message || 'An error occurred';

        if (status === 409) {
          errorMessage =
            data.message || 'Conflicto: el recurso ya existe o está en uso';
        } else if (status === 404) {
          errorMessage = data.message || 'Recurso no encontrado';
        } else if (status === 400) {
          errorMessage = data.message || 'Datos inválidos';
        } else if (status === 401) {
          errorMessage = 'No autorizado. Por favor, inicie sesión';
        } else if (status === 403) {
          errorMessage = 'No tiene permisos para realizar esta acción';
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor';
        }

        return {
          status,
          error: errorMessage,
        };
      }

      return { status, data };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
